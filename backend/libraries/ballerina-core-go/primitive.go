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

func DefaultFloat64() float64 { 
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


type DeltaInt32EffectsEnum string
const (
  Int32Replace DeltaInt32EffectsEnum = "Int32Replace" 
)
var AllDeltaInt32EffectsEnumCases = [...]DeltaInt32EffectsEnum{ Int32Replace, }

func DefaultDeltaInt32EffectsEnum() DeltaInt32EffectsEnum { return AllDeltaInt32EffectsEnumCases[0]; }

type DeltaInt32 struct {
  DeltaBase
  Discriminator DeltaInt32EffectsEnum
  Replace int32
}
func NewDeltaInt32Replace(value int32) DeltaInt32 {
  return DeltaInt32 {
    Discriminator:Int32Replace,
    Replace:value,
 }
}
func MatchDeltaInt32[Result any](
  onReplace func(int32) (Result, error),
) func (DeltaInt32) (Result, error) {
  return func (delta DeltaInt32) (Result,error) {
    var result Result
    switch delta.Discriminator {
      case "Int32Replace":
        return onReplace(delta.Replace)
    }
    return result, NewInvalidDiscriminatorError(string(delta.Discriminator), "DeltaInt32")
  }
}


type DeltaFloat32EffectsEnum string
const (
  Float32Replace DeltaFloat32EffectsEnum = "Float32Replace" 
)
var AllDeltaFloat32EffectsEnumCases = [...]DeltaFloat32EffectsEnum{ Float32Replace, }

func DefaultDeltaFloat32EffectsEnum() DeltaFloat32EffectsEnum { return AllDeltaFloat32EffectsEnumCases[0]; }

type DeltaFloat32 struct {
  DeltaBase
  Discriminator DeltaFloat32EffectsEnum
  Replace float32
}
func NewDeltaFloat32Replace(value float32) DeltaFloat32 {
  return DeltaFloat32 {
    Discriminator:Float32Replace,
    Replace:value,
 }
}
func MatchDeltaFloat32[Result any](
  onReplace func(float32) (Result, error),
) func (DeltaFloat32) (Result, error) {
  return func (delta DeltaFloat32) (Result,error) {
    var result Result
    switch delta.Discriminator {
      case "Float32Replace":
        return onReplace(delta.Replace)
    }
    return result, NewInvalidDiscriminatorError(string(delta.Discriminator), "DeltaFloat32")
  }
}


type DeltaFloat64EffectsEnum string
const (
  Float64Replace DeltaFloat64EffectsEnum = "Float64Replace" 
)
var AllDeltaFloat64EffectsEnumCases = [...]DeltaFloat64EffectsEnum{ Float64Replace, }

func DefaultDeltaFloat64EffectsEnum() DeltaFloat64EffectsEnum { return AllDeltaFloat64EffectsEnumCases[0]; }

type DeltaFloat64 struct {
  DeltaBase
  Discriminator DeltaFloat64EffectsEnum
  Replace float64
}
func NewDeltaFloat64Replace(value float64) DeltaFloat64 {
  return DeltaFloat64 {
    Discriminator:Float64Replace,
    Replace:value,
 }
}
func MatchDeltaFloat64[Result any](
  onReplace func(float64) (Result, error),
) func (DeltaFloat64) (Result, error) {
  return func (delta DeltaFloat64) (Result,error) {
    var result Result
    switch delta.Discriminator {
      case "Float64Replace":
        return onReplace(delta.Replace)
    }
    return result, NewInvalidDiscriminatorError(string(delta.Discriminator), "DeltaFloat64")
  }
}
