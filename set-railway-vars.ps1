# PowerShell script to set Railway environment variables
# Run this after authenticating with: railway login

Write-Host "Setting Railway environment variables..." -ForegroundColor Cyan

# Read from .env.local
$envFile = Get-Content .env.local
$vars = @{}

foreach ($line in $envFile) {
    if ($line -match '^([^#][^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $vars[$key] = $value
    }
}

# Set production URLs
$vars['NODE_ENV'] = 'production'
$vars['FRONTEND_URL'] = 'https://ai-storyline-generator-production.up.railway.app'
$vars['VITE_API_URL'] = 'https://ai-storyline-generator-production.up.railway.app'

Write-Host "Found $($vars.Count) variables to set" -ForegroundColor Green

# Build Railway command
$railwayCmd = "railway variables"

foreach ($key in $vars.Keys) {
    $value = $vars[$key]
    Write-Host "  - $key" -ForegroundColor Yellow
    $railwayCmd += " --set `"$key=$value`""
}

Write-Host "`nExecuting Railway command..." -ForegroundColor Cyan
Write-Host $railwayCmd -ForegroundColor Gray

# Execute
Invoke-Expression $railwayCmd

Write-Host "`nDone! Railway will now redeploy with the new variables." -ForegroundColor Green
