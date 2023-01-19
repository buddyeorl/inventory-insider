const Math = require('./math')
describe("Math", () => {
    it("should be instantiable", () => {
        const math = new Math();
        expect(math).toBeInstanceOf(Math);
    })
})