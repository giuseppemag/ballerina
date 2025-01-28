package ballerina

import (
)

type Range struct {
	Start, Count int
}
func NewRange(start int, count int) *Range {
	p := new(Range)
	p.Start = start
	p.Count = count
	return p
}
