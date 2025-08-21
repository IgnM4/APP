import express from "express";
import "dotenv/config";
import ventas from "./routes/ventas.js";
import { getPool } from "./db.js";

const app = express();
app.use(express.json());
app.use("/api/ventas", ventas);

const wantedPort = Number(process.env.PORT || 4000);

getPool().then(() => {
  const server = app.listen(wantedPort, () =>
    console.log(`API en http://localhost:${wantedPort}`)
  );

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Puerto ${wantedPort} en uso.`);
      process.exit(1); // o intenta otro puerto si quieres
    } else {
      console.error(err);
      process.exit(1);
    }
  });
});
