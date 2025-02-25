package ballerina

import (
)

type Unit struct {
}
func NewUnit() Unit {
	var p Unit
	return p
}
var DefaultUnit Unit = NewUnit()
