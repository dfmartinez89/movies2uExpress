const { describe, it, before, afterEach, after } = require('node:test')
const assert = require('node:assert/strict')
const testdb = require('../../src/middleware/testdb')

describe('users integration tests', () => {
  before(async () => await testdb.connect())
  afterEach(async () => await testdb.clearDatabase())
  after(async () => await testdb.closeDatabase())

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
      assert.strictEqual(result.message, 'Please provide all required fields', 'Response is not correct')
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
      assert.strictEqual(result.message, 'Please provide all required fields', 'Response is not correct')
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
    it('should return 400 when email is not provided', async () => {
      const res = await fetch('http://localhost:3000/users/login', {
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
      assert.strictEqual(result.message, 'Please provide all required fields', 'Response is not correct')
    })

    it('should return 400 when password is not provided', async () => {
      const res = await fetch('http://localhost:3000/users/login', {
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
      assert.strictEqual(result.message, 'Please provide all required fields', 'Response is not correct')
    })

    it('should return 403 when no user is found for the provided email', async () => {
      const res = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'user',
          email: 'user@user.com'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 403, 'Status code is not correct')
      assert.strictEqual(result.message, 'Invalid email or password', 'Response is not correct')
    })

    it('should return 403 when the provided password is not correct', async () => {
      const res = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'user',
          email: 'test@test.com'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 403, 'Status code is not correct')
      assert.strictEqual(result.message, 'Invalid email or password', 'Response is not correct')
    })

    it('should return 200 when user logs in succesfully', async () => {
      const res = await fetch('http://localhost:3000/users/login', {
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
      assert.strictEqual(res.status, 200, 'Status code is not correct')
      assert.strictEqual(result.email, 'test@test.com', 'Response is not correct')
      assert.strictEqual(result.token.length, 171, 'JWT token is not correct')
    })
  })

  describe('get user tests', () => {
    /* it('should return 403 when user is not authenticated', async () => {
      const res = await fetch('http://localhost:3000/users/me', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 401, 'Status code is not correct')
      assert.strictEqual(result.message, 'Not authorized, token is required', 'Response is not correct')
    }) */

    it('should return 403 when jwt token is not sent in the request', async () => {
      const res = await fetch('http://localhost:3000/users/me', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 401, 'Status code is not correct')
      assert.strictEqual(result.message, 'Not authorized, token is required', 'Response is not correct')
    })

    it('should return 200 and data when user is authenticated', async () => {
      // login user
      const login = await fetch('http://localhost:3000/users/login', {
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
      // get token from login response to send as authorization header
      const loginResult = await login.json()
      const token = loginResult.token
      // get data
      const res = await fetch('http://localhost:3000/users/me', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 200, 'Status code is not correct')
      assert.strictEqual(result.email, 'test@test.com', 'Response is not correct')
      // assert.match(result._id, /^[a-f\d]{24}$/, 'document _id is not correct')
    })
  })
})
