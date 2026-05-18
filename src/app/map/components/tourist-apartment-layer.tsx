"use client";

import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { useMap } from "react-leaflet";

interface TouristApartmentData {
	id: string;
	registrationCode: string;
	name: string;
	latitude: number;
	longitude: number;
}

const apartmentMarkerStyle: L.CircleMarkerOptions = {
	radius: 7,
	fillColor: "#3b82f6",
	color: "#2563eb",
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
		html: `<div class="cluster-icon cluster-icon--${size} cluster-icon--apartment">${count}</div>`,
		className: "",
		iconSize: new L.Point(px, px),
	});
}

export default function TouristApartmentLayer(): ReactElement {
	const [visible, setVisible] = useState(false);
	const [apartments, setApartments] = useState<TouristApartmentData[]>([]);
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
		fetch("/api/tourist-apartments")
			.then((res) => res.json())
			.then((data: TouristApartmentData[]) => {
				setApartments(data);
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

		if (apartments.length === 0) {
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

		const markers = apartments.map((apt) => {
			const marker = L.circleMarker(
				[apt.latitude, apt.longitude],
				apartmentMarkerStyle,
			);

			marker.on("click", () => {
				marker
					.bindPopup(
						`<strong>${apt.name}</strong><br/><span style="font-size:0.85em;color:#555">${apt.registrationCode}</span>`,
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
	}, [visible, apartments, map]);

	useEffect(() => {
		const control = new L.Control({ position: "topright" });

		control.onAdd = () => {
			const container = L.DomUtil.create("div", "leaflet-bar");
			const button = L.DomUtil.create("button", "", container);

			button.innerHTML = "🏠";
			button.title = "Toggle tourist apartments";
			button.style.cssText =
				"width: 36px; height: 36px; font-size: 20px; cursor: pointer; background: white; border: none; display: flex; align-items: center; justify-content: center;";

			let active = false;

			L.DomEvent.on(button, "click", (e) => {
				L.DomEvent.stopPropagation(e);
				active = !active;
				button.style.background = active ? "#3b82f6" : "white";
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
