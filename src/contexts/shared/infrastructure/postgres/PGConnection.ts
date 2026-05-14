import { Pool, QueryResult, QueryResultRow } from "pg";
import { Service } from "diod";

@Service()
export class PGConnection {
	private pool: Pool | null = null;

	getPool(): Pool {
		if (!this.pool) {
			this.pool = new Pool({
				connectionString: process.env.DATABASE_URL,
			});
		}

		return this.pool;
	}

	async query<T extends QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
		const pool = this.getPool();

		return pool.query<T>(text, params);
	}

	async close(): Promise<void> {
		if (this.pool) {
			await this.pool.end();
			this.pool = null;
		}
	}
}
