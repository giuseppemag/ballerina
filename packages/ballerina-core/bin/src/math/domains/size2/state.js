export const Size2 = {
    Default: Object.assign((width, height) => ({ width, height }), {
        zero: () => Size2.Default(0, 0),
    }),
    Updaters: {},
    Operations: {}
};
//# sourceMappingURL=state.js.map