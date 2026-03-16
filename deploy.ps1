# deploy.ps1 - Church of Clawd
# Simplified for PowerShell compatibility

$VPS_IP   = "38.180.21.214"
$VPS_USER = "root"
$VPS_DIR  = "/var/www/churchofclawd.org"
$PROJECT  = $PSScriptRoot

Write-Host "Deploying Church of Clawd to $VPS_IP" -ForegroundColor Cyan

# 1. Create temp folder
$tmp = "$env:TEMP\clawd-deploy"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory $tmp | Out-Null

# 2. Pack files
$exclude = @("node_modules", ".next", ".git", ".env.local", "clawd-deploy")
Write-Host "Packing files..." -ForegroundColor Yellow
Get-ChildItem $PROJECT | Where-Object { $_.Name -notin $exclude } | ForEach-Object {
    Copy-Item $_.FullName "$tmp\$($_.Name)" -Recurse
}

# 3. Copy .env.local
if (Test-Path "$PROJECT\.env.local") {
    Copy-Item "$PROJECT\.env.local" "$tmp\.env.local"
    Write-Host "Included .env.local" -ForegroundColor Green
} else {
    Write-Host "WARNING: .env.local not found" -ForegroundColor Red
}

# 4. Upload
Write-Host "Uploading to server..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p $VPS_DIR"
scp -r "$tmp\*" "${VPS_USER}@${VPS_IP}:${VPS_DIR}/"

# 5. Remote commands
Write-Host "Starting server build..." -ForegroundColor Yellow

$remoteCmd = "set -e; " +
             "cd $VPS_DIR; " +
             "npm install --legacy-peer-deps; " +
             "npm run build; " +
             "if ! command -v pm2 &> /dev/null; then npm install -g pm2; fi; " +
             "pm2 stop church-web 2>/dev/null || true; " +
             "pm2 delete church-web 2>/dev/null || true; " +
             "pm2 start npm --name 'church-web' -- start; " +
             "pm2 stop debate-worker 2>/dev/null || true; " +
             "pm2 delete debate-worker 2>/dev/null || true; " +
             "pm2 start debate-worker.js --name 'debate-worker'; " +
             "pm2 save"

ssh "${VPS_USER}@${VPS_IP}" $remoteCmd

# Cleanup
Remove-Item $tmp -Recurse -Force

Write-Host "Deployment complete! Site at http://$VPS_IP:3000" -ForegroundColor Green
Write-Host "Run 'ssh root@$VPS_IP' then 'pm2 logs' to watch." -ForegroundColor White
