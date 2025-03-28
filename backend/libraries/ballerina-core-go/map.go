package ballerina

type KeyValue[k comparable, v any] struct {
	Key   k
	Value v
}

type Map[k comparable, v any] []KeyValue[k, v]

func DefaultMap[k comparable, v any]() Map[k, v] {
	return make([]KeyValue[k, v], 0)
}

type DeltaMapEffectsEnum string
const (
  MapReplace DeltaMapEffectsEnum = "MapReplace" 
  MapValue DeltaMapEffectsEnum = "MapValue" 
  MapAdd DeltaMapEffectsEnum = "MapAdd" 
  MapRemove DeltaMapEffectsEnum = "MapRemove" 
)
var AllDeltaMapEffectsEnumCases = [...]DeltaMapEffectsEnum{ MapReplace, MapValue, MapAdd, MapRemove }

func DefaultDeltaMapEffectsEnum() DeltaMapEffectsEnum { return AllDeltaMapEffectsEnumCases[0]; }

type DeltaMap[k comparable, v any, deltaK any, deltaV any] struct{
	DeltaBase
	Discriminator DeltaMapEffectsEnum
	Replace Map[k, v]
	Value Tuple2[k, deltaV]
	Add Tuple2[k, v]
	Remove k
}
func NewDeltaMapReplace[k comparable, v any, deltaK any, deltaV any](value Map[k, v]) DeltaMap[k, v, deltaK, deltaV] {
  return DeltaMap[k, v, deltaK, deltaV] {
    Discriminator:MapReplace,
    Replace:value,
 }
}
func NewDeltaMapValue[k comparable, v any, deltaK any, deltaV any](index k, delta deltaV) DeltaMap[k, v, deltaK, deltaV] {
  return DeltaMap[k, v, deltaK, deltaV] {
    Discriminator:MapValue,
    Value:NewTuple2(index, delta),
 }
}
func NewDeltaMapAdd[k comparable, v any, deltaK any, deltaV any](newElement Tuple2[k, v]) DeltaMap[k, v, deltaK, deltaV] {
  return DeltaMap[k, v, deltaK, deltaV] {
    Discriminator:MapAdd,
    Add:newElement,
 }
}
func NewDeltaMapRemove[k comparable, v any, deltaK any, deltaV any](index k) DeltaMap[k, v, deltaK, deltaV] {
  return DeltaMap[k, v, deltaK, deltaV] {
    Discriminator:MapRemove,
    Remove:index,
 }
}

func MatchDeltaMap[k comparable, v any, deltaK any, deltaV any, Result any](
  onReplace func(Map[k, v]) (Result, error),
  onValue func(Tuple2[k, deltaV]) (Result, error),
  onAdd func(Tuple2[k, v]) (Result, error),
  onRemove func(k) (Result, error),
) func (DeltaMap[k, v, deltaK, deltaV]) (Result, error) {
  return func (delta DeltaMap[k, v, deltaK, deltaV]) (Result,error) {
    var result Result
    switch delta.Discriminator {
      case "MapReplace":
        return onReplace(delta.Replace)
      case "MapValue":
        return onValue(delta.Value)
      case "MapAdd":
        return onAdd(delta.Add)
      case "MapRemove":
        return onRemove(delta.Remove)
			}
    return result, NewInvalidDiscriminatorError(string(delta.Discriminator), "DeltaMap")
  }
}
