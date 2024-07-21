import { CoTypedFactory } from "ballerina-core";
import { Unit } from "ballerina-core";
import { Child1 } from "../state";

export const Co = CoTypedFactory<Unit, Child1>();

