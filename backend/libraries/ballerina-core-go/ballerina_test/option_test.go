package ballerina_test

import (
	"encoding/json"
	"testing"

	ballerina "ballerina.com/core"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// run with go test ./...

func TestSomeShouldSerializeCorrectly(t *testing.T) {
	t.Parallel()

	some := ballerina.Some(4)

	data, err := json.Marshal(some)
	require.NoError(t, err)

	require.Equal(t, "{\"IsRight\":true,\"Value\":4}", string(data))
}

func TestNoneShouldSerializeCorrectly(t *testing.T) {
	t.Parallel()

	some := ballerina.None[int]()

	data, err := json.Marshal(some)
	require.NoError(t, err)

	require.Equal(t, "{\"IsRight\":false,\"Value\":{}}", string(data))
}

func TestZerovalueShouldBeNone(t *testing.T) {
	t.Parallel()

	var zero ballerina.Option[int]

	assert.Equal(t, ballerina.None[int](), zero)
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
