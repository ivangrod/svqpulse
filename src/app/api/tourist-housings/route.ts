import "reflect-metadata";

import { NextResponse } from "next/server";

import { AllTouristHousingsSearcher } from "@/src/contexts/tourism/tourist-housings/application/search-all/AllTouristHousingsSearcher";
import { container } from "@/src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpResponse } from "@/src/contexts/shared/infrastructure/http/HttpResponse";

const searcher = container.get(AllTouristHousingsSearcher);

export async function GET(): Promise<NextResponse> {
	try {
		const housings = await searcher.searchAll();

		return HttpResponse.json(housings);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown error";

		return HttpResponse.error(
			`Failed to fetch tourist housings: ${message}`,
			503,
		);
	}
}
