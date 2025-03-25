package ballerina

type WriterInt[Delta any] interface {
	Value(delta Delta) (DeltaInt[Delta], error)
	Zero() DeltaInt[Delta]
}

type DeltaInt[Delta any] interface{
	DeltaBase
}

type WriterString[Delta any] interface {
	Value(delta Delta) (DeltaString[Delta], error)
	Zero() DeltaString[Delta]
}

type DeltaString[Delta any] interface{
	DeltaBase
}

type WriterBool[Delta any] interface {
	Value(delta Delta) (DeltaBool[Delta], error)
	Zero() DeltaBool[Delta]
}

type DeltaBool[Delta any] interface{
	DeltaBase
}
type WriterGuid[Delta any] interface {
	Value(delta Delta) (DeltaBool[Delta], error)
	Zero() DeltaGuid[Delta]
}

type DeltaGuid[Delta any] interface{
	DeltaBase
}

type WriterTime[Delta any] interface {
	Value(delta Delta) (DeltaTime[Delta], error)
	Zero() DeltaTime[Delta]
}

type DeltaTime[Delta any] interface{
	DeltaBase
}
