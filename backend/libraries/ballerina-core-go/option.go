package ballerina

type Option[a any] struct {
	Value  a
	IsSome bool
}

// type some[a any] struct { Option[a]; Value a; Kind string }
func Some[a any](value a) Option[a] {
	p := Option[a]{
		Value:  value,
		IsSome: true,
	}
	return p
}

// type none[a any] struct { Option[a]; Kind string }
func None[a any]() Option[a] {
	p := Option[a]{
		IsSome: false,
	}
	return p
}
func MatchOption[a any, c any](self Option[a], onSome func(a) c, onNone func() c) c {
	if self.IsSome {
		return onSome(self.Value)
	} else {
		return onNone()
	}
}
func MapOption[a any, b any](self Option[a], f func(a) b) Option[b] {
	if self.IsSome {
		return Some(f(self.Value))
	} else {
		return None[b]()
	}
}
