function Math() {
    // Constructor logic goes here...
}

Math.add = function (a, b) {
    if (a == null || b == null) {
        return NaN;
    }
    if (typeof a !== "number" || typeof b !== "number") {
        return NaN;
    }
    return a + b;
}
module.exports = Math;