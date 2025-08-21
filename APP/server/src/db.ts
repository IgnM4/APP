import oracledb from "oracledb";
oracledb.stmtCacheSize = 50;

// Formato de salida por nombre de columna (rows[i].COL)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool: oracledb.Pool | undefined;

export async function getPool(): Promise<oracledb.Pool> {
  if (pool) return pool;

  pool = await oracledb.createPool({
    user: process.env.DB_USER ?? "APP_PYME",
    password: process.env.DB_PASSWORD ?? "App_Pyme_2025",
    connectString: process.env.DB_CONNECT_STRING ?? "localhost:1521/XEPDB1",
    poolMin: 1,
    poolMax: 4,
    poolIncrement: 1,
    stmtCacheSize: 50,
  });

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
