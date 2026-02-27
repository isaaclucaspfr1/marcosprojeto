import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSql, ensureSchema } from "../_db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { ids } = req.body ?? {};
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "ids must be a non-empty array" });

  const sql = getSql();
  await ensureSchema(sql);

  await sql.begin(async (trx) => {
    for (const id of ids) {
      await trx`DELETE FROM patients WHERE id = ${id}`;
    }
  });

  return res.status(200).json({ success: true });
}
