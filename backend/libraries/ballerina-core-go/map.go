package ballerina

type KeyValue[k comparable, v any] struct {
	Key   k
	Value v
}

type Map[a comparable, b any] []KeyValue[a, b]

func DefaultMap[a comparable, b any]() Map[a, b] {
	return make([]KeyValue[a, b], 0)
}

type DeltaMap[DeltaK any, DeltaV any] interface{
	DeltaBase
}
