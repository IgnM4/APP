# Changelog

## [Unreleased]
- Flattened project structure by moving contents of `APP/` to repository root.
- Replaced broken root `.gitignore` with standard rules and removed nested file.
- Removed committed credentials and added template files (`server/.env.example`, `desktop-app/app.properties.example`, `db-project/liquibase/liquibase.properties.example`).
- Added root `docker-compose.yml` to run Oracle XE and the Node API with configurable port.
- Updated backend to read environment variables and start even if the DB is unavailable.
- Revised `scripts/publish_web.mjs` to rely solely on environment variables.
- Introduced minimal GitHub Actions workflow for Node and Maven builds.
- Rewrote `README.md` with unified quickstart and variable documentation.
- Added `credenciales.txt` describing required secrets.

### Migration
After pulling these changes, remove previously committed build artefacts if any:
```
git rm -r --cached **/node_modules **/dist **/build **/target
```
