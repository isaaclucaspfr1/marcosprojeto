import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSql, ensureSchema, ensureSeed } from "../_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = getSql();
  await ensureSchema(sql);

  if (req.method === "GET") {
    await ensureSeed(sql);
    const rows = await sql<{ data: any }[]>`SELECT data FROM collaborators`;
    return res.status(200).json(rows.map((r) => r.data));
  }

  if (req.method === "POST") {
    const collab = req.body;
    if (!collab?.id || !collab?.login) return res.status(400).json({ error: "Missing id or login" });
    await sql`
      INSERT INTO collaborators (id, login, data)
      VALUES (${collab.id}, ${collab.login}, ${sql.json(collab)})
      ON CONFLICT (id) DO UPDATE SET login = EXCLUDED.login, data = EXCLUDED.data;
    `;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
