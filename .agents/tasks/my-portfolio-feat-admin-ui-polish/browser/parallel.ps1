param([string]$Base = "http://localhost:3001", [int]$N = 5)
$j = "$env:TEMP\cj2.txt"
$body = "$env:TEMP\login2.json"
'{"username":"' + $env:ADMIN_USER + '","password":"' + $env:ADMIN_PASS + '"}' | Out-File -Encoding ascii $body
curl.exe -s -m 40 -c $j -H "Content-Type: application/json" --data-binary "@$body" -o NUL -w "login %{http_code} %{time_total}`n" "$Base/api/v1/auth/login"
Remove-Item $body
$urls = 1..$N | % { "$Base/api/v1/admin?page=1&limit=1&search=p$_" }
$args2 = @("-s", "-m", "40", "-b", $j, "--parallel", "--parallel-immediate")
foreach ($u in $urls) { $args2 += @("-o", "NUL", "-w", "par %{http_code} %{time_total}`n", $u) }
curl.exe @args2
curl.exe -s -m 40 -b $j -o NUL -w "after %{http_code} %{time_total}`n" "$Base/api/v1/admin?page=1&limit=1"
Remove-Item $j -ErrorAction SilentlyContinue
