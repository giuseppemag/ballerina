package ballerina

type Option[a any] struct {
	Sum[Unit, a] // NOTE: struct embedding is needed to be able to access Sum's JSON methods
}

// type some[a any] struct { Option[a]; Value a; Kind string }
func Some[a any](value a) Option[a] {
	return Option[a]{Right[Unit](value)}
}

// type none[a any] struct { Option[a]; Kind string }
func None[a any]() Option[a] {
	return Option[a]{Left[Unit, a](DefaultUnit)}
}

func MatchOption[a any, c any](self Option[a], onSome func(a) c, onNone func() c) c {
	return Fold(self.Sum, func(_ Unit) c { return onNone() }, onSome)
}

func MapOption[a any, b any](self Option[a], f func(a) b) Option[b] {
	return Option[b]{BiMap(self.Sum, id, f)}
}

type WriterOption[Delta any, DeltaA any] interface {
	Value(deltaA DeltaA, delta Delta) (DeltaOption[Delta, DeltaA], error)
	Zero() DeltaOption[Delta, DeltaA]
}

type DeltaOption[Delta any, DeltaA any] interface{
	DeltaBase
}
