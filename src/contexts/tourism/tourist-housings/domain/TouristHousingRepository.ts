import { TouristHousing } from "./TouristHousing";

export abstract class TouristHousingRepository {
	abstract searchAll(): Promise<TouristHousing[]>;
}
