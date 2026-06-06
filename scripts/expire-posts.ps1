param(
  [int]$BatchSize = 100
)

$ErrorActionPreference = "Stop"

if (-not $env:SUPABASE_FUNCTIONS_URL) {
  throw "SUPABASE_FUNCTIONS_URL is required, for example https://PROJECT_REF.functions.supabase.co"
}

$headers = @{
  "Content-Type" = "application/json"
}

if ($env:POST_EXPIRATION_JOB_SECRET) {
  $headers["x-job-secret"] = $env:POST_EXPIRATION_JOB_SECRET
}

$body = @{
  batchSize = $BatchSize
} | ConvertTo-Json

$response = Invoke-RestMethod `
  -Method Post `
  -Uri "$($env:SUPABASE_FUNCTIONS_URL.TrimEnd('/'))/expire-posts" `
  -Headers $headers `
  -Body $body

$response | ConvertTo-Json
