import "reflect-metadata";

import { ContainerBuilder } from "diod";

import { AllTouristApartmentsSearcher } from "../../../tourism/tourist-apartments/application/search-all/AllTouristApartmentsSearcher";
import { TouristApartmentRepository } from "../../../tourism/tourist-apartments/domain/TouristApartmentRepository";
import { PostgresTouristApartmentRepository } from "../../../tourism/tourist-apartments/infrastructure/PostgresTouristApartmentRepository";
import { AllTouristHousingsSearcher } from "../../../tourism/tourist-housings/application/search-all/AllTouristHousingsSearcher";
import { TouristHousingRepository } from "../../../tourism/tourist-housings/domain/TouristHousingRepository";
import { PostgresTouristHousingRepository } from "../../../tourism/tourist-housings/infrastructure/PostgresTouristHousingRepository";
import { PGConnection } from "../postgres/PGConnection";

const builder = new ContainerBuilder();

builder.registerAndUse(PGConnection).asSingleton();

builder
	.register(TouristApartmentRepository)
	.use(PostgresTouristApartmentRepository);

builder.registerAndUse(AllTouristApartmentsSearcher);

builder
	.register(TouristHousingRepository)
	.use(PostgresTouristHousingRepository);

builder.registerAndUse(AllTouristHousingsSearcher);

export const container = builder.build();
