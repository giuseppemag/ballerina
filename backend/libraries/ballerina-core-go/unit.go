package ballerina

import (
)

type Unit struct {
}
func NewUnit() *Unit {
	p := new(Unit)
	return p
}
var DefaultUnit Unit = *NewUnit()
