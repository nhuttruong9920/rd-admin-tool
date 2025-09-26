#!/bin/bash

REGISTRY_URL="$1"
VERSION_SUFFIX="$2"

# Validate required string
validate_string() {
  local variable="$1"
  local message="$2"
  if [ -z "$variable" ]; then
    echo -e "\033[41;97mERROR: $message! Exiting script...\033[0m"
    exit 1
  fi
}

# Read and validate package.json
PACKAGE_JSON_STRING=$(cat package.json)
validate_string "$PACKAGE_JSON_STRING" "'package.json' not found"

PACKAGE_NAME=$(jq -r '.name' package.json)
PACKAGE_VERSION=$(jq -r '.version' package.json)

validate_string "$PACKAGE_NAME" "'name' not found in package.json. See https://docs.npmjs.com/files/package.json"
validate_string "$PACKAGE_VERSION" "'version' not found in package.json. See https://docs.npmjs.com/files/package.json"

# Format the app
echo -e "\033[44;97mFormatting the app...\033[0m"
npm run format
if [ $? -ne 0 ]; then
  echo -e "\033[41;97mError: App format failed! Exiting script...\033[0m"
  exit 1
fi
echo -e "\033[42;97mSuccessfully formatted the app!\033[0m"

# Lint the app
echo -e "\033[44;97mLinting the app...\033[0m"
npm run lint
if [ $? -ne 0 ]; then
  echo -e "\033[41;97mError: App lint failed! Exiting script...\033[0m"
  exit 1
fi
echo -e "\033[42;97mSuccessfully lint app!\033[0m"

# Update package version
npm run version:patch

# Re-read package version
PACKAGE_VERSION=$(jq -r '.version' package.json)

# Fallbacks
if [ -z "$REGISTRY_URL" ]; then
  read -p "Enter docker registry URL [avema0512/fe]: " input_registry
  REGISTRY_URL="${input_registry:-avema0512/fe}"
fi

if [ -z "$VERSION_SUFFIX" ]; then
  read -p "Enter production version suffix [$PACKAGE_VERSION]: " input_suffix
  VERSION_SUFFIX="${input_suffix:-$PACKAGE_VERSION}"
fi

# Update version via Node.js script
node ./scripts/update-version.js

IMAGE_NAME="$PACKAGE_NAME"
IMAGE_VERSION="$PACKAGE_VERSION"
IMAGE_TAG="${IMAGE_NAME}-${IMAGE_VERSION}.${VERSION_SUFFIX}"

# Check Docker
docker version >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "\033[41;97mError: Docker error! If the app version has been changed, please revert it manually in package.json. Exiting script...\033[0m"
  exit 1
fi

echo -e "\033[44;97mBuilding the Image [$IMAGE_TAG]...\033[0m"
docker build -t "$IMAGE_TAG" .
if [ $? -ne 0 ]; then
  echo -e "\033[41;97mError: Docker build failed! If the app version has been changed, please revert it manually in package.json. Exiting script...\033[0m"
  exit 1
fi
echo -e "\033[42;97mSuccessfully built the Image [$IMAGE_TAG]!\033[0m"

docker tag "$IMAGE_TAG" "$REGISTRY_URL:$IMAGE_TAG"
if [ $? -ne 0 ]; then
  echo -e "\033[41;97mError: Docker tag failed! If the app version has been changed, please revert it manually in package.json. Exiting script...\033[0m"
  exit 1
fi

echo -e "\033[44;97mPushing the Image [$IMAGE_TAG] to Docker Registry [$REGISTRY_URL]...\033[0m"
docker push "$REGISTRY_URL:$IMAGE_TAG"
if [ $? -ne 0 ]; then
  echo -e "\033[41;97mError: Docker push failed! If the app version has been changed, please revert it manually in package.json. Exiting script...\033[0m"
  exit 1
fi

echo -e "\033[42;97mSuccessfully pushed the Image [$IMAGE_TAG] to Docker [$REGISTRY_URL]!\033[0m"
