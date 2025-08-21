import express from "express";
import "dotenv/config";
import ventas from "./routes/ventas.js";
import { initPool, isDbHealthy } from "./db.js";

const app = express();
app.use(express.json());
app.use("/api/ventas", ventas);

const wantedPort = Number(process.env.API_PORT || process.env.PORT || 4000);

const allowStartWithoutDb = process.env.ALLOW_START_WITHOUT_DB === "true";

initPool()
  .catch(err => {
    console.error("No se pudo conectar a la base de datos:", err.message || err);
    if (!allowStartWithoutDb) {
      process.exit(1);
    }
    console.warn("Continuando sin conexión a la BD por ALLOW_START_WITHOUT_DB=true");
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

app.get("/health", (_req, res) => {
  res.json({ db: isDbHealthy() ? "up" : "down" });
});
