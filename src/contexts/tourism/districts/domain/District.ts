export interface DistrictPrimitives {
	id: string;
	name: string;
	groupName: string;
	geometry: GeoJSON.MultiPolygon;
}

export class District {
	constructor(
		private readonly id: string,
		private readonly name: string,
		private readonly groupName: string,
		private readonly geometry: GeoJSON.MultiPolygon,
	) {}

	toPrimitives(): DistrictPrimitives {
		return {
			id: this.id,
			name: this.name,
			groupName: this.groupName,
			geometry: this.geometry,
		};
	}
}
