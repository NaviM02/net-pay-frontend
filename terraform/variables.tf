variable "aws_region" {
  type    = string
  default = "us-east-2"
}
variable "project_name" {
  type    = string
  default = "netpay-frontend"
}
variable "instance_type" {
  type    = string
  default = "t3.micro"
  validation {
    condition     = contains(["t3.micro", "t3.small"], var.instance_type)
    error_message = "Use t3.micro or t3.small (x86_64)."
  }
}
variable "github_actions_user_name" {
  type    = string
  default = "netpay-github-actions"
}
variable "acme_email" {
  type = string
  validation {
    condition     = can(regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", var.acme_email))
    error_message = "Enter a valid contact email."
  }
}
