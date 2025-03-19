package ballerina_test

import (
	"encoding/json"
	"testing"

	ballerina "ballerina.com/core"
	"github.com/stretchr/testify/require"
)

func TestLeftShouldSerializeAndDeserializeCorrectly(t *testing.T) {
	t.Parallel()

	left := ballerina.Left[int, string](4)

	data, err := json.Marshal(left)
	require.NoError(t, err)

	var target ballerina.Sum[int, string]

	require.NoError(t, json.Unmarshal(data, &target))

	require.Equal(t, left, target)
}

func TestRightShouldSerializeAndDeserializeCorrectly(t *testing.T) {
	t.Parallel()

	left := ballerina.Right[int, string]("hello")

	data, err := json.Marshal(left)
	require.NoError(t, err)

	var target ballerina.Sum[int, string]

	require.NoError(t, json.Unmarshal(data, &target))

	require.Equal(t, left, target)
}
