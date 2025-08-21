import oracledb from "oracledb";
oracledb.stmtCacheSize = 50;

// Formato de salida por nombre de columna (rows[i].COL)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool: oracledb.Pool | undefined;
let dbHealthy = false;

function getConnectString(): string {
  return (
    process.env.DB_CONNECT_STRING ||
    process.env.DB_URL ||
    "localhost:1521/XEPDB1"
  );
}

async function createPoolWithRetry(maxRetries = 5, baseDelay = 500) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      pool = await oracledb.createPool({
        user: process.env.DB_USER || "app_user",
        password: process.env.DB_PASSWORD || "change_me",
        connectString: getConnectString(),
        poolMin: 1,
        poolMax: 4,
        poolIncrement: 1,
        stmtCacheSize: 50,
      });
      dbHealthy = true;
      console.log("Conexión a Oracle establecida");
      break;
    } catch (err: any) {
      dbHealthy = false;
      console.error(
        `Error conectando a Oracle (intento ${attempt}/${maxRetries}):`,
        err.message || err
      );
      if (attempt === maxRetries) {
        throw err;
      }
      const delay = baseDelay * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export async function initPool() {
  if (!pool) {
    await createPoolWithRetry();
  }
  return pool;
}

export function isDbHealthy() {
  return dbHealthy;
}

export async function getPool(): Promise<oracledb.Pool> {
  if (!pool) {
    await initPool();
  }
  if (!pool) {
    throw new Error("Pool no inicializado");
  }
  return pool;
}

// Helper para usar conexión y cerrarla siempre
export async function withConn<T>(fn: (cn: oracledb.Connection) => Promise<T>): Promise<T> {
  const p = await getPool();
  const cn = await p.getConnection();
  try {
    return await fn(cn);
  } finally {
    try { await cn.close(); } catch {}
  }
}

// (Opcional) para tests o cierre ordenado
export async function closePool() {
  if (pool) {
    await pool.close(5); // espera hasta 5s a que terminen conexiones activas
    pool = undefined;
  }
}
