const mock = <Value, Error>(
  value: () => Value,
  error: () => Error,
  probabilityOfSuccess: number = 0.9,
  averageDelay: number = 0.2
) => {
  const λ = 1 / averageDelay
  const delay = Math.log(1 - Math.random()) / -λ

  return new Promise<Value>((resolve, reject) =>
    setTimeout(() => (Math.random() <= probabilityOfSuccess ? resolve(value()) : reject(error())), delay * 1000)
  )
}

export const Http = { mock }
