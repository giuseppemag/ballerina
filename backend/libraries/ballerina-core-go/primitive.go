package ballerina

type WriterInt[Delta any] interface {
	Value(delta Delta) (DeltaInt[Delta], error)
}

type DeltaInt[Delta any] interface{}

type WriterString[Delta any] interface {
	Value(delta Delta) (DeltaString[Delta], error)
}

type DeltaString[Delta any] interface{}

type WriterBool[Delta any] interface {
	Value(delta Delta) (DeltaBool[Delta], error)
}

type DeltaBool[Delta any] interface{}
