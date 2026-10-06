param([string]$Base = "http://localhost:3001")
$j = "$env:TEMP\cj.txt"
Remove-Item $j -ErrorAction SilentlyContinue
function t($label, $url) { curl.exe -s -m 40 -b $j -o NUL -w "$label %{http_code} %{time_total}`n" $url }
t "public" "$Base/api/v1/projects"
$body = "$env:TEMP\login.json"
'{"username":"' + $env:ADMIN_USER + '","password":"' + $env:ADMIN_PASS + '"}' | Out-File -Encoding ascii $body
curl.exe -s -m 40 -c $j -H "Content-Type: application/json" --data-binary "@$body" -o NUL -w "login %{http_code} %{time_total}`n" "$Base/api/v1/auth/login"
Remove-Item $body
t "admin-list" "$Base/api/v1/admin?page=1&limit=10"
t "stat-all" "$Base/api/v1/admin?page=1&limit=1"
t "stat-pub" "$Base/api/v1/admin?page=1&limit=1&status=published"
t "cat" "$Base/api/v1/admin?page=1&limit=10&category=ai_ml"
t "search" "$Base/api/v1/admin?page=1&limit=10&search=zzz"
t "public2" "$Base/api/v1/projects"
Remove-Item $j -ErrorAction SilentlyContinue
