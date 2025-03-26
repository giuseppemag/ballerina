package ballerina

type Set[a comparable] []a

func DefaultSet[a comparable]() Set[a] {
	return make([]a, 0)
}

type WriterSet[DeltaA any] interface {
	Zero() DeltaSet[DeltaA]
}

type DeltaSet[DeltaA any] interface{
	DeltaBase
}
