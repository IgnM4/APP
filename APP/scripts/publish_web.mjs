import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, copyFileSync, writeFileSync } from 'fs';
import path from 'path';

const sqlcl = process.env.SQLCL_BIN;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbUrl = process.env.DB_URL;

try {
  if (sqlcl && dbUser && dbPass && dbUrl) {
    execSync(`${sqlcl} ${dbUser}/${dbPass}@${dbUrl} @scripts/publish_kpis.sql`, { stdio: 'inherit' });
  } else {
    console.log('modo sin BD');
  }
} catch (e) {
  console.error('Error ejecutando SQLcl', e.message);
}

const exportDir = process.platform === 'win32' ? 'C:/oracle_export' : process.env.EXPORT_DIR || './oracle_export';
const destDir = path.resolve('web-app/public/data');
mkdirSync(destDir, { recursive: true });

if (existsSync(exportDir)) {
  const files = readdirSync(exportDir).filter(f => f.endsWith('.csv'));
  files.forEach(f => copyFileSync(path.join(exportDir, f), path.join(destDir, f)));
  const latest = { generated: new Date().toISOString(), files };
  writeFileSync(path.join(destDir, 'latest.json'), JSON.stringify(latest, null, 2));
  console.log('CSV copiados');
} else {
  console.log('Directorio de export no existe:', exportDir);
}
