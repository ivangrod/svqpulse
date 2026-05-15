import { Service } from "diod";

import { PGConnection } from "../../../shared/infrastructure/postgres/PGConnection";
import { TouristApartment } from "../domain/TouristApartment";
import { TouristApartmentRepository } from "../domain/TouristApartmentRepository";

interface TouristApartmentRow {
	id: string;
	registration_code: string;
	name: string;
	latitude: number;
	longitude: number;
}

@Service()
export class PostgresTouristApartmentRepository extends TouristApartmentRepository {
	constructor(private readonly connection: PGConnection) {
		super();
	}

	async searchAll(): Promise<TouristApartment[]> {
		const result = await this.connection.query<TouristApartmentRow>(
			`SELECT id, registration_code, name, ST_Y(location) AS latitude, ST_X(location) AS longitude
			 FROM tourist_apartments
			 ORDER BY registration_code`,
		);

		return result.rows.map(
			(row) =>
				new TouristApartment(
					row.id,
					row.registration_code,
					row.name,
					row.latitude,
					row.longitude,
				),
		);
	}
}
