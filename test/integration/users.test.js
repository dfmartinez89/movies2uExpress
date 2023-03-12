const { describe, it, after } = require('node:test')
const assert = require('node:assert/strict')

describe('users integration tests', () => {
  describe('register user tests', () => {
    it('shoul return 400 when when email is not provided', async () => {
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
      assert.strictEqual(res.status, 400)
      assert.strictEqual(result.message, 'Please add all required fields')
    })

    it('shoul return 400 when password is not provided', async () => {
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
      assert.strictEqual(res.status, 400)
      assert.strictEqual(result.message, 'Please add all required fields')
    })

    it('shoul return 406 when email does not have required length', async () => {
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
      assert.strictEqual(res.status, 406)
      assert.strictEqual(result.message, 'User validation failed: email: Path `email` (`u@1.c`) is shorter than the minimum allowed length (6).')
    })

    it('shoul return 400 when user is duplicated', async () => {
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
      assert.strictEqual(res.status, 400)
      assert.strictEqual(result.message, 'User already exists')
    })
  })
  after(() => {
    process.exit()
  })
})
