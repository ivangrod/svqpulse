export interface TouristHousingPrimitives {
	id: string;
	registrationCode: string;
	name: string;
	latitude: number;
	longitude: number;
}

export class TouristHousing {
	constructor(
		private readonly id: string,
		private readonly registrationCode: string,
		private readonly name: string,
		private readonly latitude: number,
		private readonly longitude: number,
	) {}

	toPrimitives(): TouristHousingPrimitives {
		return {
			id: this.id,
			registrationCode: this.registrationCode,
			name: this.name,
			latitude: this.latitude,
			longitude: this.longitude,
		};
	}
}
