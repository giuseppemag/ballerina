import { Predicate } from "ballerina-core"
import { Set } from "immutable"

export type PersonConfigFlags = "X" | "Y" | "Z"
export type ConfigFormsContext = {
	flags: Set<PersonConfigFlags>
} & { value: any, rootValue: any }
export type PersonConfigFormsLeafPredicates = {
	flag: PersonConfigFlags,
	field: { location: "local" | "root", field: string, value: any },
	isEmpty: { location: "local" | "root", field: string },
}
export const PersonConfigFormsLeafPredicates = {
	flag: (_: PersonConfigFlags): Predicate<ConfigFormsContext> => Predicate(current => {
		return current.flags.has(_)
}),
	field: (_: PersonConfigFormsLeafPredicates["field"]): Predicate<ConfigFormsContext> => Predicate(current =>
		_.location == "local" ? current.value[_.field] == _.value : current.rootValue[_.field] == _.value),
		
	isEmpty: (_: PersonConfigFormsLeafPredicates["isEmpty"]): Predicate<ConfigFormsContext> => Predicate(current =>
		_.location == "local" ? current.value[_.field].isEmpty() : current.rootValue[_.field].isEmpty())
}
