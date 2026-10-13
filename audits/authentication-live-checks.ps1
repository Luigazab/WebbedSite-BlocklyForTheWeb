$ErrorActionPreference = 'Stop'
# Read-only public HTTP checks. Does not create users or send emails.
# API keys remain in process memory and are never printed.
$taskEnv = @{}
foreach ($taskLine in (Get-Content -LiteralPath (Join-Path $PSScriptRoot '..\.env'))) {
  if ($taskLine -match '^\s*([A-Z0-9_]+)\s*=\s*(.*)$') {
    $taskEnv[$Matches[1]] = $Matches[2].Trim().Trim('"').Trim("'")
  }
}
$taskApi = $taskEnv['VITE_SUPABASE_URL']
$taskKey = $taskEnv['VITE_SUPABASE_ANON_KEY']
$taskHeaders = @{ apikey = $taskKey; Prefer = 'count=exact' }
# Modern publishable keys go in apikey, not a Bearer JWT.
if ($taskKey.Split('.').Count -eq 3) { $taskHeaders.Authorization = 'Bearer ' + $taskKey }
$taskSettings = Invoke-RestMethod -Uri ($taskApi + '/auth/v1/settings') -Headers $taskHeaders -TimeoutSec 30
Write-Output ([pscustomobject]@{
  EmailAuthenticationEnabled = $taskSettings.external.email
  SignupDisabled = $taskSettings.disable_signup
  EmailAutoConfirmed = $taskSettings.mailer_autoconfirm
  AnonymousAccountsEnabled = $taskSettings.external.anonymous_users
} | ConvertTo-Json)
foreach ($taskResource in @('profiles?select=email&limit=0', 'classroom_courses?select=*&limit=0', 'classrooms?select=id,teacher:profile_directory!teacher_id(id,username,avatar_url)&limit=0', 'notifications?select=id,from_user:profile_directory!notifications_from_user_id_fkey(username,avatar_url)&limit=0')) {
  try {
    $taskResponse = Invoke-WebRequest -Uri ($taskApi + '/rest/v1/' + $taskResource) -Headers $taskHeaders -UseBasicParsing -TimeoutSec 30
    Write-Output ([pscustomobject]@{
      AnonymousQuery = $taskResource
      Status = [int]$taskResponse.StatusCode
      ContentRange = [string]$taskResponse.Headers['Content-Range']
      Body = [string]$taskResponse.Content
    } | ConvertTo-Json)
  } catch {
    $taskHttpFailure = $_
    $taskApiError = $null
    try { $taskApiError = $taskHttpFailure.ErrorDetails.Message | ConvertFrom-Json } catch { }
    Write-Output ([pscustomobject]@{ AnonymousQuery = $taskResource; Status = [int]$taskHttpFailure.Exception.Response.StatusCode; ErrorCode = $taskApiError.code } | ConvertTo-Json)
  }
}
# Screening endpoints are read-only; these examples never create credentials.
foreach ($taskScreenPassword in @('short', 'passwordpassword', ('auth-audit-' + [guid]::NewGuid().ToString('N')))) {
  $taskScreenBody = @{ password = $taskScreenPassword } | ConvertTo-Json
  try {
    $taskScreenResponse = Invoke-WebRequest -Uri ($taskApi + '/functions/v1/password-policy') -Method Post -Headers $taskHeaders -ContentType 'application/json' -Body $taskScreenBody -UseBasicParsing -TimeoutSec 30
    Write-Output ('Password screening status: ' + [int]$taskScreenResponse.StatusCode)
  } catch {
    Write-Output ('Password screening status: ' + [int]$_.Exception.Response.StatusCode)
  }
}
try {
  $taskAdminResponse = Invoke-WebRequest -Uri ($taskApi + '/functions/v1/admin-auth') -Method Post -Headers $taskHeaders -ContentType 'application/json' -Body '{"action":"reset-password"}' -UseBasicParsing -TimeoutSec 30
  Write-Output ('Unauthenticated admin endpoint status: ' + [int]$taskAdminResponse.StatusCode)
} catch {
  Write-Output ('Unauthenticated admin endpoint status: ' + [int]$_.Exception.Response.StatusCode)
}
$taskWebsite = 'https://webbedsite.fun'
$taskPage = Invoke-WebRequest -Uri ($taskWebsite + '/login') -UseBasicParsing -TimeoutSec 30
$taskHeaderNames = @('Strict-Transport-Security','Content-Security-Policy','X-Frame-Options','Referrer-Policy','X-Content-Type-Options')
foreach ($taskHeaderName in $taskHeaderNames) {
  Write-Output ($taskHeaderName + ': ' + [string]$taskPage.Headers[$taskHeaderName])
}
$taskAssetMatches = [regex]::Matches($taskPage.Content, '<script\b[^>]*\bsrc="([^"]+)"')
foreach ($taskAssetMatch in $taskAssetMatches) {
  $taskAssetUrl = [uri]::new([uri]$taskWebsite, $taskAssetMatch.Groups[1].Value)
  if ($taskAssetUrl.Host -ne ([uri]$taskWebsite).Host) { continue }
  $taskAsset = Invoke-WebRequest -Uri $taskAssetUrl.AbsoluteUri -UseBasicParsing -TimeoutSec 30
  $taskSupabaseMatches = [regex]::Matches($taskAsset.Content, 'https://[a-z0-9]+\.supabase\.co')
  $taskProjectUrls = @($taskSupabaseMatches | ForEach-Object { $_.Value } | Sort-Object -Unique)
  Write-Output ([pscustomobject]@{
    DeployedAsset = $taskAssetUrl.AbsoluteUri
    SupabaseProjectUrls = $taskProjectUrls
    MatchesLocalSupabaseProject = $taskProjectUrls -contains $taskApi
    ContainsRememberMeKey = $taskAsset.Content.Contains('remember-me')
    ContainsResetRoute = $taskAsset.Content.Contains('/update-password')
  } | ConvertTo-Json)
}
# One negative login request with a reserved, nonexistent address; no account is created.
$taskLoginPayload = @{ email = 'auth-audit-20261013@example.invalid'; password = 'invalid-audit-password' } | ConvertTo-Json
try {
  $taskLoginResponse = Invoke-WebRequest -Uri ($taskApi + '/auth/v1/token?grant_type=password') -Method Post -Headers $taskHeaders -ContentType 'application/json' -Body $taskLoginPayload -UseBasicParsing -TimeoutSec 30
  Write-Output ('Unexpected negative login status: ' + [int]$taskLoginResponse.StatusCode)
} catch {
  $taskLoginError = $null
  try { $taskLoginError = $_.ErrorDetails.Message | ConvertFrom-Json } catch { }
  Write-Output ([pscustomobject]@{
    NegativeLoginStatus = [int]$_.Exception.Response.StatusCode
    ErrorCode = $taskLoginError.error_code
    ErrorMessage = $taskLoginError.msg
  } | ConvertTo-Json)
}
