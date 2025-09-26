# PowerShell script
param (
    [string]$REGISTRY_URL,
    [string]$VERSION_SUFFIX
)

function ValidateString {
  param (
      [string]$variable,
      [string]$message
  )

  if (-not $variable) {
      Write-Host "ERROR: $message! Exiting script..." -ForegroundColor White -BackgroundColor Red -NoNewline
      exit 1
  }
}

# Read and validate package.json
$PACKAGE_JSON_STRING = Get-Content -Path "package.json" | Out-String
$PACKAGE_JSON_OBJECT = ConvertFrom-Json -InputObject $PACKAGE_JSON_STRING

ValidateString $PACKAGE_JSON_STRING "'package.json' not found"
ValidateString $PACKAGE_JSON_OBJECT.name "'name' not found in package.json. See https://docs.npmjs.com/files/package.json"
ValidateString $PACKAGE_JSON_OBJECT.version "'version' not found in package.json. See https://docs.npmjs.com/files/package.json"

# Format code
Write-Host "Formatting the app..." -ForegroundColor White -BackgroundColor DarkBlue
npm run format
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: App format failed! Exiting script..." -ForegroundColor White -BackgroundColor Red -NoNewline
    exit 1
}
Write-Host "Successfully formatted the app!" -ForegroundColor White -BackgroundColor DarkGreen

# Lint app
Write-Host "Linting the app..." -ForegroundColor White -BackgroundColor DarkBlue
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: App lint failed! Exiting script..." -ForegroundColor White -BackgroundColor Red -NoNewline
    exit 1
}
Write-Host "Successfully lint app!" -ForegroundColor White -BackgroundColor DarkGreen

# Update package version
npm run version:patch

# Re-read package.json after version update
$PACKAGE_JSON_STRING = Get-Content -Path "package.json" | Out-String
$PACKAGE_JSON_OBJECT = ConvertFrom-Json -InputObject $PACKAGE_JSON_STRING

# Fallback: prompt user with a default value if REGISTRY_URL or VERSION_SUFFIX is not provided
if (-not $REGISTRY_URL) {
    $defaultRegistry = "avema0512/fe"
    $userInput = Read-Host "Enter docker registry URL [$defaultRegistry]"
    $REGISTRY_URL = if ($userInput) { $userInput } else { $defaultRegistry }
}
if (-not $VERSION_SUFFIX) {
    $defaultSuffix =  $PACKAGE_JSON_OBJECT.version
    $userInput = Read-Host "Enter production version suffix [$defaultSuffix]"
    $VERSION_SUFFIX = if ($userInput) { $userInput } else { $defaultSuffix }
}

# Extract image information
$IMAGE_NAME = $PACKAGE_JSON_OBJECT.name
$IMAGE_VERSION = $PACKAGE_JSON_OBJECT.version
$IMAGE_TAG = "$IMAGE_NAME-$IMAGE_VERSION.$VERSION_SUFFIX"

# Update version
node .\scripts\update-version.js $IMAGE_VERSION $VERSION_SUFFIX

# Build and push docker image
docker version

if ($LASTEXITCODE -ne 0) {
  Write-Host "Error: Docker error! If the app version have been changed, please revert it manually in package.json. Exiting script..." -ForegroundColor White -BackgroundColor Red -NoNewline
  exit 1
}

Write-Host "Building the Image [$IMAGE_TAG]..." -ForegroundColor White -BackgroundColor DarkBlue

docker build -t $IMAGE_TAG .

if ($LASTEXITCODE -ne 0) {
  Write-Host "Error: Docker build failed! If the app version have been changed, please revert it manually in package.json. Exiting script..." -ForegroundColor White -BackgroundColor Red -NoNewline
  exit 1
}

Write-Host "Successfully built the Image [$IMAGE_TAG]!"  -ForegroundColor White -BackgroundColor DarkGreen

docker tag $IMAGE_TAG "$REGISTRY_URL`:$IMAGE_TAG"

if ($LASTEXITCODE -ne 0) {
  Write-Host "Error: Docker tag failed! If the app version have been changed, please revert it manually in package.json. Exiting script..." -ForegroundColor White -BackgroundColor Red -NoNewline
  exit 1
}

Write-Host "Pushing the Image [$IMAGE_TAG] to Docker Registry [$REGISTRY_URL]..." -ForegroundColor White -BackgroundColor DarkBlue

docker push "$REGISTRY_URL`:$IMAGE_TAG"

if ($LASTEXITCODE -ne 0) {
  Write-Host "Error: Docker push failed! If the app version have been changed, please revert it manually in package.json. Exiting script..." -ForegroundColor White -BackgroundColor Red -NoNewline
  exit 1
}

Write-Host "Successfully pushed the Image [$IMAGE_TAG] to Docker [$REGISTRY_URL]!" -ForegroundColor White -BackgroundColor DarkGreen -NoNewline
