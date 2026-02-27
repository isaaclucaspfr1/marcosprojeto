import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSql, ensureSchema } from "../_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ error: "Missing id" });
  if (id === "1") return res.status(403).json({ error: "Cannot delete master developer" });

  const sql = getSql();
  await ensureSchema(sql);

  await sql`DELETE FROM collaborators WHERE id = ${id}`;
  return res.status(200).json({ success: true });
}
