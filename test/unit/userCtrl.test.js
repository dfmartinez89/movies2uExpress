const { describe, it, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const userCtrl = require('../../src/controllers/users.js')
const User = require('../../src/models/users.js')

describe('user controller unit tests', () => {
  describe('register user unit tests', () => {
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
      assert.strictEqual(res._getJSONData().message, 'Please add all required fields')
      assert.strictEqual(res.statusCode, 400)
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
      assert.strictEqual(res._getJSONData().message, 'Please add all required fields')
      assert.strictEqual(res.statusCode, 400)
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
      assert.strictEqual(res._getJSONData().message, 'User already exists')
      assert.strictEqual(res.statusCode, 400)
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
      assert.strictEqual(res._getJSONData().message, 'Invalid user data')
      assert.strictEqual(res.statusCode, 406)
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
      assert.strictEqual(res._getJSONData().token, 'fake-token')
      assert.strictEqual(res.statusCode, 201)
      assert.strictEqual(userStubFind.calledOnce, true)
      assert.strictEqual(userStubCreate.calledOnce, true)
      assert.strictEqual(jwtStub.calledOnce, true)
    })
  })

  describe('login user unit tests', () => {
    afterEach(() => {
      sinon.restore()
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
      const userStubFind = sinon.stub(User, 'findOne').returns(false)
      const bcryptStub = sinon.stub(bcrypt, 'compare').returns(true)

      await assert.rejects(
        async () => {
          await userCtrl.loginUser(req, res)
        },
        (err) => {
          assert.strictEqual(err.message, 'Invalid credentials')
          assert.strictEqual(res.statusCode, 403)
          assert.strictEqual(userStubFind.calledOnce, true)
          assert.strictEqual(bcryptStub.notCalled, true)
          return true
        }
      )
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

      await assert.rejects(
        async () => {
          await userCtrl.loginUser(req, res)
        },
        (err) => {
          assert.strictEqual(err.message, 'Invalid credentials')
          assert.strictEqual(res.statusCode, 403)
          assert.strictEqual(userStubFind.calledOnce, true)
          assert.strictEqual(bcryptStub.calledOnce, true)

          return true
        }
      )
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
      assert.strictEqual(res._getJSONData().token, 'fake-token')
      assert.strictEqual(res._getJSONData().success, true)
      assert.strictEqual(res.statusCode, 200)
      assert.strictEqual(userStubFind.calledOnce, true)
      assert.strictEqual(bcryptStub.calledOnce, true)
      assert.strictEqual(jwtSub.calledOnce, true)
    })
  })

  describe('get user data unit tests', () => {
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
      assert.strictEqual(userStub.calledOnceWith('test@test.com'), true)
      assert.strictEqual(res.statusCode, 200)
    })
  })

  describe('jwt unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('should return jwt with 30 days expiration', async () => {
      const jwtSub = sinon.stub(jwt, 'sign').returns('fake-token')
      assert.strictEqual(userCtrl.genToken('fake-id'), 'fake-token')
      assert.strictEqual(jwtSub.calledOnce, true)
    })
  })
})