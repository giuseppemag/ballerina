export interface Match<TParams> {
  params: TParams
}

export const matchPath = <TParams extends Record<string, string>>(
  path: string,
  currentPath: string
): Match<TParams> | null => {
  const paramNames: string[] = []
  const regexPath = path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1))
        return '([^\\/]+)'
      }
      return segment
    })
    .join('\\/')

  const match = currentPath.match(new RegExp(`^${regexPath}$`))
  if (!match) return null

  const params = paramNames.reduce((params, name, index) => {
    // @ts-ignore
    params[name] = match[index + 1]
    return params
  }, {} as TParams)

  return { params }
}
