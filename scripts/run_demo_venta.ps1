$sql = Join-Path $PSScriptRoot 'demo_venta.sql'
& sqlplus 'APP_PYME/App_Pyme_2025@//localhost:1521/XEPDB1' "@$sql"

