// lib/db.ts
import { Pool } from "pg";

export interface IRequestShim {
  input(name: string, typeOrValue: any, value?: any): this;
  query(sql: string): Promise<{ recordset: any[]; rowsAffected: number[] }>;
}

let pool: (Pool & { request: () => IRequestShim }) | null = null;

class RequestShimImpl implements IRequestShim {
  inputs: Record<string, any> = {};

  input(name: string, typeOrValue: any, value?: any) {
    if (value !== undefined) {
      this.inputs[name] = value;
    } else {
      this.inputs[name] = typeOrValue;
    }
    return this;
  }

  async query(sql: string): Promise<{ recordset: any[]; rowsAffected: number[] }> {
    let pgSql = sql;

    // 1. Auto-translate MS SQL "SELECT TOP X" to Postgres "LIMIT X"
    const topMatch = sql.match(/SELECT\s+TOP\s+(\d+)\s+/i);
    if (topMatch) {
      pgSql = pgSql.replace(topMatch[0], 'SELECT ');
      if (!pgSql.toLowerCase().includes('limit')) {
        pgSql += ` LIMIT ${topMatch[1]}`;
      }
    }

    // 2. Auto-fix known case-sensitive Postgres tables from unquoted SQL Server variants
    pgSql = pgSql
      .replace(/(?<!")\bClients\b(?!")/g, 'public."Clients"')
      .replace(/(?<!")\bUsers\b(?!")/g, 'public."Users"');

    // 3. Translate SQL Server @param syntax to Postgres $1 syntax mapping parameters
    const values: any[] = [];
    let paramIndex = 1;

    pgSql = pgSql.replace(/@([a-zA-Z0-9_]+)/g, (match, paramName) => {
      if (paramName in this.inputs) {
        values.push(this.inputs[paramName]);
        return `$${paramIndex++}`;
      }
      return match; // Unmatched params remain as is
    });

    try {
      if (!pool) throw new Error("Database pool is not initialized");
      const res = await pool.query(pgSql, values);
      return {
        recordset: res.rows || [],
        rowsAffected: [res.rowCount || 0]
      };
    } catch (err: any) {
      console.error(`[MssqlShim] Query failed: ${pgSql} | Params: ${JSON.stringify(values)}`, err.message);
      throw err;
    }
  }
}

export async function getDbPool(): Promise<Pool & { request: () => IRequestShim }> {
  if (pool) return pool;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }
    const pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Test connection
    const client = await pgPool.connect();
    console.log("✔️ DB Connected");
    client.release();

    // Monkey-patch the pool to support .request() so 70+ legacy routes continue to build and function
    const patchedPool = pgPool as Pool & { request: () => IRequestShim };
    patchedPool.request = function (): IRequestShim {
      return new RequestShimImpl();
    };

    pool = patchedPool;

    return pool;
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    throw err;
  }
}
