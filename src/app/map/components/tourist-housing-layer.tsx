"use client";

import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { useMap } from "react-leaflet";

interface TouristHousingData {
	id: string;
	registrationCode: string;
	name: string | null;
	latitude: number;
	longitude: number;
}

const housingMarkerStyle: L.CircleMarkerOptions = {
	radius: 7,
	fillColor: "#10b981",
	color: "#059669",
	weight: 2,
	opacity: 1,
	fillOpacity: 0.8,
};

function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
	const count = cluster.getChildCount();
	let size: "sm" | "md" | "lg";

	if (count < 50) {
		size = "sm";
	} else if (count < 200) {
		size = "md";
	} else {
		size = "lg";
	}

	const px = size === "sm" ? 30 : size === "md" ? 40 : 50;

	return new L.DivIcon({
		html: `<div class="cluster-icon cluster-icon--${size} cluster-icon--housing">${count}</div>`,
		className: "",
		iconSize: new L.Point(px, px),
	});
}

export default function TouristHousingLayer(): ReactElement {
	const [visible, setVisible] = useState(false);
	const [housings, setHousings] = useState<TouristHousingData[]>([]);
	const fetchedRef = useRef(false);
	const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
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
		if (!visible) {
			if (clusterGroupRef.current) {
				map.removeLayer(clusterGroupRef.current);
				clusterGroupRef.current = null;
			}

			return;
		}

		if (housings.length === 0) {
			return;
		}

		const clusterGroup = L.markerClusterGroup({
			disableClusteringAtZoom: 18,
			maxClusterRadius: 80,
			spiderfyOnMaxZoom: false,
			showCoverageOnHover: false,
			chunkedLoading: true,
			removeOutsideVisibleBounds: true,
			animate: false,
			iconCreateFunction: createClusterIcon,
		});

		const markers = housings.map((housing) => {
			const marker = L.circleMarker(
				[housing.latitude, housing.longitude],
				housingMarkerStyle,
			);

			marker.on("click", () => {
				marker
					.bindPopup(
						`<strong>${housing.name ?? housing.registrationCode}</strong><br/><span style="font-size:0.85em;color:#555">${housing.registrationCode}</span>`,
					)
					.openPopup();
			});

			return marker;
		});

		clusterGroup.addLayers(markers);
		map.addLayer(clusterGroup);
		clusterGroupRef.current = clusterGroup;

		return () => {
			map.removeLayer(clusterGroup);
			clusterGroupRef.current = null;
		};
	}, [visible, housings, map]);

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

	return <></>;
}
