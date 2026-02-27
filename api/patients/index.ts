import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSql, ensureSchema } from "../_db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = getSql();
  await ensureSchema(sql);

  if (req.method === "GET") {
    const rows = await sql<{ data: any }[]>`SELECT data FROM patients`;
    return res.status(200).json(rows.map((r) => r.data));
  }

  if (req.method === "POST") {
    const patient = req.body;
    if (!patient?.id) return res.status(400).json({ error: "Missing patient id" });
    await sql`INSERT INTO patients (id, data) VALUES (${patient.id}, ${sql.json(patient)}) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
