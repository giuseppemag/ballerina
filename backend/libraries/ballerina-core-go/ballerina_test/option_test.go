package ballerina_test

import (
	"encoding/json"
	"testing"

	ballerina "ballerina.com/core"
	"github.com/stretchr/testify/require"
)

func TestSomeShouldSerializeCorrectly(t *testing.T) {
	t.Parallel()

	some := ballerina.Some(4)

	data, err := json.Marshal(some)
	require.NoError(t, err)

	require.Equal(t, "{\"Value\":4,\"IsSome\":true}", string(data))
}

func TestNoneShouldSerializeCorrectly(t *testing.T) {
	t.Parallel()

	some := ballerina.None[int]()

	data, err := json.Marshal(some)
	require.NoError(t, err)

	require.Equal(t, "{\"Value\":0,\"IsSome\":false}", string(data))
}

func TestSomeShouldSerializeAndDeserializeCorrectly(t *testing.T) {
	t.Parallel()

	some := ballerina.Some(4)

	data, err := json.Marshal(some)
	require.NoError(t, err)

	var target ballerina.Option[int]

	require.NoError(t, json.Unmarshal(data, &target))

	require.Equal(t, some, target)
}

func TestNoneShouldSerializeAndDeserializeCorrectly(t *testing.T) {
	t.Parallel()

	some := ballerina.None[int]()

	data, err := json.Marshal(some)
	require.NoError(t, err)

	var target ballerina.Option[int]

	require.NoError(t, json.Unmarshal(data, &target))

	require.Equal(t, some, target)
}
