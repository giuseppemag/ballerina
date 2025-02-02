package ballerina

import (
	// "github.com/google/uuid"
)

type KeyValue[k comparable, v any] struct {
	Key k
	Value v
}
type Set[a comparable] []a
type Map[a comparable, b any] []KeyValue[a,b]

type Sum[a any, b any] interface {}
type left[a any, b any] struct { Sum[a,b]; value a }
func Left[a any, b any](value a) Sum[a,b] {
	p := new(left[a,b])
	p.value = value
	return p
}
type right[a any, b any] struct { Sum[a,b]; value b }
func Right[a any, b any](value b) Sum[a,b] {
	p := new(right[a,b])
	p.value = value
	return p
}
func MatchSum[a any, b any, c any](self Sum[a,b], onLeft func(a) c, onRight func (b) c, fallback func () c) c {
	switch v := self.(type) {
	case left[a,b]:
		return onLeft(v.value)
	case right[a,b]:
		return onRight(v.value)
	default:
		return fallback()
	}
}
func MapLeft[a any, b any, a1 any](self Sum[a,b], f func(a) a1) Sum[a1,b] {
	switch v := self.(type) {
	case left[a,b]:
		return Left[a1,b](f(v.value))
	case right[a,b]:
		return Right[a1,b](v.value)
	default:
		return v
	}
}
