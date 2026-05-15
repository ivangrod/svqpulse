import { TouristApartment } from "./TouristApartment";

export abstract class TouristApartmentRepository {
	abstract searchAll(): Promise<TouristApartment[]>;
}
