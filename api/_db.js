import postgres from "postgres";

let cached = null;

function requireConnectionString() {
  const cs = process.env.DATABASE_URL;
  if (!cs) throw new Error("DATABASE_URL is not set. Configure it in your environment variables.");
  return cs;
}

export function getSql() {
  if (cached) return cached;
  const connectionString = requireConnectionString();
  cached = postgres(connectionString, { ssl: "require" });
  return cached;
}

export async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lean_patients (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS collaborators (
      id TEXT PRIMARY KEY,
      login TEXT UNIQUE NOT NULL,
      data JSONB NOT NULL
    );
  `;
}

export async function ensureSeed(sql) {
  const defaults = [
    { id: "1", name: "MA Desenvolvedor", login: "5669", password: "387387", role: "coordenacao", failedAttempts: 0, isBlocked: false, isDeleted: false },
    { id: "2", name: "Coordenação Setorial", login: "1010", password: "1234", role: "coordenacao", failedAttempts: 0, isBlocked: false, isDeleted: false },
    { id: "3", name: "Técnico Exemplo", login: "456", password: "1234", role: "tecnico", failedAttempts: 0, isBlocked: false, isDeleted: false }
  ];

  for (const collab of defaults) {
    await sql`
      INSERT INTO collaborators (id, login, data)
      VALUES (${collab.id}, ${collab.login}, ${sql.json(collab)})
      ON CONFLICT (id) DO UPDATE SET login = EXCLUDED.login, data = EXCLUDED.data;
    `;
  }
}
