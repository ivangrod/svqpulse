import { Service } from "diod";

import { TouristHousingPrimitives } from "../../domain/TouristHousing";
import { TouristHousingRepository } from "../../domain/TouristHousingRepository";

@Service()
export class AllTouristHousingsSearcher {
	constructor(private readonly repository: TouristHousingRepository) {}

	async searchAll(): Promise<TouristHousingPrimitives[]> {
		const housings = await this.repository.searchAll();

		return housings.map((housing) => housing.toPrimitives());
	}
}
