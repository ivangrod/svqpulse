"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

const navLinks = [
	{ href: "/", label: "Home" },
	{ href: "/map", label: "Map" },
];

export default function Navbar(): ReactElement {
	const pathname = usePathname();

	return (
		<nav className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800">
			<Link href="/" className="text-xl font-bold tracking-tight text-white">
				SVQ<span className="text-emerald-400">Pulse</span>
			</Link>
			<ul className="flex gap-6">
				{navLinks.map((link) => (
					<li key={link.href}>
						<Link
							href={link.href}
							className={`text-sm font-medium transition-colors ${
								pathname === link.href
									? "text-emerald-400"
									: "text-zinc-400 hover:text-white"
							}`}
						>
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
