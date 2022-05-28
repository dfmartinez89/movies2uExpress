const index = require('../index');

describe('Index test', () => {
    it('should test that true === true', () => {
        expect(true).toBe(true);
    });

    it('testing home page', () => {
        const req = {},
            res = { render: jest.fn() }
        index.router(req, res)
        expect(res.render.mock.calls[0][0]).toBe('index')
    })
})