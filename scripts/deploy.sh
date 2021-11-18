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

mkdir -p "dist"
ZIP_FILE_PATH="dist/build.zip"

# Create zip file of entire project, excluding some directories.
zip -r "$ZIP_FILE_PATH" . -x ".git/*" -x "dist/*" -x "terraform/*" -x "node_modules/*" -x "tests/*"


# Initialize terraform with Azure backend configs
terraform -chdir=./terraform init \
    -backend-config="resource_group_name=nhsuk-user-feedback-rg-tfstate-$ENV-$REGION" \
    -backend-config="storage_account_name=nhsukfeedbacktstate$ENV"

# Apply terraform changes
terraform -chdir=./terraform apply \
    -auto-approve \
    -var-file="vars/$ENV.tfvars"

# Get terraform outputs required for the functionapp deployment
RESOURCE_GROUP=$(terraform -chdir=./terraform output -raw resource_group_name)
FUNCTION_APP_NAME=$(terraform -chdir=./terraform output -raw function_app_name)

# Deploy to the functionapp
az functionapp deployment source config-zip \
  -g $RESOURCE_GROUP \
  -n $FUNCTION_APP_NAME \
  --src $ZIP_FILE_PATH \
  --build-remote true

# Trigger the setup function. The setup function contains code which should be run once per deployment

# Get setup function URL and key
SETUP_FUNCTION_URL=$(az functionapp function show --resource-group $RESOURCE_GROUP --name $FUNCTION_APP_NAME --function-name setup --query "invokeUrlTemplate" --output tsv)
SETUP_FUNCTION_KEY=$(az functionapp function keys list --resource-group $RESOURCE_GROUP --name $FUNCTION_APP_NAME --function-name setup --query "default" --output tsv)

# Empty POST request to the setup function, with an auth header.
curl -v --header "x-functions-key: $SETUP_FUNCTION_KEY" -d "" $SETUP_FUNCTION_URL
