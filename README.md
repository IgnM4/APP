# AplicacionPyme

Monorepo para una PyME de distribución de gas. Incluye:

- **db-project** – scripts Oracle y changelogs Liquibase.
- **desktop-app** – aplicación JavaFX para refrescar KPIs y exportar CSV.
- **server** – API Node.js/Express.
- **web-app** – sitio estático servido con Firebase Hosting.

## Prerrequisitos
- Java 17+ y Maven
- Node.js 18+
- SQLcl y Liquibase
- Oracle XE 21c o acceso a un servidor Oracle (Instant Client para oracledb)

## Quickstart
1. Levantar la base de datos (opcional):
   ```bash
   docker compose up -d oracle-xe
   ```
2. Definir credenciales para Liquibase:
   ```bash
   export LIQUI_URL=jdbc:oracle:thin:@//localhost:1521/XEPDB1
   export LIQUI_USER=app_user
   export LIQUI_PASS=change_me
   ```
   ```bash
   liquibase --defaultsFile=db-project/liquibase/liquibase.properties.example update
   ```
3. Backend API:
   ```bash
   cd server
   cp .env.example .env  # editar con tus valores
   npm ci
   npm run dev           # o npm run build && npm start
   ```
4. Aplicación de escritorio:
   ```bash
   mvn -q -f desktop-app/pom.xml javafx:run
   ```
5. Publicar CSV y servir la web:
   ```bash
   export DB_URL=//localhost:1521/XEPDB1
   export DB_USER=app_user
   export DB_PASS=change_me
   export EXPORT_DIR=/ruta/a/csvs
   node scripts/publish_web.mjs
   cd web-app
   npm ci
   firebase serve
   ```

## Variables de entorno
- **Backend Node (server/.env):** `PORT`, `DB_USER`, `DB_PASSWORD`, `DB_CONNECT_STRING`
- **JDBC/Desktop (desktop-app/app.properties):** `APP_DB_URL`, `APP_DB_USER`, `APP_DB_PASSWORD`
- **Liquibase:** `LIQUI_URL`, `LIQUI_USER`, `LIQUI_PASS`
- **Scripts:** `SQLCL_BIN`, `DB_URL`, `DB_USER`, `DB_PASS`, `EXPORT_DIR`
- **Docker Compose:** `ORACLE_PASSWORD`, `DB_USER`, `DB_PASSWORD`, `API_PORT`

Consulta `credenciales.txt` para un listado de todas las variables sensibles.

## Producción
- Ejecutar `firebase deploy` para publicar la web.
- Cambiar todas las credenciales por valores seguros.
- Asegurarse de que Oracle Instant Client esté instalado si se ejecuta fuera de Docker.
- Verificar puertos abiertos (`1521`, `5500`, `4000`).
- Controlar el tamaño de los CSV y permisos del directorio `EXPORT_DIR`.

## Limpieza de artefactos versionados
Si se llegó a commitear `node_modules`, `dist`, `build` o `target`:
```bash
git rm -r --cached **/node_modules **/dist **/build **/target
git commit -m "chore: remove build artifacts"
```

## Otros
- `db-project/docker/docker-compose.yml` levanta únicamente Oracle XE para pruebas aisladas.
