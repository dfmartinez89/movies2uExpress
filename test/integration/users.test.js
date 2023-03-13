const { describe, it, before, afterEach, after } = require('node:test')
const assert = require('node:assert/strict')
const testDB = require('../../src/middleware/testdb')

describe('users integration tests', () => {
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

  describe('register user tests', () => {
    it('should return 400 when email is not provided', async () => {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'test'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 400, 'Status code is not correct')
      assert.strictEqual(result.message, 'Please add all required fields', 'Response is not correct')
    })

    it('should return 400 when password is not provided', async () => {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@test.com'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 400, 'Status code is not correct')
      assert.strictEqual(result.message, 'Please add all required fields', 'Response is not correct')
    })

    it('should return 406 when email does not have required length', async () => {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'user12',
          email: 'u@1.c'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 406, 'Status code is not correct')
      assert.strictEqual(result.message, 'User validation failed: email: Path `email` (`u@1.c`) is shorter than the minimum allowed length (6).', 'Response is not correct')
    })

    it('should return 201 when user is created OK', async () => {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'test',
          email: 'test@test.com'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 201, 'Status code is not correct')
      assert.strictEqual(result.email, 'test@test.com', 'Response is not correct')
    })

    it('shouldd return 400 when user is duplicated', async () => {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'test',
          email: 'test@test.com'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 400, 'Status code is not correct')
      assert.strictEqual(result.message, 'User already exists', 'Response is not correct')
    })
  })

  describe('login user tests', () => {
  })
})
