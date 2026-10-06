param([string]$Base = "http://localhost:3001")
$j = "$env:TEMP\cj3.txt"
$body = "$env:TEMP\login3.json"
'{"username":"' + $env:ADMIN_USER + '","password":"' + $env:ADMIN_PASS + '"}' | Out-File -Encoding ascii $body
curl.exe -s -m 40 -c $j -H "Content-Type: application/json" --data-binary "@$body" -o NUL -w "login %{http_code}`n" "$Base/api/v1/auth/login"
Remove-Item $body
curl.exe -s -m 40 -b $j -w "`ncheck-new %{http_code} %{time_total}`n" "$Base/api/v1/admin/check-slug?slug=proyek-uji-visual-kiro"
curl.exe -s -m 40 -b $j -w "`ncheck-taken %{http_code} %{time_total}`n" "$Base/api/v1/admin/check-slug?slug=ai-chat-platform"
Remove-Item $j -ErrorAction SilentlyContinue
