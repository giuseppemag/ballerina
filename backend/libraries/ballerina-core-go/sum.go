package ballerina

type Sum[a any, b any] struct {
	IsLeft     bool
	ValueLeft  a
	ValueRight b
}

func Left[a any, b any](value a) Sum[a, b] {
	p := new(Sum[a, b])
	p.ValueLeft = value
	p.IsLeft = true
	return *p
}

func Right[a any, b any](value b) Sum[a, b] {
	p := new(Sum[a, b])
	p.ValueRight = value
	return *p
}

type WriterSum[Delta any, DeltaA any, DeltaB any] interface {
	Left(deltaA DeltaA, delta Delta) (DeltaSum[Delta, DeltaA, DeltaB], error)
}

type DeltaSum[Delta any, DeltaA any, DeltaB any] interface{}
