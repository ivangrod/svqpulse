import { Service } from "diod";

import { PGConnection } from "../../../shared/infrastructure/postgres/PGConnection";
import { TouristHousing } from "../domain/TouristHousing";
import { TouristHousingRepository } from "../domain/TouristHousingRepository";

interface TouristHousingRow {
	id: string;
	registration_code: string;
	name: string;
	latitude: number;
	longitude: number;
}

@Service()
export class PostgresTouristHousingRepository extends TouristHousingRepository {
	constructor(private readonly connection: PGConnection) {
		super();
	}

	async searchAll(): Promise<TouristHousing[]> {
		const result = await this.connection.query<TouristHousingRow>(
			`SELECT id, registration_code, name, ST_Y(location) AS latitude, ST_X(location) AS longitude
			 FROM tourist_housings
			 ORDER BY registration_code`,
		);

		return result.rows.map(
			(row) =>
				new TouristHousing(
					row.id,
					row.registration_code,
					row.name,
					row.latitude,
					row.longitude,
				),
		);
	}
}
