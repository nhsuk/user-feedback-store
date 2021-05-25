#!/bin/bash

for i in "$@"
do
case $i in
    --env=*)
    ENV="${i#*=}"
    shift # past argument=value
    ;;
    --region=*)
    REGION="${i#*=}"
    shift # past argument=value
    ;;
    *)
          # unknown option
    ;;
esac
done

if [[ -z "$ENV" ]]; then
    echo "--env option must be provided"
    exit 1
fi
if [[ -z "$REGION" ]]; then
    echo "--region option must be provided"
    exit 1
fi

echo "ENV = $ENV"
echo "REGION = $REGION"

set -e


RESOURCE_GROUP_NAME="nhsuk-user-feedback-rg-tfstate-$ENV-$REGION"
STORAGE_ACCOUNT_NAME="nhsukfeedbacktstate$ENV"
CONTAINER_NAME="tstate"

# This resource group should have been created for you by the infrastructure team
# az group create --name $RESOURCE_GROUP_NAME --location $REGION

# Create storage account
az storage account create --resource-group $RESOURCE_GROUP_NAME --name $STORAGE_ACCOUNT_NAME --sku Standard_LRS --encryption-services blob

# Get storage account key
ACCOUNT_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP_NAME --account-name $STORAGE_ACCOUNT_NAME --query '[0].value' -o tsv)

# Create blob container
az storage container create --name $CONTAINER_NAME --account-name $STORAGE_ACCOUNT_NAME --account-key $ACCOUNT_KEY

echo "storage_account_name: $STORAGE_ACCOUNT_NAME"
echo "container_name: $CONTAINER_NAME"
echo "access_key: $ACCOUNT_KEY"
