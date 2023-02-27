const assert = require('node:assert/strict')
const { describe, it, afterEach } = require('node:test')
const axios = require('axios')
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const Movies = require('../src/models/movies.js')
const searchCtrl = require('../src/controllers/search.js')

describe('search controller unit tests', () => {
  describe('getImdbResponse unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('getImdbResponse should console log error from imdb', async () => {
      const axiosStub = sinon.stub(axios, 'get').throws(new Error('error conecting to imdb'))
      await assert.rejects(
        async () => {
          await searchCtrl.getImdbResponse('test')
        },
        (err) => {
          assert.strictEqual(axiosStub.calledOnce, true)
          assert.strictEqual(err.message, 'error conecting to imdb')
          return true
        }
      )
    })

    it('getImdbResponse should return data from imdb', async () => {
      const mockResponse = {
        data: {
          title: 'The Matrix',
          year: '1999',
          rated: 'R'
        }
      }
      const axiosStub = sinon.stub(axios, 'get').resolves(mockResponse)
      const result = await searchCtrl.getImdbResponse('test')
      assert.strictEqual(result.title, 'The Matrix')
      assert.strictEqual(result.year, '1999')
      assert.strictEqual(result.rated, 'R')
      assert.strictEqual(axiosStub.calledOnce, true)
    })
  })

  describe('findImdbMoviesBy unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('findImdbMoviesBy should return 400 when search criteria is empty', async () => {
      const movieStub = sinon.stub(Movies, 'find').returns([])
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        query: {
          fail: 'test'
        }
      })
      await searchCtrl.findImdbMoviesBy(req, res)
      assert.strictEqual(res.statusCode, 400)
      assert.strictEqual(res._getJSONData().message, 'missing search criteria')
      assert.strictEqual(movieStub.notCalled, true)
    })

    it('findImdbMoviesBy should return 200 and json data when getImdbResponse resolves', async () => {
      const mockResponse = {
        data: {
          title: 'The Matrix',
          year: '1999',
          rated: 'R'
        }
      }
      const axiosStub = sinon.stub(axios, 'get').resolves(mockResponse)
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          criteria: 'test'
        }
      })
      await searchCtrl.findImdbMoviesBy(req, res)
      assert.strictEqual(res.statusCode, 200)
      assert.strictEqual(res._getJSONData().title, 'The Matrix')
      assert.strictEqual(res._getJSONData().year, '1999')
      assert.strictEqual(res._getJSONData().rated, 'R')
      assert.strictEqual(axiosStub.calledOnce, true)
    })
  })

  describe('searchUtils unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('searchUtils should return 404 when no movie is found by queried title', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          title: 'TEST'
        }
      })
      const movieStub = sinon.stub(Movies, 'find').returns([])
      await searchCtrl.searchUtils(req, res)
      assert.strictEqual(res.statusCode, 404)
      assert.strictEqual(res._getJSONData().data, 'there are no movies with title TEST')
      assert.strictEqual(res._getJSONData().success, true)
      assert.strictEqual(res._getJSONData().count, 0)
      assert.strictEqual(movieStub.calledOnce, true)
    })

    it('searchUtils should return 200 and json data when movie is found by queried title', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          title: 'TEST'
        }
      })
      const mockResponse = {
        success: true,
        count: 2,
        data: [
          {
            title: 'Transformers',
            year: 2007,
            genre: 'Sci-Fi'
          },
          {
            title: 'Transformers: Rise of the Beasts',
            year: 2023,
            genre: 'Sci-Fi'
          }
        ]
      }
      const movieStub = sinon.stub(Movies, 'find').returns(mockResponse)
      await searchCtrl.searchUtils(req, res)
      assert.strictEqual(res.statusCode, 200)
      assert.strictEqual(res._getJSONData().success, true)
      assert.strictEqual(movieStub.calledOnce, true)
    })

    it('searchUtils should return 404 when no movie is found by queried year', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          year: 2007
        }
      })
      const movieStub = sinon.stub(Movies, 'find').returns([])
      await searchCtrl.searchUtils(req, res)
      assert.strictEqual(res.statusCode, 404)
      assert.strictEqual(res._getJSONData().data, 'there are no movies on the year 2007')
      assert.strictEqual(res._getJSONData().success, true)
      assert.strictEqual(res._getJSONData().count, 0)
      assert.strictEqual(movieStub.calledOnce, true)
    })

    it('searchUtils should return 422 when queried year is not a number', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          year: '2A07'
        }
      })
      await searchCtrl.searchUtils(req, res)
      assert.strictEqual(res.statusCode, 422)
      assert.strictEqual(res._getJSONData().message, 'request validation error')
    })

    it('searchUtils should return 200 and json data when movie is found by queried year', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          year: '2007'
        }
      })
      const mockResponse = {
        success: true,
        count: 2,
        data: [
          {
            title: 'Transformers',
            year: 2007,
            genre: 'Sci-Fi'
          },
          {
            title: 'Transformers: Rise of the Beasts',
            year: 2007,
            genre: 'Sci-Fi'
          }
        ]
      }
      const movieStub = sinon.stub(Movies, 'find').returns(mockResponse)
      await searchCtrl.searchUtils(req, res)
      assert.strictEqual(res.statusCode, 200)
      assert.strictEqual(res._getJSONData().success, true)
      assert.strictEqual(movieStub.calledOnce, true)
    })

    it('searchUtils should return 404 when no movie is found by queried genre', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          genre: 'Terror'
        }
      })
      const movieStub = sinon.stub(Movies, 'find').returns([])
      await searchCtrl.searchUtils(req, res)
      assert.strictEqual(res.statusCode, 404)
      assert.strictEqual(res._getJSONData().data, 'there are no movies with genre Terror')
      assert.strictEqual(res._getJSONData().success, true)
      assert.strictEqual(res._getJSONData().count, 0)
      assert.strictEqual(movieStub.calledOnce, true)
    })

    it('searchUtils should return 200 and json data when movie is found by queried genre', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          genre: 'Terror'
        }
      })
      const mockResponse = {
        success: true,
        count: 2,
        data: [
          {
            title: 'Transformers',
            year: 2007,
            genre: 'Sci-Fi'
          },
          {
            title: 'Transformers: Rise of the Beasts',
            year: 2007,
            genre: 'Sci-Fi'
          }
        ]
      }
      const movieStub = sinon.stub(Movies, 'find').returns(mockResponse)
      await searchCtrl.searchUtils(req, res)
      assert.strictEqual(res.statusCode, 200)
      assert.strictEqual(res._getJSONData().success, true)
      assert.strictEqual(movieStub.calledOnce, true)
    })

    it('searchUtils should return 400 when missing search criteria', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          test: 'test'
        }
      })
      await searchCtrl.searchUtils(req, res)
      assert.strictEqual(res.statusCode, 400)
      assert.strictEqual(res._getJSONData().message, 'missing search criteria, use title, year or genre')
    })
  })
})
