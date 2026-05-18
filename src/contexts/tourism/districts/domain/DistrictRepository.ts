import { District } from "./District";

export abstract class DistrictRepository {
	abstract searchAll(): Promise<District[]>;
}
