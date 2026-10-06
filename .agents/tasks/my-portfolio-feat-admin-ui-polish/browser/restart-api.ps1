# Restart the verification backend on :3001 (main checkout server code, unchanged)
Get-NetTCPConnection -State Listen -LocalPort 3001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep 1
$env:PORT = '3001'
$s = Start-Process -FilePath "bun" -ArgumentList "run", "dev" -WorkingDirectory "d:\File Defir\Projects\My Portfolio\server" -WindowStyle Hidden -PassThru -RedirectStandardOutput "$env:TEMP\api3001.log" -RedirectStandardError "$env:TEMP\api3001.err"
Remove-Item Env:PORT
Start-Sleep 5
"api pid $($s.Id)"
curl.exe -s -m 25 -o NUL -w "warmup %{http_code} %{time_total}`n" http://localhost:3001/api/v1/projects
