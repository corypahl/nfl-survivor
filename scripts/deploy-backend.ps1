param(
  [Parameter(Mandatory = $true)]
  [string]$Email,
  [string]$Region = "us-east-1",
  [string]$StackName = "nfl-survivor",
  [string]$AllowedOrigin = "https://corypahl.github.io"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$templatePath = Join-Path $repoRoot "infra\cloudformation.yml"

aws cloudformation deploy `
  --region $Region `
  --stack-name $StackName `
  --template-file $templatePath `
  --capabilities CAPABILITY_IAM `
  --parameter-overrides "AllowedOrigin=$AllowedOrigin" `
  --no-fail-on-empty-changeset
if ($LASTEXITCODE -ne 0) { throw "CloudFormation deployment failed." }

$outputsJson = aws cloudformation describe-stacks `
  --region $Region `
  --stack-name $StackName `
  --query "Stacks[0].Outputs" `
  --output json
if ($LASTEXITCODE -ne 0) { throw "Could not read CloudFormation outputs." }
$outputs = $outputsJson | ConvertFrom-Json

function Get-StackOutput([string]$key) {
  return ($outputs | Where-Object { $_.OutputKey -eq $key }).OutputValue
}

$userPoolId = Get-StackOutput "UserPoolId"
$clientId = Get-StackOutput "UserPoolClientId"
$apiUrl = Get-StackOutput "ApiUrl"

$createUserOutput = aws cognito-idp admin-create-user `
  --region $Region `
  --user-pool-id $userPoolId `
  --username $Email `
  --user-attributes "Name=email,Value=$Email" "Name=email_verified,Value=true" `
  --desired-delivery-mediums EMAIL 2>&1

if ($LASTEXITCODE -eq 0) {
  Write-Host "Cognito invitation sent to $Email."
} elseif ($createUserOutput -match "UsernameExistsException") {
  Write-Host "The Cognito user may already exist; continuing with repository variables."
} else {
  throw "Could not create the Cognito user: $createUserOutput"
}

gh variable set VITE_AWS_REGION --body $Region
if ($LASTEXITCODE -ne 0) { throw "Could not set VITE_AWS_REGION." }
gh variable set VITE_COGNITO_USER_POOL_ID --body $userPoolId
if ($LASTEXITCODE -ne 0) { throw "Could not set VITE_COGNITO_USER_POOL_ID." }
gh variable set VITE_COGNITO_USER_POOL_CLIENT_ID --body $clientId
if ($LASTEXITCODE -ne 0) { throw "Could not set VITE_COGNITO_USER_POOL_CLIENT_ID." }
gh variable set VITE_PICK_API_URL --body $apiUrl
if ($LASTEXITCODE -ne 0) { throw "Could not set VITE_PICK_API_URL." }

Write-Host "Backend deployed and GitHub repository variables updated."
Write-Host "Push or rerun the GitHub Pages workflow to publish pick sync."
