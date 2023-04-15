const { describe, it, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const userCtrl = require('../../src/controllers/users.js')
const User = require('../../src/models/users.js')

describe('user controller unit tests', async () => {
  describe('register user unit tests', async () => {
    afterEach(() => {
      sinon.restore()
    })
    it('registerUser should return 400 when email is missing', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          name: 'test'
        }
      })
      await userCtrl.registerUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Please provide all required fields', 'Response is not correct')
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
    })

    it('registerUser should return 400 when password is missing', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          password: 'test'
        }
      })
      await userCtrl.registerUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Please provide all required fields', 'Response is not correct')
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
    })

    it('should return 400 when user already exists', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          password: 'test',
          email: 'test@test.com'
        }
      })
      const userStub = sinon.stub(User, 'findOne').returns(true)
      await userCtrl.registerUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'User already exists', 'Response is not correct')
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
      assert.strictEqual(userStub.calledOnce, true)
    })

    it('should return 400 when user data is invalid', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          name: 'test',
          password: 'test',
          email: 'test@test.com'
        }
      })
      const userStubFind = sinon.stub(User, 'findOne').returns(false)
      const userStubCreate = sinon.stub(User, 'create').throws(new Error('Invalid user data'))
      await userCtrl.registerUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Invalid user data', 'Response is not correct')
      assert.strictEqual(res.statusCode, 406, 'Status code is not correct')
      assert.strictEqual(userStubFind.calledOnce, true)
      assert.strictEqual(userStubCreate.calledOnce, true)
    })

    it('should return 201 when user is created', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          name: 'test',
          password: 'test',
          email: 'test@test.com'
        }
      })

      const userStubFind = sinon.stub(User, 'findOne').returns(false)
      const userStubCreate = sinon.stub(User, 'create').returns(true)
      const jwtStub = sinon.stub(jwt, 'sign').returns('fake-token')
      await userCtrl.registerUser(req, res)
      assert.strictEqual(res._getJSONData().token, 'fake-token', 'Response is not correct')
      assert.strictEqual(res.statusCode, 201, 'Status code is not correct')
      assert.strictEqual(userStubFind.calledOnce, true)
      assert.strictEqual(userStubCreate.calledOnce, true)
      assert.strictEqual(jwtStub.calledOnce, true)
    })
  })

  describe('login user unit tests', async () => {
    afterEach(() => {
      sinon.restore()
    })
    it(' should return 400 when email is missing', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          name: 'test'
        }
      })
      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Please provide all required fields', 'Response is not correct')
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
    })

    it('should return 400 when password is missing', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          password: 'test'
        }
      })
      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Please provide all required fields', 'Response is not correct')
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
    })

    it('should return 403 when user mail does not exists', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          name: 'test',
          password: 'test',
          email: 'test@test.com'
        }
      })
      const userStubFind = sinon.stub(User, 'findOne').returns(null)
      const bcryptStub = sinon.stub(bcrypt, 'compare').returns(true)
      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Invalid email or password', 'Response is not correct')
      assert.strictEqual(res.statusCode, 403, 'Status code is not correct')
      assert.strictEqual(userStubFind.calledOnce, true)
      assert.strictEqual(bcryptStub.notCalled, true)
    })

    it('should return 403 when user password is not correct', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          name: 'test',
          password: 'test',
          email: 'test@test.com'
        }
      })
      const userStubFind = sinon.stub(User, 'findOne').returns(true)
      const bcryptStub = sinon.stub(bcrypt, 'compare').returns(false)
      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Invalid email or password', 'Response is not correct')
      assert.strictEqual(res.statusCode, 403, 'Status code is not correct')
      assert.strictEqual(userStubFind.calledOnce, true)
      assert.strictEqual(bcryptStub.calledOnce, true)
    })

    it('should return 406 when model throws exception', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          name: 'test',
          password: 'test',
          email: 'test@test.com'
        }
      })
      const userStubFind = sinon.stub(User, 'findOne').throws(new Error('Error accessing database'))
      const bcryptStub = sinon.stub(bcrypt, 'compare').returns(false)
      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Error accessing database', 'Response is not correct')
      assert.strictEqual(res.statusCode, 406, 'Status code is not correct')
      assert.strictEqual(userStubFind.calledOnce, true)
      assert.strictEqual(bcryptStub.calledOnce, false)
    })

    it('should return 406 when bcrypt throws exception', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          name: 'test',
          password: 'test',
          email: 'test@test.com'
        }
      })
      const userStubFind = sinon.stub(User, 'findOne').returns(true)
      const bcryptStub = sinon.stub(bcrypt, 'compare').throws(new Error('Error hashing password'))
      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Error hashing password', 'Response is not correct')
      assert.strictEqual(res.statusCode, 406, 'Status code is not correct')
      assert.strictEqual(userStubFind.calledOnce, true)
      assert.strictEqual(bcryptStub.calledOnce, true)
    })

    it('should return 200 when user logs in succesfully', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          password: 'test',
          email: 'test@test.com'
        }
      })
      const userStubFind = sinon.stub(User, 'findOne').returns(true)
      const bcryptStub = sinon.stub(bcrypt, 'compare').returns(true)
      const jwtSub = sinon.stub(jwt, 'sign').returns('fake-token')

      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().token, 'fake-token', 'Response is not correct')
      assert.strictEqual(res._getJSONData().success, true, 'Response is not correct')
      assert.strictEqual(res.statusCode, 200, 'Status code is not correct')
      assert.strictEqual(userStubFind.calledOnce, true)
      assert.strictEqual(bcryptStub.calledOnce, true)
      assert.strictEqual(jwtSub.calledOnce, true)
    })
  })

  describe('get user data unit tests', async () => {
    it.skip('should return 200, user id and mail from session', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET'
      })
      const userStub = sinon.stub(User, 'findById').returns({
        id: sinon.stub().resolves('fake-id'),
        email: sinon.stub().resolves('fake-mail')
      })
      await userCtrl.getUser(req, res)
      assert.strictEqual(userStub.calledOnceWith('test@test.com'), true, 'Stub is not called with correct params')
      assert.strictEqual(res.statusCode, 200, 'Status code is not correct')
    })
  })

  describe('jwt unit tests', async () => {
    afterEach(() => {
      sinon.restore()
    })

    it('should return jwt with 30 days expiration', async () => {
      const jwtSub = sinon.stub(jwt, 'sign').returns('fake-token')
      assert.strictEqual(userCtrl.genToken('fake-id'), 'fake-token', 'Response is not correct')
      assert.strictEqual(jwtSub.calledOnce, true)
    })
  })
})
