package ballerina

import (
)

type Array[T any] struct {
  Values []T
}
func MapArray[T, U any](ts []T, f func(T) U) []U {
  us := make([]U, len(ts))
  for i := range ts {
      us[i] = f(ts[i])
  }
  return us
}
