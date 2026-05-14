import "reflect-metadata";

import { NextResponse } from "next/server";

import { container } from "@/src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PGConnection } from "@/src/contexts/shared/infrastructure/postgres/PGConnection";
import { HttpResponse } from "@/src/contexts/shared/infrastructure/http/HttpResponse";

const connection = container.get(PGConnection);

export async function GET(): Promise<NextResponse> {
	try {
		const dbResult = await connection.query<{ ok: number }>("SELECT 1 AS ok");
		const pgisResult = await connection.query<{ version: string }>(
			"SELECT PostGIS_Version() AS version",
		);

		return HttpResponse.json({
			status: "healthy",
			database: dbResult.rows[0].ok === 1,
			postgis: pgisResult.rows[0].version,
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown database error";

		return HttpResponse.error(`Database connection failed: ${message}`, 503);
	}
}
