import "reflect-metadata";

import { ContainerBuilder } from "diod";

import { PGConnection } from "../postgres/PGConnection";

const builder = new ContainerBuilder();

builder.registerAndUse(PGConnection).asSingleton();

export const container = builder.build();
