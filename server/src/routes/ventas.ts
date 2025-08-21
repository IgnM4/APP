import { Router } from "express";
import oracledb from "oracledb";
import { getPool } from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const pool = await getPool();
  const conn = await pool.getConnection();

  try {
    // 1) Contexto usuario (para trigger de boleta)
    const userId = Number(req.get("x-user-id"));
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: "Falta header x-user-id (numérico)" });
    }
    await conn.execute(`BEGIN pkg_app_ctx.set_usuario(:p_id); END;`, { p_id: userId });

    // 2) Normalización de payload (camelCase / snake_case)
    const b: any = req.body ?? {};
    const numero = b.numero ?? b.NUMERO;
    const idCliente = Number(b.idCliente ?? b.id_cliente);
    let origenUbicacion = b.origenUbicacion ?? b.origen_ubicacion;

    const itemsRaw = b.items ?? b.detalle ?? [];
    const items = Array.isArray(itemsRaw)
      ? itemsRaw.map((it: any) => ({
          idProducto: Number(it.idProducto ?? it.id_producto),
          cantidad: Number(it.cantidad ?? it.cant ?? it.qty),
        }))
      : [];

    // 3) Validación
    if (
      !numero ||
      !Number.isInteger(idCliente) ||
      !Array.isArray(items) || items.length === 0 ||
      items.some((it) => !Number.isInteger(it.idProducto) || !Number.isInteger(it.cantidad) || it.cantidad <= 0)
    ) {
      return res.status(400).json({
        error: "Payload inválido",
        ejemplo: {
          numero: "B-API-20250101010101",
          idCliente: 1,
          origenUbicacion: 2,
          items: [{ idProducto: 1, cantidad: 1 }],
        },
      });
    }

    // 4) Origen por defecto: LOCAL
    if (!Number.isInteger(Number(origenUbicacion))) {
      const r = await conn.execute(`SELECT id_ubicacion AS ID FROM ubicacion WHERE nombre='LOCAL'`);
      origenUbicacion = (r.rows?.[0] as any)?.ID ?? 2;
    }
    origenUbicacion = Number(origenUbicacion);

    // 5) Transacción
    await conn.execute(`SAVEPOINT sp_ini`);

    // 5.1) Insert boleta (trigger completa ID_USUARIO_VENDE)
    const outId = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } as const;
    const rIns = await conn.execute(
      `INSERT INTO boleta_venta (numero, id_cliente, fecha, estado, neto, iva, total, origen_ubicacion)
       VALUES (:numero, :id_cliente, SYSTIMESTAMP, 'PAGADA', 0, 0, 0, :origen)
       RETURNING id_boleta INTO :id_boleta`,
      { numero, id_cliente: idCliente, origen: origenUbicacion, id_boleta: outId },
      { autoCommit: false }
    );
    const idBoleta: number = (rIns.outBinds as any).id_boleta[0];

   // 5.2) Insert detalle con PRECIO_UNITARIO (en una sola sentencia)
const insDetSql = `
  INSERT INTO boleta_venta_detalle (id_boleta, id_producto, cantidad, precio_unitario)
  SELECT :id_boleta, :id_producto, :cantidad, v.precio_con_iva
  FROM v_precio_actual v
  WHERE v.id_producto = :id_producto
`;
for (const it of items) {
  const rDet = await conn.execute(insDetSql, {
    id_boleta: idBoleta,
    id_producto: it.idProducto,
    cantidad: it.cantidad,
  });
  if (!rDet.rowsAffected) {
    throw new Error(`No hay precio vigente para producto ${it.idProducto}`);
  }
}

    // 5.3) Recalcular totales (IVA 19% como en tus ejemplos)
    const rSum = await conn.execute(
      `SELECT SUM(cantidad * precio_unitario) AS TOTAL
         FROM boleta_venta_detalle
        WHERE id_boleta = :id_boleta`,
      { id_boleta: idBoleta }
    );
    const total = Number((rSum.rows?.[0] as any)?.TOTAL ?? 0);
    const neto  = Math.round(total / 1.19);
    const iva   = total - neto;

    await conn.execute(
      `UPDATE boleta_venta
          SET neto = :neto, iva = :iva, total = :total
        WHERE id_boleta = :id_boleta`,
      { neto, iva, total, id_boleta: idBoleta }
    );

    // 5.4) Impacto inventario + pendiente vacío (procedure idempotente)
    await conn.execute(`BEGIN pr_registrar_venta(:p_id); END;`, { p_id: idBoleta });

    await conn.commit();

    return res.status(201).json({
      ok: true,
      idBoleta,
      numero,
      idCliente,
      origenUbicacion,
      items,
      totales: { neto, iva, total },
    });
  } catch (e: any) {
    try { await conn.rollback(); } catch {}
    console.error("ERROR /api/ventas:", e);
    return res.status(400).json({ error: e?.message || String(e) });
  } finally {
    try { await conn.close(); } catch {}
  }
});

export default router;
