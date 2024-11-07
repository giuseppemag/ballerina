import { BasicFun, Unit, Option, Sum, unit } from "../../main";

export type ValidationResult = "valid" | { kind: "error"; errors: Array<string>; };

export type TypeDescriptor<T> =
  T extends Date ? "date" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends string ? "string" :
  T extends Unit ? {
  } & {
    [_ in keyof T]: TypeDescriptor<T[_]>
  } :
  never

export const parse = <E>(entityDescriptor: TypeDescriptor<E>): BasicFun<any, Option<E>> => raw => {
  if (entityDescriptor == "date") {
    if (typeof raw == "string") {
      const parsedTimestamp = Date.parse(raw)
      if (!Number.isNaN(parsedTimestamp))
        return Sum.Default.right(new Date(parsedTimestamp) as E)
    }
    return Sum.Default.left(unit)
  }
  if (entityDescriptor == "number") {
    if (typeof raw == "number") return Sum.Default.right(raw as E)
    else if (typeof raw == "string") {
      let parsedNumber = parseInt(raw)
      if (!Number.isNaN(parsedNumber))
        return Sum.Default.right(parsedNumber as E)
      parsedNumber = parseFloat(raw)
      if (!Number.isNaN(parsedNumber))
        return Sum.Default.right(parsedNumber as E)
    }
    return Sum.Default.left(unit)
  }
  if (entityDescriptor == "boolean") {
    if (typeof raw == "boolean") return Sum.Default.right(raw as E)
    else if (typeof raw == "string") {
      let parsedBoolean = raw == "true" ? true : raw == "false" ? false : undefined
      if (parsedBoolean != undefined)
        return Sum.Default.right(parsedBoolean as E)
    }
    return Sum.Default.left(unit)
  }
  if (entityDescriptor == "string") {
    if (typeof raw == "string") return Sum.Default.right(raw as E)
    return Sum.Default.left(unit)
  }
  let result: E = {} as E
  for (const fieldName in entityDescriptor) {
    const fieldDescriptor = entityDescriptor[fieldName]
    if (fieldName in raw == false) return Sum.Default.left(unit);
    const parsedField = parse<Unit>(fieldDescriptor as any)(raw[fieldName])
    if (parsedField.kind == "l") return Sum.Default.left(unit);
    (result as any)[fieldName] = parsedField.value
  }
  return Sum.Default.right(raw as E)
}
