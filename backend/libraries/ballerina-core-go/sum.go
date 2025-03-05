package ballerina

import (
	"fmt"
)

type KeyValue[k comparable, v any] struct {
	Key   k
	Value v
}
type Set[a comparable] []a
type Map[a comparable, b any] []KeyValue[a, b]

type Sum[a any, b any] interface{}
type left[a any, b any] struct {
	Sum[a, b]
	value a
}

func Left[a any, b any](value a) Sum[a, b] {
	p := new(left[a, b])
	p.value = value
	return p
}

type right[a any, b any] struct {
	Sum[a, b]
	value b
}

func Right[a any, b any](value b) Sum[a, b] {
	p := new(right[a, b])
	p.value = value
	return p
}
func MatchSum[a any, b any, c any](self Sum[a, b], onLeft func(a) c, onRight func(b) c) (c, error) {
	switch v := self.(type) {
	case left[a, b]:
		return onLeft(v.value), nil
	case right[a, b]:
		return onRight(v.value), nil
	default:
		var res c
		return res, fmt.Errorf("%s is not a valid sum instance", self)
	}
}
func MapLeft[a any, b any, a1 any](self Sum[a, b], f func(a) a1) (Sum[a1, b], error) {
	switch v := self.(type) {
	case left[a, b]:
		return Left[a1, b](f(v.value)), nil
	case right[a, b]:
		return Right[a1](v.value), nil
	default:
		var res Sum[a1, b]
		return res, fmt.Errorf("%s is not a valid sum instance", self)
	}
}
