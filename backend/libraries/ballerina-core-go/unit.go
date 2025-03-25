package ballerina

type Unit struct {
}

func NewUnit() Unit {
	var p Unit
	return p
}

var DefaultUnit Unit = NewUnit()

type WriterUnit[Delta any] interface{
	Zero() DeltaUnit[Delta]
}
type DeltaUnit[Delta any] interface{
	DeltaBase
}
