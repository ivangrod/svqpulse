import { Service } from "diod";

import { PGConnection } from "../../../shared/infrastructure/postgres/PGConnection";
import { District } from "../domain/District";
import { DistrictRepository } from "../domain/DistrictRepository";

interface DistrictRow {
	id: string;
	name: string;
	group_name: string;
	geometry: string;
}

@Service()
export class PostgresDistrictRepository extends DistrictRepository {
	constructor(private readonly connection: PGConnection) {
		super();
	}

	async searchAll(): Promise<District[]> {
		const result = await this.connection.query<DistrictRow>(
			`SELECT id, name, group_name, ST_AsGeoJSON(geometry) AS geometry
			 FROM districts
			 ORDER BY name`,
		);

		return result.rows.map(
			(row) =>
				new District(
					row.id,
					row.name,
					row.group_name,
					JSON.parse(row.geometry),
				),
		);
	}
}
