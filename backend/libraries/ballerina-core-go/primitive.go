package ballerina

import (
	"github.com/google/uuid"
	"time"
)

type DeltaIntEffectsEnum string
const (
  IntReplace DeltaIntEffectsEnum = "IntReplace" 
)
var AllDeltaIntEffectsEnumCases = [...]DeltaIntEffectsEnum{ IntReplace, }

func DefaultDeltaIntEffectsEnum() DeltaIntEffectsEnum { return AllDeltaIntEffectsEnumCases[0]; }

type DeltaInt struct {
  DeltaBase
  Discriminator DeltaIntEffectsEnum
  Replace int
}
func NewDeltaIntReplace(value int) DeltaInt {
  return DeltaInt {
    Discriminator:IntReplace,
    Replace:value,
 }
}
func MatchDeltaInt[Result any](
  onReplace func(int) (Result, error),
) func (DeltaInt) (Result, error) {
  return func (delta DeltaInt) (Result,error) {
    var result Result
    switch delta.Discriminator {
      case "IntReplace":
        return onReplace(delta.Replace)
    }
    return result, NewInvalidDiscriminatorError(string(delta.Discriminator), "DeltaInt")
  }
}

func DefaultString() string { 
	return ""
}

func DefaultBool() bool { 
	return false
}

func DefaultInt32() int { 
	return 0
}

func DefaultFloat32() float32 { 
	return 0.0
}

type DeltaStringEffectsEnum string
const (
  StringReplace DeltaStringEffectsEnum = "StringReplace" 
)
var AllDeltaStringEffectsEnumCases = [...]DeltaStringEffectsEnum{ StringReplace, }

func DefaultDeltaStringEffectsEnum() DeltaStringEffectsEnum { return AllDeltaStringEffectsEnumCases[0]; }

type DeltaString struct {
  DeltaBase
  Discriminator DeltaStringEffectsEnum
  Replace string
}
func NewDeltaStringReplace(value string) DeltaString {
  return DeltaString {
    Discriminator:StringReplace,
    Replace:value,
 }
}
func MatchDeltaString[Result any](
  onReplace func(string) (Result, error),
) func (DeltaString) (Result, error) {
  return func (delta DeltaString) (Result,error) {
    var result Result
    switch delta.Discriminator {
      case "StringReplace":
        return onReplace(delta.Replace)
    }
    return result, NewInvalidDiscriminatorError(string(delta.Discriminator), "DeltaString")
  }
}

type DeltaBoolEffectsEnum string
const (
  BoolReplace DeltaBoolEffectsEnum = "BoolReplace" 
)
var AllDeltaBoolEffectsEnumCases = [...]DeltaBoolEffectsEnum{ BoolReplace, }

func DefaultDeltaBoolEffectsEnum() DeltaBoolEffectsEnum { return AllDeltaBoolEffectsEnumCases[0]; }

type DeltaBool struct {
  DeltaBase
  Discriminator DeltaBoolEffectsEnum
  Replace bool
}
func NewDeltaBoolReplace(value bool) DeltaBool {
  return DeltaBool {
    Discriminator:BoolReplace,
    Replace:value,
 }
}
func MatchDeltaBool[Result any](
  onReplace func(bool) (Result, error),
) func (DeltaBool) (Result, error) {
  return func (delta DeltaBool) (Result,error) {
    var result Result
    switch delta.Discriminator {
      case "BoolReplace":
        return onReplace(delta.Replace)
    }
    return result, NewInvalidDiscriminatorError(string(delta.Discriminator), "DeltaBool")
  }
}

type DeltaGuidEffectsEnum string
const (
  GuidReplace DeltaGuidEffectsEnum = "GuidReplace" 
)
var AllDeltaGuidEffectsEnumCases = [...]DeltaGuidEffectsEnum{ GuidReplace, }

func DefaultDeltaGuidEffectsEnum() DeltaGuidEffectsEnum { return AllDeltaGuidEffectsEnumCases[0]; }

type DeltaGuid struct {
  DeltaBase
  Discriminator DeltaGuidEffectsEnum
  Replace uuid.UUID
}
func NewDeltaGuidReplace(value uuid.UUID) DeltaGuid {
  return DeltaGuid {
    Discriminator:GuidReplace,
    Replace:value,
 }
}
func MatchDeltaGuid[Result any](
  onReplace func(uuid.UUID) (Result, error),
) func (DeltaGuid) (Result, error) {
  return func (delta DeltaGuid) (Result,error) {
    var result Result
    switch delta.Discriminator {
      case "GuidReplace":
        return onReplace(delta.Replace)
    }
    return result, NewInvalidDiscriminatorError(string(delta.Discriminator), "DeltaGuid")
  }
}

type DeltaTimeEffectsEnum string
const (
  TimeReplace DeltaTimeEffectsEnum = "TimeReplace" 
)
var AllDeltaTimeEffectsEnumCases = [...]DeltaTimeEffectsEnum{ TimeReplace, }

func DefaultDeltaTimeEffectsEnum() DeltaTimeEffectsEnum { return AllDeltaTimeEffectsEnumCases[0]; }

type DeltaTime struct {
  DeltaBase
  Discriminator DeltaTimeEffectsEnum
  Replace time.Time
}
func NewDeltaTimeReplace(value time.Time) DeltaTime {
  return DeltaTime {
    Discriminator:TimeReplace,
    Replace:value,
 }
}
func MatchDeltaTime[Result any](
  onReplace func(time.Time) (Result, error),
) func (DeltaTime) (Result, error) {
  return func (delta DeltaTime) (Result,error) {
    var result Result
    switch delta.Discriminator {
      case "TimeReplace":
        return onReplace(delta.Replace)
    }
    return result, NewInvalidDiscriminatorError(string(delta.Discriminator), "DeltaTime")
  }
}
