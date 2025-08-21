# APP

Proyecto de ejemplo para una PyME de distribución de gas. Consta de tres módulos:

- **db-project** – scripts Oracle y changelogs Liquibase.
- **desktop-app** – aplicación JavaFX para refrescar KPIs y exportar CSV.
- **web-app** – sitio estático que consume los CSV y se publica en Firebase Hosting.

## Prerrequisitos
- Java 17+, Maven
- Node.js 18+
- SQLcl y Liquibase
- Oracle XE 21c (local o en contenedor)

Variables de entorno comunes:
```
DB_URL=jdbc:oracle:thin:@//localhost:1521/XEPDB1
DB_USER=APP_PYME
DB_PASS=App_Pyme_2025
EXPORT_DIR=./oracle_export
APP_USE_EXPORT_PROC=false
SQLCL_BIN=sql
```

La aplicación genera CSV/JSON desde el cliente por defecto. Si se necesita
utilizar los procedimientos Oracle para exportar CSV, establecer
`APP_USE_EXPORT_PROC=true`.

## Comandos rápidos
### Base de datos
```
liquibase --defaultsFile=db-project/liquibase/liquibase.properties status
liquibase --defaultsFile=db-project/liquibase/liquibase.properties update
```
### Desktop
```
mvn -q -f desktop-app/pom.xml javafx:run
```
### Web
```
node scripts/publish_web.mjs
cd web-app && firebase serve
```

## Troubleshooting
- **ORA-01031:** ejecutar con usuario con permisos o `SYS AS SYSDBA`.
- **OJDBC duplicado:** no declarar `classpath` en `liquibase.properties`.
- **Rutas Windows:** usar `\\` si se cambia `EXPORT_DIR`.

## Flujo de demo
1. `liquibase update` prepara la BD.
2. La app de escritorio refresca MVs y exporta CSV.
3. `node scripts/publish_web.mjs` copia los archivos a `web-app/public/data`.
4. `firebase serve` muestra el dashboard con los datos más recientes.
