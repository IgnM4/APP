# Instalador WiX para AplicacionPyme

Este directorio contiene un esqueleto de proyecto [WiX Toolset](https://wixtoolset.org/) para generar un MSI básico de **AplicacionPyme**.

## Requisitos
- [WiX Toolset 3.x](https://wixtoolset.org/releases/)
- Windows con las herramientas `candle.exe` y `light.exe` en el `PATH`.

## Compilación
1. Abrir una consola de comandos de Windows.
2. Navegar a este directorio: `installer\wix`.
3. Ejecutar:
   ```bat
   build_msi.bat
   ```
   Se generará el archivo `AplicacionPyme.msi`.

## Propiedades de base de datos y API
El MSI expone las siguientes propiedades con valores por defecto:

| Propiedad | Valor por defecto |
|-----------|------------------|
| `DB_USER` | `app_user` |
| `DB_PASSWORD` | `change_me` |
| `DB_CONNECT_STRING` | `localhost:1521/XEPDB1` |
| `API_PORT` | `4000` |

Puede sobreescribirlas al momento de instalar:

```powershell
msiexec /i AplicacionPyme.msi DB_USER="otro_usuario" DB_PASSWORD="secreto" API_PORT=8080
```

La interfaz `WixUI_InstallDir` permite elegir la carpeta de instalación mediante la opción `INSTALLDIR`.
