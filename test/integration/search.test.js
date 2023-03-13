const { describe, it, before, afterEach, after } = require('node:test')
const assert = require('node:assert/strict')
const testDB = require('../../src/middleware/testdb')

describe('search integration tests', () => {
  describe('Search IMDb movies tests', () => {
    /**
     * Connect to a new in-memory database before running any tests.
     */
    before(async () => await testDB.connect())
    /**
     * Clear all test data after every test.
     */
    afterEach(async () => await testDB.clearDatabase())

    /**
     * Remove and close the db and server.
     */
    after(async () => await testDB.closeDatabase())
  })
  it('should return 400 when criteria query param is not provided', async () => {
    const res = await fetch('http://localhost:3000/imdb', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      query: {
        fail: 'test'
      }
    })
    const result = await res.json()
    assert.strictEqual(res.status, 401, 'Status code is not correct')
    assert.strictEqual(result.message, 'Not authorized, token is required', 'Response is not correct')
  })
})
