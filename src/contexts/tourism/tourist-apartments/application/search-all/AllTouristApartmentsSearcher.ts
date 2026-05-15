import { Service } from "diod";

import { TouristApartmentPrimitives } from "../../domain/TouristApartment";
import { TouristApartmentRepository } from "../../domain/TouristApartmentRepository";

@Service()
export class AllTouristApartmentsSearcher {
	constructor(private readonly repository: TouristApartmentRepository) {}

	async searchAll(): Promise<TouristApartmentPrimitives[]> {
		const apartments = await this.repository.searchAll();

		return apartments.map((apartment) => apartment.toPrimitives());
	}
}
