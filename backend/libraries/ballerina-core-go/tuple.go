package ballerina

type Tuple2[a any, b any] struct {
	Item1 a
	Item2 b
}

func NewTuple2[a any, b any](item1 a, item2 b) Tuple2[a, b] {
	var p Tuple2[a, b]
	p.Item1 = item1
	p.Item2 = item2
	return p
}

type Tuple3[a any, b any, c any] struct {
	Item1 a
	Item2 b
	Item3 c
}

func NewTuple3[a any, b any, c any](item1 a, item2 b, item3 c) Tuple3[a, b, c] {
	var p Tuple3[a, b, c]
	p.Item1 = item1
	p.Item2 = item2
	p.Item3 = item3
	return p
}

type WriterTuple2[Delta any, DeltaA any, DeltaB any] interface {
}

type DeltaTuple2[Delta any, DeltaA any, DeltaB any] interface{}

type WriterTuple3[Delta any, DeltaA any, DeltaB any, DeltaC any] interface {
}

type DeltaTuple3[Delta any, DeltaA any, DeltaB any, DeltaC any] interface{}

type WriterTuple4[Delta any, DeltaA any, DeltaB any, DeltaC any, DeltaD any] interface {
}

type DeltaTuple4[Delta any, DeltaA any, DeltaB any, DeltaC any, DeltaD any] interface{}
