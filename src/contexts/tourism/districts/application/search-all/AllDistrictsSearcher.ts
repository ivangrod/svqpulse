import { Service } from "diod";

import { DistrictPrimitives } from "../../domain/District";
import { DistrictRepository } from "../../domain/DistrictRepository";

@Service()
export class AllDistrictsSearcher {
	constructor(private readonly repository: DistrictRepository) {}

	async searchAll(): Promise<DistrictPrimitives[]> {
		const districts = await this.repository.searchAll();

		return districts.map((district) => district.toPrimitives());
	}
}
