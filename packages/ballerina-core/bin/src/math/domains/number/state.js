export const numberRepo = {
    Operations: {
        lerp: (a, min, max) => min + (max - min) * a,
        clamp: (a, min, max) => Math.max(Math.min(a, max), min),
    }
};
//# sourceMappingURL=state.js.map