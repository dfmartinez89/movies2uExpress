const assert = require('node:assert/strict')
const { describe, it, afterEach, mock } = require('node:test')
const httpMocks = require('node-mocks-http')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/users.js')
const auth = require('../../src/middleware/auth.js')

const callTracker = new assert.CallTracker()
process.on('exit', () => callTracker.verify())

describe('auth middleware unit tests', async () => {
  afterEach(() => {
    mock.restoreAll()
  })
  it('protect should return 401 when authorization header is not sent', async () => {
    const res = httpMocks.createResponse()
    const req = httpMocks.createRequest()
    await auth.protect(req, res)
    assert.strictEqual(res.statusCode, 401, 'Status code is not correct')
    assert.strictEqual(res._getJSONData().message, 'Not authorized, token is required', 'Response is not correct')
  })

  it('protect should return 401 when authorization header is not Bearer', async () => {
    const res = httpMocks.createResponse()
    const req = httpMocks.createRequest({
      headers: {
        authorization: 'Beare'
      }
    })
    const next = mock.fn()
    await auth.protect(req, res, next)
    assert.strictEqual(res.statusCode, 401, 'Status code is not correct')
    assert.strictEqual(res._getJSONData().message, 'Not authorized, token is required', 'Response is not correct')
  })

  it('protect should return 401 when token is not valid', async () => {
    const res = httpMocks.createResponse()
    const req = httpMocks.createRequest({
      headers: {
        authorization: 'Bearer 123abc'
      }
    })
    mock.method(jwt, 'verify', () => null)
    assert.strictEqual(jwt.verify.mock.calls.length, 0)
    await auth.protect(req, res)
    assert.strictEqual(res.statusCode, 401, 'Status code is not correct')
    assert.strictEqual(res._getJSONData().message, 'Not authorized', 'Response is not correct')
    assert.strictEqual(jwt.verify.mock.calls.length, 1)
  })

  it('protect should return 401 when no user id is found for the given token', async () => {
    const res = httpMocks.createResponse()
    const req = httpMocks.createRequest({
      headers: {
        authorization: 'Bearer 123abc'
      }
    })
    const token = { id: '123' }
    mock.method(jwt, 'verify', () => token)
    assert.strictEqual(jwt.verify.mock.calls.length, 0)
    mock.method(User, 'findById', () => null)
    assert.strictEqual(User.findById.mock.calls.length, 0)
    const next = mock.fn()
    await auth.protect(req, res, next)
    assert.strictEqual(res.statusCode, 401, 'Status code is not correct')
    assert.strictEqual(res._getJSONData().message, 'Not authorized', 'Response is not correct')
    assert.strictEqual(jwt.verify.mock.calls.length, 1)
    assert.strictEqual(User.findById.mock.calls.length, 1)
    const call = User.findById.mock.calls[0]
    assert.deepStrictEqual(call.arguments, ['123'])
  })

  it('protect should set req.user with the retrieved user for the given token', async () => {
    const res = httpMocks.createResponse()
    const req = httpMocks.createRequest({
      headers: {
        authorization: 'Bearer 123abc'
      }
    })
    const user = new User({
      email: 'test@test.com',
      password: 'test',
      date: new Date()
    })
    const token = { id: '123' }
    const mockFindById = () => ({
      select: () => user
    })
    mock.method(jwt, 'verify', () => token)
    assert.strictEqual(jwt.verify.mock.calls.length, 0)
    mock.method(User, 'findById', mockFindById)
    assert.strictEqual(User.findById.mock.calls.length, 0)
    const next = mock.fn()
    await auth.protect(req, res, next)
    assert.strictEqual(req.user, user)
    assert.strictEqual(jwt.verify.mock.calls.length, 1)
    assert.strictEqual(User.findById.mock.calls.length, 1)
    const call = User.findById.mock.calls[0]
    assert.deepStrictEqual(call.arguments, ['123'])
  })
})
