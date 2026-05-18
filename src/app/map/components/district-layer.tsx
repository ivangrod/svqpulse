"use client";

import L from "leaflet";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { useMap } from "react-leaflet";

const DISTRICT_COLORS = [
	"#e65100", // deep orange
	"#7b1fa2", // purple
	"#c62828", // red
	"#f9a825", // amber
	"#ad1457", // pink
	"#00838f", // teal
	"#4e342e", // brown
	"#283593", // indigo
	"#558b2f", // lime-green
	"#ef6c00", // orange
	"#0277bd", // light blue
];

export default function DistrictLayer(): ReactElement {
	const [visible, setVisible] = useState(false);
	const [geojsonData, setGeojsonData] = useState<GeoJSON.FeatureCollection | null>(null);
	const fetchedRef = useRef(false);
	const layerRef = useRef<L.GeoJSON | null>(null);
	const map = useMap();

	const toggle = useCallback(() => {
		setVisible((prev) => !prev);
	}, []);

	useEffect(() => {
		if (!visible || fetchedRef.current) {
			return;
		}

		fetchedRef.current = true;
		fetch("/api/districts")
			.then((res) => res.json())
			.then((data: GeoJSON.FeatureCollection) => {
				setGeojsonData(data);
			})
			.catch(() => {
				fetchedRef.current = false;
			});
	}, [visible]);

	useEffect(() => {
		if (!visible) {
			if (layerRef.current) {
				map.removeLayer(layerRef.current);
				layerRef.current = null;
			}

			return;
		}

		if (!geojsonData) {
			return;
		}

		let colorIndex = 0;

		const layer = L.geoJSON(geojsonData, {
			style: () => {
				const color = DISTRICT_COLORS[colorIndex % DISTRICT_COLORS.length];
				colorIndex++;

				return {
					fillColor: color,
					color: color,
					weight: 2,
					opacity: 0.8,
					fillOpacity: 0.2,
				};
			},
		});

		layer.addTo(map);
		layerRef.current = layer;

		return () => {
			map.removeLayer(layer);
			layerRef.current = null;
		};
	}, [visible, geojsonData, map]);

	useEffect(() => {
		const control = new L.Control({ position: "topright" });

		control.onAdd = () => {
			const container = L.DomUtil.create("div", "leaflet-bar");
			const button = L.DomUtil.create("button", "", container);

			button.innerHTML = "📍";
			button.title = "Toggle districts";
			button.style.cssText =
				"width: 36px; height: 36px; font-size: 20px; cursor: pointer; background: white; border: none; display: flex; align-items: center; justify-content: center;";

			let active = false;

			L.DomEvent.on(button, "click", (e) => {
				L.DomEvent.stopPropagation(e);
				active = !active;
				button.style.background = active ? "#e65100" : "white";
				toggle();
			});

			return container;
		};

		control.addTo(map);

		return () => {
			control.remove();
		};
	}, [map, toggle]);

	return <></>;
}
