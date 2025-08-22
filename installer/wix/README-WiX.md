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

Si faltan archivos como `third_party\nssm\nssm.exe`, puede comentar temporalmente el componente correspondiente en `Files.wxs` para que el proyecto compile.

### Harvest con Heat
WiX no admite comodines de forma nativa. Utilice [heat.exe](https://wixtoolset.org/documentation/manual/v3/overview/heat.html) para generar fragmentos `.wxs` a partir de directorios reales. Ejemplos:

```bat
heat dir ..\third_party\node -nologo -cg CG.Api -dr INSTALLDIR -var var.SourceDir -out files_node.wxs
heat dir ..\server\dist -nologo -cg CG.Api -dr INSTALLDIR -var var.SourceDir -out files_server_dist.wxs
heat dir ..\desktop\AplicacionPyme -nologo -cg CG.Desktop -dr INSTALLDIR -var var.SourceDir -out files_desktop.wxs
heat dir ..\third_party\oracle\instantclient -nologo -cg CG.OracleClient -dr INSTALLDIR -var var.SourceDir -out files_oracle.wxs
```

Los archivos generados (`files_*.wxs`) se incluyen automáticamente por `build_msi.bat` si están presentes.

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

## Servicio Windows

Si durante la instalación se selecciona la característica **ApiService**, el MSI registra un servicio de Windows llamado `AplicacionPymeAPI` utilizando [NSSM](https://nssm.cc/). El servicio se inicia automáticamente y guarda los logs en `INSTALLDIR\logs`.

Para comprobar su estado:

```powershell
sc query AplicacionPymeAPI
```

Las propiedades `DB_USER`, `DB_PASSWORD`, `DB_CONNECT_STRING` y `API_PORT` se pasan como variables de entorno al servicio junto con `APP_CONFIG_DIR` apuntando a `CONFIGDIR`. Puede sobreescribirlas al instalar:

```powershell
msiexec /i AplicacionPyme.msi DB_USER="otro_usuario" DB_PASSWORD="secreto" DB_CONNECT_STRING="servidor:1521/XEPDB1" API_PORT=8080
```

Si `node\node.exe` o `server\dist\app.js` faltan en `INSTALLDIR`, la instalación mostrará un error al crear el servicio.
