package ballerina

type DeltaBase interface {
}

type RawDeltaBase interface {
}

type RawDeltaRecord interface {
	RawDeltaBase
	GetComponent() string
}

type RawDeltaUnion interface {
	RawDeltaBase
	GetComponent() string
}
