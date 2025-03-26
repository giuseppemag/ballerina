package ballerina

import (
	"fmt"
)

type EntityNotFoundError struct {
	EntityName string
}

func (err *EntityNotFoundError) Error() string {
	return fmt.Sprintf("%s is not a valid entity name", err.EntityName)
}

func NewEntityNotFoundError(entityName string) error {
	return &EntityNotFoundError{EntityName: entityName}
}

type StreamNotFoundError struct {
	StreamName string
}

func (err *StreamNotFoundError) Error() string {
	return fmt.Sprintf("%s is not a valid stream name", err.StreamName)
}

func NewStreamNotFoundError(streamName string) error {
	return &StreamNotFoundError{StreamName: streamName}
}

type EnumNotFoundError struct {
	EnumName string
}

func (err *EnumNotFoundError) Error() string {
	return fmt.Sprintf("%s is not a valid enum name", err.EnumName)
}

func NewEnumNotFoundError(enumName string) error {
	return &EnumNotFoundError{EnumName: enumName}
}

type InvalidEnumValueCombinationError struct {
	EnumName  string
	EnumValue string
}

func (err *InvalidEnumValueCombinationError) Error() string {
	return fmt.Sprintf("%s/%s is not a valid enum/value combination", err.EnumName, err.EnumValue)
}

func NewInvalidEnumValueCombinationError(enumName string, enumValue string) error {
	return &InvalidEnumValueCombinationError{EnumName: enumName, EnumValue: enumValue}
}

type EntityNameAndDeltaTypeMismatch struct {
	EntityName  string
	Delta DeltaBase
}

func (err *EntityNameAndDeltaTypeMismatch) Error() string {
	return fmt.Sprintf("%s/%A is not a valid entity name/delta combination", err.EntityName, err.Delta)
}

func NewEntityNameAndDeltaTypeMismatch(entityName string, delta DeltaBase)  error {
	return &EntityNameAndDeltaTypeMismatch{EntityName: entityName, Delta: delta}
}