locals {
  region_short = substr(var.region, 0, 3)
}

locals {
  common_tags = {
    product = "User Feedback"
    owner = "sikander.ali@nhs.net"
    expires = "Never"
    environment = var.env
  }
}
