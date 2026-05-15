import "reflect-metadata";

import { NextResponse } from "next/server";

import { AllTouristApartmentsSearcher } from "@/src/contexts/tourism/tourist-apartments/application/search-all/AllTouristApartmentsSearcher";
import { container } from "@/src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpResponse } from "@/src/contexts/shared/infrastructure/http/HttpResponse";

const searcher = container.get(AllTouristApartmentsSearcher);

export async function GET(): Promise<NextResponse> {
	try {
		const apartments = await searcher.searchAll();

		return HttpResponse.json(apartments);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown error";

		return HttpResponse.error(
			`Failed to fetch tourist apartments: ${message}`,
			503,
		);
	}
}
