package ballerina

// type WriterInt interface {
// 	Value(delta Delta) (DeltaInt, error)
// 	Zero() DeltaInt
// }

type DeltaInt interface{
	DeltaBase
}

// type WriterString interface {
// 	Value(delta Delta) (DeltaString, error)
// 	Zero() DeltaString
// }

type DeltaString interface{
	DeltaBase
}

// type WriterBool interface {
// 	Value(delta Delta) (DeltaBool, error)
// 	Zero() DeltaBool
// }

type DeltaBool interface{
	DeltaBase
}
// type WriterGuid interface {
// 	Value(delta Delta) (DeltaBool, error)
// 	Zero() DeltaGuid
// }

type DeltaGuid interface{
	DeltaBase
}

// type WriterTime interface {
// 	Value(delta Delta) (DeltaTime, error)
// 	Zero() DeltaTime
// }

type DeltaTime interface{
	DeltaBase
}
