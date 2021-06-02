locals {
  region_short = substr(var.region, 0, 3)
}

locals {
  common_tags = {
    product = "User Feedback"
    owner = "mike.monteith@nhs.net"
    expires = "Never"
    environment = var.env
  }
}
