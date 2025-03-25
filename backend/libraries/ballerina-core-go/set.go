package ballerina

type Set[a comparable] []a

func DefaultSet[a comparable]() Set[a] {
	return make([]a, 0)
}

type WriterSet[Delta any, DeltaA any] interface {
	Zero() DeltaSet[Delta, DeltaA]
}

type DeltaSet[Delta any, DeltaA any] interface{
	DeltaBase
}
