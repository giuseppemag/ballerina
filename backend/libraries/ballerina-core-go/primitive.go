package ballerina

type WriterInt[Delta any] interface {
	Value(delta Delta) (DeltaInt[Delta], error)
}

type DeltaInt[Delta any] interface{
	DeltaBase[Delta]
}

type WriterString[Delta any] interface {
	Value(delta Delta) (DeltaString[Delta], error)
}

type DeltaString[Delta any] interface{
	DeltaBase[Delta]
}

type WriterBool[Delta any] interface {
	Value(delta Delta) (DeltaBool[Delta], error)
}

type DeltaBool[Delta any] interface{
	DeltaBase[Delta]
}
type WriterGuid[Delta any] interface {
	Value(delta Delta) (DeltaBool[Delta], error)
}

type DeltaGuid[Delta any] interface{
	DeltaBase[Delta]
}

type WriterTime[Delta any] interface {
	Value(delta Delta) (DeltaTime[Delta], error)
}

type DeltaTime[Delta any] interface{
	DeltaBase[Delta]
}
