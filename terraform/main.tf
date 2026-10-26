data "aws_caller_identity" "current" {}
data "aws_partition" "current" {}
data "aws_availability_zones" "available" { state = "available" }
data "aws_ssm_parameter" "amazon_linux_2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}
data "aws_iam_user" "github_actions" { user_name = var.github_actions_user_name }

locals {
  prefix = "arn:${data.aws_partition.current.partition}"
}

resource "aws_vpc" "frontend" {
  cidr_block           = "10.41.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = { Name = "${var.project_name}-vpc" }
}
resource "aws_internet_gateway" "frontend" { vpc_id = aws_vpc.frontend.id }
resource "aws_subnet" "frontend" {
  vpc_id                  = aws_vpc.frontend.id
  cidr_block              = "10.41.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true
  tags                    = { Name = "${var.project_name}-public" }
}
resource "aws_route_table" "frontend" {
  vpc_id = aws_vpc.frontend.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.frontend.id
  }
}
resource "aws_route_table_association" "frontend" {
  subnet_id      = aws_subnet.frontend.id
  route_table_id = aws_route_table.frontend.id
}
resource "aws_security_group" "frontend" {
  name   = var.project_name
  vpc_id = aws_vpc.frontend.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
resource "aws_ecr_repository" "frontend" {
  name                 = var.project_name
  image_tag_mutability = "IMMUTABLE"
  encryption_configuration { encryption_type = "AES256" }
  image_scanning_configuration { scan_on_push = true }
}
resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name
  policy = jsonencode({ rules = [{
    rulePriority = 1
    description  = "Keep latest 12 releases"
    selection    = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 12 }
    action       = { type = "expire" }
  }] })
}
resource "aws_iam_role" "frontend" {
  name = "${var.project_name}-ec2"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.frontend.name
  policy_arn = "${local.prefix}:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
resource "aws_iam_role_policy" "ecr" {
  name = "frontend-image-read"
  role = aws_iam_role.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["ecr:GetAuthorizationToken"], Resource = "*" },
      { Effect = "Allow", Action = ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer", "ecr:BatchCheckLayerAvailability"], Resource = aws_ecr_repository.frontend.arn }
    ]
  })
}
resource "aws_iam_instance_profile" "frontend" {
  name = "${var.project_name}-ec2"
  role = aws_iam_role.frontend.name
}
resource "aws_eip" "frontend" {
  domain = "vpc"
  tags   = { Name = var.project_name }
}
resource "aws_instance" "frontend" {
  ami                         = data.aws_ssm_parameter.amazon_linux_2023.value
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.frontend.id
  vpc_security_group_ids      = [aws_security_group.frontend.id]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.frontend.name
  user_data = templatefile("${path.module}/user-data.sh.tftpl", {
    region          = var.aws_region
    repository      = aws_ecr_repository.frontend.repository_url
    host            = aws_eip.frontend.public_ip
    email           = var.acme_email
    compose_content = file("${path.module}/../compose.prod.yml")
    start_content   = file("${path.module}/../deploy/instance-start.sh")
    release_content = file("${path.module}/../deploy/release.sh")
  })
  user_data_replace_on_change = false
  metadata_options {
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }
  credit_specification { cpu_credits = "standard" }
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 12
    encrypted             = true
    delete_on_termination = true
  }
  tags       = { Name = var.project_name }
  depends_on = [aws_route_table_association.frontend, aws_iam_role_policy_attachment.ssm, aws_iam_role_policy.ecr]
}
resource "aws_eip_association" "frontend" {
  allocation_id = aws_eip.frontend.id
  instance_id   = aws_instance.frontend.id
}
resource "aws_ssm_document" "deploy" {
  name          = "${var.project_name}-deploy"
  document_type = "Command"
  content = jsonencode({
    schemaVersion = "2.2"
    parameters = { Release = {
      type = "String", allowedPattern = "^[a-f0-9]{40}$", interpolationType = "ENV_VAR"
    } }
    mainSteps = [{
      action = "aws:runShellScript", name = "deploy"
      inputs = { timeoutSeconds = "600", runCommand = ["set -eu", "sudo /usr/local/bin/netpay-frontend-release \"$SSM_Release\""] }
    }]
  })
}
# Separate policy on the existing user: backend permissions remain managed there.
resource "aws_iam_user_policy" "github_actions_frontend" {
  name = "${var.project_name}-deploy"
  user = data.aws_iam_user.github_actions.user_name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["ecr:GetAuthorizationToken"], Resource = "*" },
      { Effect = "Allow", Action = ["ecr:BatchCheckLayerAvailability", "ecr:InitiateLayerUpload", "ecr:UploadLayerPart", "ecr:CompleteLayerUpload", "ecr:PutImage", "ecr:DescribeImages"], Resource = aws_ecr_repository.frontend.arn },
      { Effect = "Allow", Action = ["ssm:SendCommand"], Resource = [aws_ssm_document.deploy.arn, aws_instance.frontend.arn] },
      { Effect = "Allow", Action = ["ssm:GetCommandInvocation"], Resource = "*" }
    ]
  })
}
