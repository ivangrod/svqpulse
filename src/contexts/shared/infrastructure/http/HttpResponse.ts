import { NextResponse } from "next/server";

export class HttpResponse {
	static json<T>(data: T, status: number = 200): NextResponse {
		return NextResponse.json(data, { status });
	}

	static error(message: string, status: number = 500): NextResponse {
		return NextResponse.json({ error: message }, { status });
	}
}
