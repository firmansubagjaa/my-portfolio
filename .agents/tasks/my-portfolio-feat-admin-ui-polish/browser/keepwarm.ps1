# Keep the API's single pooled DB connection from idling out (idle_timeout 20s) during verification
param([int]$Seconds = 400)
$end = (Get-Date).AddSeconds($Seconds)
while ((Get-Date) -lt $end) {
	curl.exe -s -m 15 -o NUL "http://localhost:3001/api/v1/projects?limit=1"
	Start-Sleep 5
}
