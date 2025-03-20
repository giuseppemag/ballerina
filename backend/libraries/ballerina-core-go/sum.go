package ballerina

import (
	"encoding/json"
)

type Sum[a any, b any] struct {
	// NOTE: Important: all of these attributes must be private.
	// Getting values out of Sum can only be done through Fold
	isLeft bool

	left  a
	right b
}

func Left[L any, R any](value L) Sum[L, R] {
	return Sum[L, R]{
		isLeft: true,
		left:   value,
	}
}

func Right[L any, R any](value R) Sum[L, R] {
	return Sum[L, R]{
		isLeft: false,
		right:  value,
	}
}

func BiMap[L any, R any, LO any, RO any](e Sum[L, R], leftMap func(L) LO, rightMap func(R) RO) Sum[LO, RO] {
	if e.isLeft {
		return Left[LO, RO](leftMap(e.left))
	}
	return Right[LO, RO](rightMap(e.right))
}

func BiMapWithError[L any, R any, LO any, RO any](e Sum[L, R], leftMap func(L) (LO, error), rightMap func(R) (RO, error)) (Sum[LO, RO], error) {
	if e.isLeft {
		output, err := leftMap(e.left)
		if err != nil {
			return Sum[LO, RO]{}, err
		}
		return Left[LO, RO](output), nil
	}
	output, err := rightMap(e.right)
	if err != nil {
		return Sum[LO, RO]{}, err
	}
	return Right[LO, RO](output), nil
}

func Fold[L any, R any, O any](e Sum[L, R], leftMap func(L) O, rightMap func(R) O) O {
	if e.isLeft {
		return leftMap(e.left)
	}
	return rightMap(e.right)
}

func FoldWithError[L any, R any, O any](e Sum[L, R], leftMap func(L) (O, error), rightMap func(R) (O, error)) (O, error) {
	if e.isLeft {
		return leftMap(e.left)
	}
	return rightMap(e.right)
}

type WriterSum[Delta any, DeltaA any, DeltaB any] interface {
	Left(deltaA DeltaA, delta Delta) (DeltaSum[Delta, DeltaA, DeltaB], error)
}

type DeltaSum[Delta any, DeltaA any, DeltaB any] interface{}

// Serialization

type sumForSerialization[a any] struct {
	IsLeft bool
	Value  a
}

func (s Sum[a, b]) MarshalJSON() ([]byte, error) {
	return FoldWithError(
		s,
		func(left a) ([]byte, error) {
			return json.Marshal(sumForSerialization[a]{
				IsLeft: true,
				Value:  left,
			})
		},
		func(right b) ([]byte, error) {
			return json.Marshal(sumForSerialization[b]{
				IsLeft: false,
				Value:  right,
			})
		},
	)
}

type inspectIsLeft struct {
	IsLeft bool
}

func (s *Sum[a, b]) UnmarshalJSON(data []byte) error {
	var i inspectIsLeft
	err := json.Unmarshal(data, &i)
	if err != nil {
		return err
	}
	s.isLeft = i.IsLeft
	if s.isLeft {
		var left sumForSerialization[a]
		err = json.Unmarshal(data, &left)
		if err != nil {
			return err
		}
		s.left = left.Value
	} else {
		var right sumForSerialization[b]
		err = json.Unmarshal(data, &right)
		if err != nil {
			return err
		}
		s.right = right.Value
	}
	return nil
}
