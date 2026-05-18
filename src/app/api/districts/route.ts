import "reflect-metadata";

import { NextResponse } from "next/server";

import { AllDistrictsSearcher } from "@/src/contexts/tourism/districts/application/search-all/AllDistrictsSearcher";
import { container } from "@/src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpResponse } from "@/src/contexts/shared/infrastructure/http/HttpResponse";

const searcher = container.get(AllDistrictsSearcher);

export async function GET(): Promise<NextResponse> {
	try {
		const districts = await searcher.searchAll();

		const featureCollection: GeoJSON.FeatureCollection = {
			type: "FeatureCollection",
			features: districts.map((district) => ({
				type: "Feature" as const,
				properties: {
					id: district.id,
					name: district.name,
					groupName: district.groupName,
				},
				geometry: district.geometry,
			})),
		};

		return HttpResponse.json(featureCollection);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown error";

		return HttpResponse.error(
			`Failed to fetch districts: ${message}`,
			503,
		);
	}
}
