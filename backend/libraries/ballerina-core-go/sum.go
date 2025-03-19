package ballerina

import (
	"encoding/json"
	"fmt"
)

type Sum[a any, b any] interface{}
type left[a any, b any] struct {
	Sum[a, b]
	value a
}

type leftForSerialization[a any, b any] struct {
	Sum[a, b]
	Value a `json:"Value,omitempty"`
}

func (l left[a, b]) MarshalJSON() ([]byte, error) {
	return json.Marshal(leftForSerialization[a, b]{
		Value: l.value,
	})
}

func (l *left[a, b]) UnmarshalJSON(data []byte) error {
	target := leftForSerialization[a, b]{}
	if err := json.Unmarshal(data, &target); err != nil {
		return err
	}
	l.value = target.Value
	l.Sum = target.Sum
	return nil
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

type rightForSerialization[a any, b any] struct {
	Sum[a, b]
	Value b `json:"Value,omitempty"`
}

func (l right[a, b]) MarshalJSON() ([]byte, error) {
	return json.Marshal(rightForSerialization[a, b]{
		Value: l.value,
	})
}

func (l *right[a, b]) UnmarshalJSON(data []byte) error {
	target := rightForSerialization[a, b]{}
	if err := json.Unmarshal(data, &target); err != nil {
		return err
	}
	l.value = target.Value
	l.Sum = target.Sum
	return nil
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

type WriterSum[Delta any, DeltaA any, DeltaB any] interface {
	Left(deltaA DeltaA, delta Delta) (DeltaSum[Delta, DeltaA, DeltaB], error)
}

type DeltaSum[Delta any, DeltaA any, DeltaB any] interface{}
