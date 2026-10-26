output "instance_id" { value = aws_instance.frontend.id }
output "public_ip" { value = aws_eip.frontend.public_ip }
output "https_url" { value = "https://${aws_eip.frontend.public_ip}" }
output "ecr_repository_url" { value = aws_ecr_repository.frontend.repository_url }
output "ssm_deploy_document" { value = aws_ssm_document.deploy.name }
output "github_actions_user_name" { value = data.aws_iam_user.github_actions.user_name }
