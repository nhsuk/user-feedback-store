variable "env" {
  description = "Environment short name e.g dev, stag, prod"
  type        = string
}

variable "region" {
  description = "Azure region"
  type        = string
}

variable "enable_cors" {
  description = "Allow all domains for cross-origin requests"
  type        = bool
  default     = false
}
