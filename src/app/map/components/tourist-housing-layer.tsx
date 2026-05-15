"use client";

import L from "leaflet";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { Marker, Popup, useMap } from "react-leaflet";

interface TouristHousingData {
	id: string;
	registrationCode: string;
	name: string;
	latitude: number;
	longitude: number;
}

const housingIcon = new L.Icon({
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

export default function TouristHousingLayer(): ReactElement {
	const [visible, setVisible] = useState(false);
	const [housings, setHousings] = useState<TouristHousingData[]>([]);
	const fetchedRef = useRef(false);
	const map = useMap();

	const toggle = useCallback(() => {
		setVisible((prev) => !prev);
	}, []);

	useEffect(() => {
		if (!visible || fetchedRef.current) {
			return;
		}

		fetchedRef.current = true;
		fetch("/api/tourist-housings")
			.then((res) => res.json())
			.then((data: TouristHousingData[]) => {
				setHousings(data);
			})
			.catch(() => {
				fetchedRef.current = false;
			});
	}, [visible]);

	useEffect(() => {
		const control = new L.Control({ position: "topright" });

		control.onAdd = () => {
			const container = L.DomUtil.create("div", "leaflet-bar");
			const button = L.DomUtil.create("button", "", container);

			button.innerHTML = "🏡";
			button.title = "Toggle tourist housings";
			button.style.cssText =
				"width: 36px; height: 36px; font-size: 20px; cursor: pointer; background: white; border: none; display: flex; align-items: center; justify-content: center;";

			let active = false;

			L.DomEvent.on(button, "click", (e) => {
				L.DomEvent.stopPropagation(e);
				active = !active;
				button.style.background = active ? "#10b981" : "white";
				toggle();
			});

			return container;
		};

		control.addTo(map);

		return () => {
			control.remove();
		};
	}, [map, toggle]);

	if (!visible) {
		return <></>;
	}

	return (
		<>
			{housings.map((housing) => (
				<Marker
					key={housing.id}
					position={[housing.latitude, housing.longitude]}
					icon={housingIcon}
				>
					<Popup>
						<strong>{housing.name}</strong>
						<br />
						<span style={{ fontSize: "0.85em", color: "#555" }}>
							{housing.registrationCode}
						</span>
					</Popup>
				</Marker>
			))}
		</>
	);
}
