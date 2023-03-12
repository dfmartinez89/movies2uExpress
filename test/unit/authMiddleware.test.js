const assert = require('node:assert/strict')
const { describe, it, afterEach } = require('node:test')
const httpMocks = require('node-mocks-http')
const jwt = require('jsonwebtoken')
const sinon = require('sinon')
const User = require('../../src/models/users.js')
const auth = require('../../src/middleware/auth.js')

describe('auth middleware unit tests', () => {
  afterEach(() => {
    sinon.restore()
  })
  it('protect should return 401 when authorization header is not sent', async () => {
    const res = httpMocks.createResponse()
    const req = httpMocks.createRequest()
    await auth.protect(req, res)
    assert.strictEqual(res.statusCode, 401)
    assert.strictEqual(res._getJSONData().message, 'Not authorized, token is required')
  })

  it('protect should return 401 when authorization header is not Bearer', async () => {
    const res = httpMocks.createResponse()
    const req = httpMocks.createRequest({
      headers: {
        authorization: 'Beare'
      }
    })
    const next = sinon.stub()
    await auth.protect(req, res, next)
    assert.strictEqual(res.statusCode, 401)
    assert.strictEqual(res._getJSONData().message, 'Not authorized, token is required')
  })

  it('protect should return 401 when token is not valid', async () => {
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
    const userStubFind = sinon.stub(User, 'findById').returns({
      select: sinon.stub().resolves(user)
    })
    const jwtStub = sinon.stub(jwt, 'verify').resolves(null)
    await auth.protect(req, res)
    assert.strictEqual(res.statusCode, 401)
    assert.strictEqual(res._getJSONData().message, 'Not authorized')
    assert.strictEqual(jwtStub.calledOnce, true)
    assert.strictEqual(userStubFind.calledOnce, true)
  })

  it('protect should return 401 when no user id is found for the given token', async () => {
    const res = httpMocks.createResponse()
    const req = httpMocks.createRequest({
      headers: {
        authorization: 'Bearer 123abc'
      }
    })
    const userStubFind = sinon.stub(User, 'findById').throws(new Error('User not found'))
    const jwtStub = sinon.stub(jwt, 'verify').resolves({ id: '123' })
    const next = sinon.stub()
    await auth.protect(req, res, next)
    assert.strictEqual(res.statusCode, 401)
    assert.strictEqual(res._getJSONData().message, 'Not authorized')
    assert.strictEqual(userStubFind.calledOnce, true)
    assert.strictEqual(jwtStub.calledOnce, true)
    return true
  })

  it('protect should set req.user with the retrieved user for the given token', async () => {
    const res = httpMocks.createResponse()
    const req = httpMocks.createRequest({
      headers: {
        authorization: 'Bearer 123abc'
      }
    })
    const next = sinon.stub()
    const user = new User({
      email: 'test@test.com',
      password: 'test',
      date: new Date()
    })
    const userStubFind = sinon.stub(User, 'findById').returns({
      select: sinon.stub().resolves(user)
    })
    const jwtStub = sinon.stub(jwt, 'verify').resolves({ id: '123' })
    await auth.protect(req, res, next)
    assert.strictEqual(userStubFind.calledOnce, true)
    assert.strictEqual(jwtStub.calledOnce, true)
    assert.strictEqual(req.user, user)
  })
})
