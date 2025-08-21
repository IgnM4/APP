@echo off
setlocal

set DATA_DIR=%~dp0..\web-app\public\data

if defined SQLCL_BIN (
  if defined DB_USER if defined DB_PASS if defined DB_URL (
    echo BEGIN pr_export_kpis_daily; END; / ^| %SQLCL_BIN% %DB_USER%/%DB_PASS%@%DB_URL%
  ) else (
    echo DB_URL/DB_USER/DB_PASS incompletos; se omite SQLcl
  )
) else (
  echo SQLCL_BIN no definido; se omite exportacion de BD
)

set SQLCL=C:\Oracle\sqlcl\bin\sql.exe
set EXPORT_DIR=C:\oracle_export
set DATA_DIR=%~dp0..\web-app\public\data

echo BEGIN pr_export_kpis_daily; END; / | %SQLCL% APP_PYME/App_Pyme_2025@//localhost:1521/XEPDB1


for %%F in ("%EXPORT_DIR%\ventas_hoy*.csv") do set VENTAS_HOY=%%~nxF
for %%F in ("%EXPORT_DIR%\ventas_prod_ult7d*.csv") do set VENTAS_PROD=%%~nxF

copy "%EXPORT_DIR%\%VENTAS_HOY%" "%DATA_DIR%" >nul
copy "%EXPORT_DIR%\%VENTAS_PROD%" "%DATA_DIR%" >nul

echo {> "%DATA_DIR%\latest.json"
echo   "ventas_hoy":"%VENTAS_HOY%",>> "%DATA_DIR%\latest.json"
echo   "ventas_prod_ult7d":"%VENTAS_PROD%" >> "%DATA_DIR%\latest.json"
echo }>> "%DATA_DIR%\latest.json"

cd "%~dp0..\web-app"
firebase deploy
