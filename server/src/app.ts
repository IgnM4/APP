import express from "express";
import "dotenv/config";
import ventas from "./routes/ventas.js";
import { getPool } from "./db.js";

const app = express();
app.use(express.json());
app.use("/api/ventas", ventas);

const wantedPort = Number(
  process.env.PORT || process.env.API_PORT || 4000
);

getPool()
  .catch(err => {
    console.error("No se pudo conectar a la base de datos:", err.message);
    console.error("La API se iniciará pero las rutas que dependan de la BD pueden fallar.");
    // TODO: implementar reintentos o backoff según necesidad
  })
  .finally(() => {
    const server = app.listen(wantedPort, () =>
      console.log(`API en http://localhost:${wantedPort}`)
    );

    server.on("error", (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Puerto ${wantedPort} en uso.`);
        process.exit(1);
      } else {
        console.error(err);
        process.exit(1);
      }
    });
  });
