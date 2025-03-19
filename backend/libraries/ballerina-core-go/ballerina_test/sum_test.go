package ballerina_test

import (
	"encoding/json"
	"fmt"
	"testing"

	ballerina "ballerina.com/core"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var errLeft = fmt.Errorf("some left error")
var errRight = fmt.Errorf("some right error")

func TestLeftShouldSerializeCorrectly(t *testing.T) {
	t.Parallel()

	left := ballerina.Left[int, string](4)

	data, err := json.Marshal(left)
	require.NoError(t, err)

	require.Equal(t, "{\"IsLeft\":true,\"Left\":4,\"Right\":\"\"}", string(data))
}

func TestRightShouldSerializeCorrectly(t *testing.T) {
	t.Parallel()

	right := ballerina.Left[int, string](4)

	data, err := json.Marshal(right)
	require.NoError(t, err)

	require.Equal(t, "{\"IsLeft\":true,\"Left\":4,\"Right\":\"\"}", string(data))
}

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

func TestEitherEquality(t *testing.T) {
	t.Parallel()
	left0 := ballerina.Left[int, string](0)
	left1 := ballerina.Left[int, string](1)
	right0 := ballerina.Right[int, string]("0")
	right1 := ballerina.Right[int, string]("1")

	assert.Equal(t, left0, left0)
	assert.Equal(t, right0, right0)
	assert.Equal(t, left1, left1)
	assert.Equal(t, right1, right1)

	assert.NotEqual(t, left0, right0)
	assert.NotEqual(t, left0, right1)
	assert.NotEqual(t, left0, left1)
}

func TestBimapLeft(t *testing.T) {
	t.Parallel()
	left := ballerina.Left[int, string](1)

	result := ballerina.BiMap(
		left,
		func(value int) bool {
			return value == 1
		},
		func(value string) string {
			return value + "1"
		},
	)

	assert.Equal(t, result, ballerina.Left[bool, string](true))
}

func TestBimapRight(t *testing.T) {
	t.Parallel()
	left := ballerina.Right[int, string]("1")

	result := ballerina.BiMap(
		left,
		func(value int) bool {
			return value == 1
		},
		func(value string) string {
			return value + "1"
		},
	)

	assert.Equal(t, result, ballerina.Right[bool, string]("11"))
}

func TestBimapLeftWithError(t *testing.T) {
	t.Parallel()
	left := ballerina.Left[int, string](1)

	_, err := ballerina.BiMapWithError(
		left,
		func(value int) (bool, error) {
			return false, errLeft
		},
		func(value string) (string, error) {
			return "", errRight
		},
	)
	require.ErrorIs(t, err, errLeft)
}

func TestBimapRightWithError(t *testing.T) {
	t.Parallel()
	right := ballerina.Right[int, string]("1")

	_, err := ballerina.BiMapWithError(
		right,
		func(value int) (bool, error) {
			return false, errLeft
		},
		func(value string) (string, error) {
			return "", errRight
		},
	)
	require.ErrorIs(t, err, errRight)
}

func TestFoldLeft(t *testing.T) {
	t.Parallel()
	left := ballerina.Left[int, string](1)

	result := ballerina.Fold(
		left,
		func(value int) bool {
			return true
		},
		func(value string) bool {
			return false
		},
	)

	assert.True(t, result)
}

func TestFoldRight(t *testing.T) {
	t.Parallel()
	left := ballerina.Right[int, string]("1")

	result := ballerina.Fold(
		left,
		func(value int) bool {
			return true
		},
		func(value string) bool {
			return false
		},
	)

	assert.False(t, result)
}

func TestFoldLeftWithError(t *testing.T) {
	t.Parallel()
	left := ballerina.Left[int, string](1)

	_, err := ballerina.FoldWithError(
		left,
		func(value int) (bool, error) {
			return false, errLeft
		},
		func(value string) (bool, error) {
			return false, errRight
		},
	)
	require.ErrorIs(t, err, errLeft)
}

func TestFoldRightWithError(t *testing.T) {
	t.Parallel()
	right := ballerina.Right[int, string]("1")

	_, err := ballerina.BiMapWithError(
		right,
		func(value int) (bool, error) {
			return false, errLeft
		},
		func(value string) (bool, error) {
			return false, errRight
		},
	)
	require.ErrorIs(t, err, errRight)
}
