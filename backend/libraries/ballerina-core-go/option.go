package ballerina

import (
	"encoding/json"
)

type Option[a any] struct {
	value  a
	isSome bool
}

// type some[a any] struct { Option[a]; Value a; Kind string }
func Some[a any](value a) Option[a] {
	p := Option[a]{
		value:  value,
		isSome: true,
	}
	return p
}

// type none[a any] struct { Option[a]; Kind string }
func None[a any]() Option[a] {
	p := Option[a]{
		isSome: false,
	}
	return p
}
func MatchOption[a any, c any](self Option[a], onSome func(a) c, onNone func() c) c {
	if self.isSome {
		return onSome(self.value)
	} else {
		return onNone()
	}
}
func MapOption[a any, b any](self Option[a], f func(a) b) Option[b] {
	if self.isSome {
		return Some[b](f(self.value))
	} else {
		return None[b]()
	}
}

// A separate private type is needed since Option needs fields to be private, and encoding/json cannot serialize private fields
type optionForSerialization[a any] struct {
	Value  a
	IsSome bool
}

func (o Option[a]) MarshalJSON() ([]byte, error) {
	return json.Marshal(optionForSerialization[a]{
		Value:  o.value,
		IsSome: o.isSome,
	})
}

func (o *Option[a]) UnmarshalJSON(data []byte) error {
	target := optionForSerialization[a]{}

	if err := json.Unmarshal(data, &target); err != nil {
		return err
	}
	o.value = target.Value
	o.isSome = target.IsSome
	return nil
}
