export const Vector2 = {
    Default: Object.assign((x, y) => ({ x, y }), {
        zero: () => Vector2.Default(0, 0),
        one_x: () => Vector2.Default(1, 0),
        one_y: () => Vector2.Default(0, 1),
    }),
    Updaters: {},
    Operations: {}
};
//# sourceMappingURL=state.js.map