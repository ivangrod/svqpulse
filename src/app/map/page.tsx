"use client";

import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import Navbar from "../components/navbar";

const SevilleMap = dynamic(() => import("./components/seville-map"), {
	ssr: false,
	loading: (): ReactElement => (
		<div className="flex flex-1 items-center justify-center bg-zinc-950 text-zinc-500">
			Cargando mapa…
		</div>
	),
});

export default function MapPage(): ReactElement {
	return (
		<div className="flex flex-col h-screen bg-zinc-950">
			<Navbar />
			<div className="flex-1">
				<SevilleMap />
			</div>
		</div>
	);
}
