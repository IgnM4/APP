$sql = Join-Path $PSScriptRoot 'demo_venta.sql'

$sqlcl = $env:SQLCL_BIN
$dbUser = $env:DB_USER
$dbPass = $env:DB_PASS
$dbUrl  = $env:DB_URL

if (-not $sqlcl) {
  Write-Warning 'SQLCL_BIN no definido; se omite demo_venta'
  exit 0
}

if ($dbUser -and $dbPass -and $dbUrl) {
  & $sqlcl "$dbUser/$dbPass@$dbUrl" "@$sql"
} else {
  Write-Warning 'DB_URL/DB_USER/DB_PASS incompletos; se omite SQLcl'
}

& sqlplus 'APP_PYME/App_Pyme_2025@//localhost:1521/XEPDB1' "@$sql"


