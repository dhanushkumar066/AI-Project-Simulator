$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "test$timestamp@example.com"

# Register user
$registerBody = @{
    name = "Test User"
    email = $email
    password = "password123"
    targetRole = "Software Engineer"
    experienceLevel = "fresher"
} | ConvertTo-Json

Write-Host "Registering user: $email"
$registerResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Body $registerBody `
    -ContentType "application/json" `
    -UseBasicParsing

$registerData = $registerResponse.Content | ConvertFrom-Json
$token = $registerData.token




Write-Host "Registration successful"
Write-Host "Token: $($token.Substring(0, 30))..."

# Start interview
$interviewBody = @{
    jobRole = "Software Engineer"
    experienceLevel = "fresher"
} | ConvertTo-Json

Write-Host "`nStarting interview..."
$interviewResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/interviews/start" `
    -Method POST `
    -Body $interviewBody `
    -ContentType "application/json" `
    -Headers @{ "Authorization" = "Bearer $token" } `
    -UseBasicParsing

$interviewData = $interviewResponse.Content | ConvertFrom-Json

Write-Host "Interview started"
Write-Host "Interview ID: $($interviewData.interviewId)"
Write-Host "Number of questions: $($interviewData.questions.Count)"

if ($interviewData.questions.Count -gt 0) {
    Write-Host "`nQuestions received:"
    foreach ($q in $interviewData.questions) {
        Write-Host "- $($q.text)"
    }
}
else {
    Write-Host "NO QUESTIONS RETURNED!"
}
