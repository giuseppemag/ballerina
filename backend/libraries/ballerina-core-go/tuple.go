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

type Tuple4[a any, b any, c any, d any] struct {
	Item1 a
	Item2 b
	Item3 c
	Item4 d
}

func NewTuple4[a any, b any, c any, d any](item1 a, item2 b, item3 c, item4 d) Tuple4[a, b, c, d] {
	var p Tuple4[a, b, c, d]
	p.Item1 = item1
	p.Item2 = item2
	p.Item3 = item3
	p.Item4 = item4
	return p
}

type Tuple5[a any, b any, c any, d any, e any] struct {
	Item1 a
	Item2 b
	Item3 c
	Item4 d
	Item5 e
}

func NewTuple5[a any, b any, c any, d any, e any](item1 a, item2 b, item3 c, item4 d, item5 e) Tuple5[a, b, c, d, e] {
	var p Tuple5[a, b, c, d, e]
	p.Item1 = item1
	p.Item2 = item2
	p.Item3 = item3
	p.Item4 = item4
	p.Item5 = item5
	return p
}

type Tuple6[a any, b any, c any, d any, e any, f any] struct {
	Item1 a
	Item2 b
	Item3 c
	Item4 d
	Item5 e
	Item6 f
}

func NewTuple6[a any, b any, c any, d any, e any, f any](item1 a, item2 b, item3 c, item4 d, item5 e, item6 f) Tuple6[a, b, c, d, e, f] {
	var p Tuple6[a, b, c, d, e, f]
	p.Item1 = item1
	p.Item2 = item2
	p.Item3 = item3
	p.Item4 = item4
	p.Item5 = item5
	p.Item6 = item6
	return p
}

type WriterTuple2[DeltaA any, DeltaB any] interface {
	Zero() DeltaTuple2[DeltaA, DeltaB]
}

type DeltaTuple2[DeltaA any, DeltaB any] interface{
	DeltaBase
}

type WriterTuple3[DeltaA any, DeltaB any, DeltaC any] interface {
	Zero() DeltaTuple3[DeltaA, DeltaB, DeltaC]
}

type DeltaTuple3[DeltaA any, DeltaB any, DeltaC any] interface{
	DeltaBase
}

type WriterTuple4[DeltaA any, DeltaB any, DeltaC any, DeltaD any] interface {
	Zero() DeltaTuple4[DeltaA, DeltaB, DeltaC, DeltaD]
}

type DeltaTuple4[DeltaA any, DeltaB any, DeltaC any, DeltaD any] interface{
	DeltaBase
}

type WriterTuple5[DeltaA any, DeltaB any, DeltaC any, DeltaD any, DeltaE any] interface {
	Zero() DeltaTuple5[DeltaA, DeltaB, DeltaC, DeltaD, DeltaE]
}

type DeltaTuple5[DeltaA any, DeltaB any, DeltaC any, DeltaD any, DeltaE any] interface{
	DeltaBase
}

type WriterTuple6[DeltaA any, DeltaB any, DeltaC any, DeltaD any, DeltaE any, DeltaF any] interface {
	Zero() DeltaTuple6[DeltaA, DeltaB, DeltaC, DeltaD, DeltaE, DeltaF]
}

type DeltaTuple6[DeltaA any, DeltaB any, DeltaC any, DeltaD any, DeltaE any, DeltaF any] interface{
	DeltaBase
}
