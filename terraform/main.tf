# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = ">= 3.94.0"
    }
  }

  backend "azurerm" {
    # We need to configure a different backend for different environments, so we use the following environment
    # variables when running terraform init instead of putting the resource group and storage account
    # config here as you normally would.
    # Use these variables:
    # -backend-config="resource_group_name=nhsuk-user-feedback-rg-tfstate-${ENV}-${REGION_SHORT}"
    # -backend-config="storage_account_name=nhsukfeedbacktstate${ENV}"
    container_name        = "tstate"
    key                   = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_resource_group" "rg" {
  name     = "nhsuk-user-feedback-rg-${var.env}-${local.region_short}"
}

resource "azurerm_storage_account" "storage_account" {
  name                     = "nhsukfeedback${var.env}${local.region_short}"
  resource_group_name      = data.azurerm_resource_group.rg.name
  location                 = data.azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = local.common_tags
  min_tls_version                 = "TLS1_2"
}

resource "azurerm_service_plan" "service_plan" {
  name                = "nhsuk-user-feedback-plan-${var.env}-${local.region_short}"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  os_type             = "Linux"
  tags                = local.common_tags

  sku_name = "Y1"
}

resource "azurerm_application_insights" "application_insights" {
  name                = "nhsuk-user-feedback-func-${var.env}-${local.region_short}"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  tags                = local.common_tags
  application_type    = "web"
}

resource "azurerm_cosmosdb_account" "db" {
  name                = "nhsuk-user-feedback-db-${var.env}"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  tags                = local.common_tags
  offer_type          = "Standard"
  kind                = "MongoDB"

  capabilities {
    name = "EnableMongo"
  }

  consistency_policy {
    consistency_level       = "Session"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  geo_location {
    location          = data.azurerm_resource_group.rg.location
    failover_priority = 0
  }
}

resource "azurerm_linux_function_app" "function_app" {
  name                       = "nhsuk-user-feedback-func-${var.env}-${local.region_short}"
  location                   = data.azurerm_resource_group.rg.location
  resource_group_name        = data.azurerm_resource_group.rg.name
  service_plan_id            = azurerm_service_plan.service_plan.id
  storage_account_name       = azurerm_storage_account.storage_account.name
  storage_account_access_key = azurerm_storage_account.storage_account.primary_access_key
  tags                       = local.common_tags

  functions_extension_version = "~4"

  site_config {
    application_stack {
      # Currently there is a know issue where terraform will not support Node 20 runtime app setting
      # https://github.com/hashicorp/terraform-provider-azurerm/issues/23528
      # Once fixed node_version can be upped to 20 and the deploy.sh file updated to remove the workaround
      node_version = "18"
    }
    cors {
      allowed_origins = [var.enable_cors ? "*" : "https://www.nhs.uk"]
    }
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME = "node"
    APPINSIGHTS_INSTRUMENTATIONKEY = azurerm_application_insights.application_insights.instrumentation_key
    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.application_insights.connection_string
    WEBSITE_NODE_DEFAULT_VERSION: "~20"
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING: azurerm_storage_account.storage_account.primary_connection_string
    WEBSITE_CONTENTSHARE: "nhsuk-user-feedback-func-${var.env}-${local.region_short}"
    MONGO_CONNECTION_STRING: "${azurerm_cosmosdb_account.db.connection_strings.0}&maxIdleTimeMS=120000"
    SCM_DO_BUILD_DURING_DEPLOYMENT: "true"
  }
}
