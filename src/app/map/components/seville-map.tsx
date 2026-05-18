"use client";

import type { ReactElement } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import DistrictLayer from "./district-layer";
import TouristApartmentLayer from "./tourist-apartment-layer";
import TouristHousingLayer from "./tourist-housing-layer";

const SEVILLE_CENTER: [number, number] = [37.3886, -5.9823];
const DEFAULT_ZOOM = 13;

export default function SevilleMap(): ReactElement {
	return (
		<MapContainer
			center={SEVILLE_CENTER}
			zoom={DEFAULT_ZOOM}
			className="h-full w-full"
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<DistrictLayer />
			<TouristApartmentLayer />
			<TouristHousingLayer />
		</MapContainer>
	);
}
