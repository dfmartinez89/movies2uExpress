const { describe, it, afterEach, mock } = require('node:test')
const assert = require('node:assert/strict')
const httpMocks = require('node-mocks-http')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const userCtrl = require('../../../src/controllers/users.js')
const User = require('../../../src/models/users.js')

describe('user controller unit tests', async () => {
  describe('register user unit tests', async () => {
    afterEach(() => {
      mock.restoreAll()
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
      mock.method(User, 'findOne', () => true)
      assert.strictEqual(User.findOne.mock.calls.length, 0)
      await userCtrl.registerUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'User already exists', 'Response is not correct')
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
      assert.strictEqual(User.findOne.mock.calls.length, 1)
      const call = User.findOne.mock.calls[0]
      assert.deepStrictEqual(call.arguments, [{ email: 'test@test.com' }])
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
      mock.method(User, 'findOne', () => false)
      assert.strictEqual(User.findOne.mock.calls.length, 0)
      const mockError = () => {
        throw new Error('Invalid user data')
      }
      mock.method(User, 'create', mockError)
      assert.strictEqual(User.create.mock.calls.length, 0)
      await userCtrl.registerUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Invalid user data', 'Response is not correct')
      assert.strictEqual(res.statusCode, 406, 'Status code is not correct')
      assert.strictEqual(User.findOne.mock.calls.length, 1)
      const callFind = User.findOne.mock.calls[0]
      assert.deepStrictEqual(callFind.arguments, [{ email: 'test@test.com' }])
      assert.strictEqual(User.create.mock.calls.length, 1)
      const callCreate = User.create.mock.calls[0]
      assert.notDeepStrictEqual(callCreate.arguments, [{ email: 'test@test.com', password: '$2a$10$R14vkpu2VMBFSFP.agw/S.24CNJ/W4xY0BtNi/Z4MLUEFfAerFvcq' }])
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
      mock.method(User, 'findOne', () => false)
      assert.strictEqual(User.findOne.mock.calls.length, 0)
      mock.method(User, 'create', () => true)
      assert.strictEqual(User.create.mock.calls.length, 0)
      mock.method(jwt, 'sign', () => 'fake-token')
      assert.strictEqual(jwt.sign.mock.calls.length, 0)
      await userCtrl.registerUser(req, res)
      assert.strictEqual(res._getJSONData().token, 'fake-token', 'Response is not correct')
      assert.strictEqual(res.statusCode, 201, 'Status code is not correct')
      assert.strictEqual(User.findOne.mock.calls.length, 1)
      const callFind = User.findOne.mock.calls[0]
      assert.deepStrictEqual(callFind.arguments, [{ email: 'test@test.com' }])
      assert.strictEqual(User.create.mock.calls.length, 1)
      const callCreate = User.create.mock.calls[0]
      assert.notDeepStrictEqual(callCreate.arguments, [{ email: 'test@test.com', password: '$2a$10$R14vkpu2VMBFSFP.agw/S.24CNJ/W4xY0BtNi/Z4MLUEFfAerFvcq' }])
      assert.strictEqual(jwt.sign.mock.calls.length, 1)
    })
  })

  describe('login user unit tests', async () => {
    afterEach(() => {
      mock.restoreAll()
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
      mock.method(User, 'findOne', () => null)
      assert.strictEqual(User.findOne.mock.calls.length, 0)
      mock.method(bcrypt, 'compare', () => true)
      assert.strictEqual(bcrypt.compare.mock.calls.length, 0)
      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Invalid email or password', 'Response is not correct')
      assert.strictEqual(res.statusCode, 403, 'Status code is not correct')
      assert.strictEqual(User.findOne.mock.calls.length, 1)
      const callFind = User.findOne.mock.calls[0]
      assert.deepStrictEqual(callFind.arguments, [{ email: 'test@test.com' }])
      assert.strictEqual(bcrypt.compare.mock.calls.length, 0)
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
      mock.method(User, 'findOne', () => true)
      assert.strictEqual(User.findOne.mock.calls.length, 0)
      mock.method(bcrypt, 'compare', () => false)
      assert.strictEqual(bcrypt.compare.mock.calls.length, 0)
      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Invalid email or password', 'Response is not correct')
      assert.strictEqual(res.statusCode, 403, 'Status code is not correct')
      assert.strictEqual(User.findOne.mock.calls.length, 1)
      const callFind = User.findOne.mock.calls[0]
      assert.deepStrictEqual(callFind.arguments, [{ email: 'test@test.com' }])
      assert.strictEqual(bcrypt.compare.mock.calls.length, 1)
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
      const mockError = () => {
        throw new Error('Error accessing database')
      }
      mock.method(User, 'findOne', mockError)
      assert.strictEqual(User.findOne.mock.calls.length, 0)
      mock.method(bcrypt, 'compare', () => false)
      assert.strictEqual(bcrypt.compare.mock.calls.length, 0)
      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Error accessing database', 'Response is not correct')
      assert.strictEqual(res.statusCode, 406, 'Status code is not correct')
      assert.strictEqual(User.findOne.mock.calls.length, 1)
      const callFind = User.findOne.mock.calls[0]
      assert.deepStrictEqual(callFind.arguments, [{ email: 'test@test.com' }])
      assert.strictEqual(bcrypt.compare.mock.calls.length, 0)
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
      const mockError = () => {
        throw new Error('Error hashing password')
      }
      mock.method(User, 'findOne', () => true)
      assert.strictEqual(User.findOne.mock.calls.length, 0)
      mock.method(bcrypt, 'compare', mockError)
      assert.strictEqual(bcrypt.compare.mock.calls.length, 0)
      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().message, 'Error hashing password', 'Response is not correct')
      assert.strictEqual(res.statusCode, 406, 'Status code is not correct')
      assert.strictEqual(User.findOne.mock.calls.length, 1)
      const callFind = User.findOne.mock.calls[0]
      assert.deepStrictEqual(callFind.arguments, [{ email: 'test@test.com' }])
      assert.strictEqual(bcrypt.compare.mock.calls.length, 1)
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
      mock.method(User, 'findOne', () => true)
      assert.strictEqual(User.findOne.mock.calls.length, 0)
      mock.method(bcrypt, 'compare', () => true)
      assert.strictEqual(bcrypt.compare.mock.calls.length, 0)
      mock.method(jwt, 'sign', () => 'fake-token')
      assert.strictEqual(jwt.sign.mock.calls.length, 0)
      await userCtrl.loginUser(req, res)
      assert.strictEqual(res._getJSONData().token, 'fake-token', 'Response is not correct')
      assert.strictEqual(res._getJSONData().success, true, 'Response is not correct')
      assert.strictEqual(res.statusCode, 200, 'Status code is not correct')
      assert.strictEqual(User.findOne.mock.calls.length, 1)
      const callFind = User.findOne.mock.calls[0]
      assert.deepStrictEqual(callFind.arguments, [{ email: 'test@test.com' }])
      assert.strictEqual(bcrypt.compare.mock.calls.length, 1)
      assert.strictEqual(jwt.sign.mock.calls.length, 1)
    })
  })

  describe('get user data unit tests', async () => {
    afterEach(() => {
      mock.restoreAll()
    })
    it('should return 200, user id and mail from session', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        user: { id: '507f1f77bcf86cd799439011' }
      })
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@test.com',
        password: '$2a$10$R14vkpu2VMBFSFP.agw/S.24CNJ/W4xY0BtNi/Z4MLUEFfAerFvcq'
      }
      const user = new User(mockUser)
      mock.method(User, 'findById', () => user)
      assert.strictEqual(User.findById.mock.calls.length, 0)
      await userCtrl.getUser(req, res)
      assert.strictEqual(res.statusCode, 200, 'Status code is not correct')
      assert.strictEqual(User.findById.mock.calls.length, 1)
      const callFind = User.findById.mock.calls[0]
      assert.deepStrictEqual(callFind.arguments, ['507f1f77bcf86cd799439011'])
    })
  })

  describe('jwt unit tests', async () => {
    afterEach(() => {
      mock.restoreAll()
    })

    it('should return jwt with 30 days expiration', async () => {
      mock.method(jwt, 'sign', () => 'fake-token')
      assert.strictEqual(jwt.sign.mock.calls.length, 0)
      assert.strictEqual(userCtrl.genToken('fake-id'), 'fake-token', 'Response is not correct')
      assert.strictEqual(jwt.sign.mock.calls.length, 1)
    })
  })
})
