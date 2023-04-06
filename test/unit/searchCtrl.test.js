const assert = require('node:assert/strict')
const { describe, it, afterEach } = require('node:test')
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const Movies = require('../../src/models/movies.js')
const searchCtrl = require('../../src/controllers/search.js')

describe('search controller unit tests', async () => {
  describe('getImdbResponse unit tests', async () => {
    afterEach(() => {
      sinon.restore()
    })
    it('getImdbResponse should return error from imdb', async () => {
      const fetchStub = sinon.stub(global, 'fetch').resolves(Response.ok = false)
      await assert.rejects(
        async () => {
          await searchCtrl.getImdbResponse('test')
        },
        (err) => {
          assert.strictEqual(fetchStub.calledOnce, true)
          assert.strictEqual(err.message, 'IMDB response was not successful', 'Response is not correct')
          return true
        }
      )
    })
    it('getImdbResponse should return data from imdb', async () => {
      const mockResponse = {
        ok: true,
        body: {
          searchType: 'Movie',
          expression: 'No country for old men',
          results: [
            {
              id: 'tt0477348',
              resultType: 'Movie',
              image: 'https://m.media-amazon.com/images/M/MV5BMjA5Njk3MjM4OV5BMl5BanBnXkFtZTcwMTc5MTE1MQ@@._V1_Ratio0.6757_AL_.jpg',
              title: 'No Country for Old Men',
              description: '2007 Tommy Lee Jones, Javier Bardem'
            },
            {
              id: 'tt1059210',
              resultType: 'Movie',
              image: 'https://m.media-amazon.com/images/M/MV5BMzFkYjkwYjQtN2EzNC00N2Y4LTgwOTctMjEyNzdmZTY1NmNjXkEyXkFqcGdeQXVyMjkyMzMwNA@@._V1_Ratio0.6757_AL_.jpg',
              title: 'No Country for Old Men',
              description: '1981 TV Movie Trevor Howard, Cyril Cusack'
            }
          ]
        }
      }
      const fetchStub = sinon.stub(global, 'fetch').returns({
        ok: true,
        json: sinon.stub().resolves(mockResponse)
      })
      const result = await searchCtrl.getImdbResponse('test')
      console.log(result)
      assert.strictEqual(result.ok, true, 'Response is not correct')
      assert.strictEqual(result.body.results[0].description, '2007 Tommy Lee Jones, Javier Bardem', 'Response is not correct')
      assert.strictEqual(fetchStub.calledOnce, true)
    })
  })

  describe('findImdbMoviesBy unit tests', async () => {
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
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'missing search criteria', 'Response is not correct')
      assert.strictEqual(movieStub.notCalled, true)
    })
    it('findImdbMoviesBy should return 200 and json data when getImdbResponse resolves', async () => {
      const mockResponse = {
        ok: true,
        body: {
          searchType: 'Movie',
          expression: 'No country for old men',
          results: [
            {
              id: 'tt0477348',
              resultType: 'Movie',
              image: 'https://m.media-amazon.com/images/M/MV5BMjA5Njk3MjM4OV5BMl5BanBnXkFtZTcwMTc5MTE1MQ@@._V1_Ratio0.6757_AL_.jpg',
              title: 'No Country for Old Men',
              description: '2007 Tommy Lee Jones, Javier Bardem'
            },
            {
              id: 'tt1059210',
              resultType: 'Movie',
              image: 'https://m.media-amazon.com/images/M/MV5BMzFkYjkwYjQtN2EzNC00N2Y4LTgwOTctMjEyNzdmZTY1NmNjXkEyXkFqcGdeQXVyMjkyMzMwNA@@._V1_Ratio0.6757_AL_.jpg',
              title: 'No Country for Old Men',
              description: '1981 TV Movie Trevor Howard, Cyril Cusack'
            }
          ]
        }
      }
      const fetchStub = sinon.stub(global, 'fetch').returns({
        ok: true,
        json: sinon.stub().resolves(mockResponse)
      })
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        query: {
          criteria: 'test'
        }
      })
      await searchCtrl.findImdbMoviesBy(req, res)
      assert.strictEqual(res.statusCode, 200, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().body.results[1].title, 'No Country for Old Men', 'Response is not correct')
      assert.strictEqual(res._getJSONData().body.results[1].description, '1981 TV Movie Trevor Howard, Cyril Cusack', 'Response is not correct')
      assert.strictEqual(fetchStub.calledOnce, true)
    })
  })

  describe('searchUtils unit tests', async () => {
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
      assert.strictEqual(res.statusCode, 404, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().data, 'there are no movies with title TEST', 'Response is not correct')
      assert.strictEqual(res._getJSONData().success, true, 'Response is not correct')
      assert.strictEqual(res._getJSONData().count, 0, 'Response is not correct')
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
      assert.strictEqual(res.statusCode, 200, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().success, true, 'Response is not correct')
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
      assert.strictEqual(res.statusCode, 404, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().data, 'there are no movies on the year 2007', 'Response is not correct')
      assert.strictEqual(res._getJSONData().success, true, 'Response is not correct')
      assert.strictEqual(res._getJSONData().count, 0, 'Response is not correct')
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
      assert.strictEqual(res.statusCode, 422, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'request validation error', 'Response is not correct')
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
      assert.strictEqual(res.statusCode, 200, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().success, true, 'Response is not correct')
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
      assert.strictEqual(res.statusCode, 404, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().data, 'there are no movies with genre Terror', 'Response is not correct')
      assert.strictEqual(res._getJSONData().success, true, 'Response is not correct')
      assert.strictEqual(res._getJSONData().count, 0, 'Response is not correct')
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
      assert.strictEqual(res.statusCode, 200, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().success, true, 'Response is not correct')
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
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'missing search criteria, use title, year or genre', 'Response is not correct')
    })
  })
})
