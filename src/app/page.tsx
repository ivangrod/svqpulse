import Link from "next/link";
import type { ReactElement } from "react";

import Navbar from "./components/navbar";

export default function Home(): ReactElement {
	return (
		<div className="flex flex-col min-h-screen bg-zinc-950">
			<Navbar />
			<main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
				<div className="relative mb-8">
					<div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
					<div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
						<div className="h-12 w-12 rounded-full bg-emerald-400 animate-pulse" />
					</div>
				</div>

				<h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
					SVQ<span className="text-emerald-400">Pulse</span>
				</h1>

				<p className="mt-4 max-w-lg text-lg leading-relaxed text-zinc-400">
					Explore Seville&#39;s urban data in real time. Layers of geospatial information about the heart of Andalusia.
				</p>

				<Link
					href="/map"
					className="mt-10 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-lg font-semibold text-zinc-950 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95"
				>
					Explore Map
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M5 12h14" />
						<path d="m12 5 7 7-7 7" />
					</svg>
				</Link>

				<div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
					<div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
						<h3 className="text-sm font-semibold text-emerald-400">
							Geospatial Data
						</h3>
						<p className="mt-2 text-sm text-zinc-500">
							PostGIS feeds layers of geographic information about Seville.
						</p>
					</div>
					<div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
						<h3 className="text-sm font-semibold text-emerald-400">
							Interactive Map
						</h3>
						<p className="mt-2 text-sm text-zinc-500">
							Visualize and explore data with Leaflet on open mapping.
						</p>
					</div>
					<div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
						<h3 className="text-sm font-semibold text-emerald-400">
							Realtime
						</h3>
						<p className="mt-2 text-sm text-zinc-500">
							Information updated with the pulse of the city.
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
