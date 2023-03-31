const assert = require('node:assert/strict')
const { describe, it, afterEach } = require('node:test')
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const Movies = require('../../src/models/movies.js')
const geocoder = require('../../src/utils/geocoder.js')

const moviesCtrl = require('../../src/controllers/movies.js')

describe('movies controller unit tests', () => {
  describe('moviesFindAll unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })
    it('should return 500 when model query throws error', async () => {
      const req = httpMocks.createRequest()
      const res = httpMocks.createResponse()
      const error = new Error('Error finding movies')
      const movieStub = sinon.stub(Movies, 'find').throws(error)
      await moviesCtrl.moviesFindAll(req, res)
      assert.strictEqual(res.statusCode, 500, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, error.message, 'Response is not correct')
      assert.strictEqual(movieStub.calledOnce, true)
    })
    it('should return 200 and the list of movies', async () => {
      const req = httpMocks.createRequest()
      const res = httpMocks.createResponse()
      const movies = [
        {
          geoLocation: {
            type: 'Point',
            coordinates: [
              -2.2666,
              37.09864
            ],
            formattedLocation: ', Tabernas, AN 04200, ES'
          },
          _id: '63c42486110b37fbea4ee930',
          title: 'Transformers',
          year: 2007,
          genre: 'Sci-Fi',
          poster: 'https://m.media-amazon.com/images/M/MV5BNDg1NTU2OWEtM2UzYi00ZWRmLWEwMTktZWNjYWQ1NWM1OThjXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_Ratio0.6757_AL_.jpg',
          rating: 5,
          createdAt: '2023-01-15T16:06:30.906Z'
        },
        {
          geoLocation: {
            type: 'Point',
            coordinates: [
              -2.56731,
              36.9578
            ],
            formattedLocation: 'Calle Artes de Arcos Marco, Alhama de Almeria, AN 04400, ES'
          },
          _id: '63eaa81dd0f8d8b08d730f0e',
          title: 'Transformers: Rise of the Beasts',
          year: 2023,
          genre: 'Sci-Fi',
          poster: 'https://m.media-amazon.com/images/M/MV5BN2FkOWQ3YzItNmNhZi00ZWNlLThjYTMtZWIyZDc2YjQzMjk3XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_Ratio0.6757_AL_.jpg',
          rating: 4,
          createdAt: '2023-02-13T21:14:05.407Z'
        }
      ]
      const movieStub = sinon.stub(Movies, 'find').resolves(movies)
      await moviesCtrl.moviesFindAll(req, res)
      assert.strictEqual(res.statusCode, 200, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().success, true)
      assert.strictEqual(res._getJSONData().count, 2)
      assert.strictEqual(res._getJSONData().data[1].title, 'Transformers: Rise of the Beasts', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnce, true)
    })
  })

  describe('moviesReadOne unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })
    it('should return 400 when movieid is not sent', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          revieweid: '507f1f77bcf86cd799439011'
        }
      })
      await moviesCtrl.moviesReadOne(req, res)
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'Movieid is required', 'Response is not correct')
    })
    it('should return 400 when model query throws error', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          movieid: '507f1f77bcf86cd799439011'
        }
      })
      const error = new Error('movie id is not correct')
      const movieStub = sinon.stub(Movies, 'findById').throws(error)
      await moviesCtrl.moviesReadOne(req, res)
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'movie id is not correct', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnceWith('507f1f77bcf86cd799439011'), true, 'Stub was not called correctly')
    })
    it('should return 404 when no movie is found for the given id', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          movieid: '507f1f77bcf86cd799439011'
        }
      })
      const movieStub = sinon.stub(Movies, 'findById').resolves(null)
      await moviesCtrl.moviesReadOne(req, res)
      assert.strictEqual(res.statusCode, 404, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'Movie not found', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnceWith('507f1f77bcf86cd799439011'), true, 'Stub was not called correctly')
    })
    it('should return 200 and the movie for the given id', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          movieid: '63c42486110b37fbea4ee930'
        }
      })
      const res = httpMocks.createResponse()
      const movie =
        {
          geoLocation: {
            type: 'Point',
            coordinates: [
              -2.2666,
              37.09864
            ],
            formattedLocation: ', Tabernas, AN 04200, ES'
          },
          _id: '63c42486110b37fbea4ee930',
          title: 'Transformers',
          year: 2007,
          genre: 'Sci-Fi',
          poster: 'https://m.media-amazon.com/images/M/MV5BNDg1NTU2OWEtM2UzYi00ZWRmLWEwMTktZWNjYWQ1NWM1OThjXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_Ratio0.6757_AL_.jpg',
          rating: 5,
          createdAt: '2023-01-15T16:06:30.906Z'
        }
      const movieStub = sinon.stub(Movies, 'findById').resolves(movie)
      await moviesCtrl.moviesReadOne(req, res)
      assert.strictEqual(res.statusCode, 200, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().success, true, 'Response is not correct')
      assert.strictEqual(res._getJSONData().data.title, 'Transformers', 'Response is not correct')
      assert.strictEqual(res._getJSONData().data._id, '63c42486110b37fbea4ee930', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnceWith('63c42486110b37fbea4ee930'), true, 'Stub was not called correctly')
    })
  })

  describe('moviesCreate unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })
    it('should return 404 when location is not sent', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          title: 'The Matrix',
          year: 1999,
          genre: 'Sci-Fi',
          poster: 'images/matrix.jpg',
          rating: 0
        }
      })
      await moviesCtrl.moviesCreate(req, res)
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'Location is required', 'Response is not correct')
    })
    it('should return 406 when model throws error', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          title: 'The Matrix',
          year: 1999,
          genre: 'Sci-Fi',
          poster: 'images/matrix.jpg',
          rating: 0,
          location: 'Tabernas, Spain'
        }
      })
      const movieStub = sinon.stub(Movies, 'create').throws(new Error('Movie not created'))
      await moviesCtrl.moviesCreate(req, res)
      assert.strictEqual(res.statusCode, 406, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'Movie not created', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnce, true)
    })
    it('should return 201 when movie is created', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        body: {
          title: 'The Matrix',
          year: 1999,
          genre: 'Sci-Fi',
          poster: 'images/matrix.jpg',
          rating: 5,
          location: 'Tabernas, Spain'
        }
      })
      const mockMovie = {
        _id: '507f1f77bcf86cd799439011',
        title: 'The Matrix',
        year: 1999,
        genre: 'Sci-Fi',
        poster: 'images/matrix.jpg',
        rating: 5,
        location: 'Tabernas, Spain'
      }
      const movie = new Movies(mockMovie)
      const movieStub = sinon.stub(Movies, 'create').resolves(movie)
      await moviesCtrl.moviesCreate(req, res)
      assert.strictEqual(res.statusCode, 201, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().success, true)
      assert.strictEqual(res._getJSONData().data._id, '507f1f77bcf86cd799439011', 'Response is not correct')
      assert.strictEqual(movieStub.called, true)
    })
  })
  describe('moviesUpdateOne unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })
    it('should return 400 when location is not sent', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        params: {
          movieid: '63c42486110b37fbea4ee930'
        },
        body: {
          title: 'The Matrix',
          year: 1999,
          genre: 'Sci-Fi',
          poster: 'images/matrix.jpg',
          rating: 5
        }
      })
      await moviesCtrl.moviesUpdateOne(req, res)
      assert.strictEqual(res.statusCode, 400, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'Location is required', 'Response is not correct')
    })
    it('should return 404 when no movie is found for the given id', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: {
          movieid: '63c42486110b37fbea4ee930'
        },
        body: {
          title: 'The Matrix',
          year: 1999,
          genre: 'Sci-Fi',
          poster: 'images/matrix.jpg',
          rating: 5,
          location: 'Tabernas, Spain'
        }
      })
      const movieStub = sinon.stub(Movies, 'findOneAndUpdate').resolves(null)
      await moviesCtrl.moviesUpdateOne(req, res)
      assert.strictEqual(res.statusCode, 404, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'Movie not found', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnce, true, 'Stub was not called with correct arguments')
    })
    it('should return 406 when model throws error updating the movie', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: {
          movieid: '63c42486110b37fbea4ee930'
        },
        body: {
          title: 'The Matrix',
          year: 1999,
          genre: 'Sci-Fi',
          poster: 'images/matrix.jpg',
          rating: 5,
          location: 'Tabernas, Spain'
        }
      })
      const movieStub = sinon.stub(Movies, 'findOneAndUpdate').throws(new Error('Movie not updated'))
      await moviesCtrl.moviesUpdateOne(req, res)
      assert.strictEqual(res.statusCode, 406, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'Movie not updated', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnce, true, 'Response is not correct')
    })
    it('should return 406 when model throws error updating the movie', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: {
          movieid: '63c42486110b37fbea4ee930'
        },
        body: {
          title: 'The Matrix',
          year: 1999,
          genre: 'Sci-Fi',
          poster: 'images/matrix.jpg',
          rating: 5,
          location: 'Tabernas, Spain'
        }
      })
      const movieStub = sinon.stub(Movies, 'findOneAndUpdate').throws(new Error('Movie not saved'))
      await moviesCtrl.moviesUpdateOne(req, res)
      assert.strictEqual(res.statusCode, 406, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'Movie not saved', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnce, true, 'Stub was not called with correct arguments')
    })
    it('should return 400 when geocoder throws error parsing the location', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: {
          movieid: '63c42486110b37fbea4ee930'
        },
        body: {
          title: 'The Matrix',
          year: 1999,
          genre: 'Sci-Fi',
          poster: 'images/matrix.jpg',
          rating: 5,
          location: 'Tabernas, Spain'
        }
      })
      const movieStub = sinon.stub(Movies, 'findOneAndUpdate').resolves(null)
      const geoStub = sinon.stub(geocoder, 'geocode').throws(new Error('Error in location'))
      await moviesCtrl.moviesUpdateOne(req, res)
      assert.strictEqual(res.statusCode, 406, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'Error in location', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnce, false)
      assert.strictEqual(geoStub.calledOnce, true)
    })
    it('should return 200 when movie is updated', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: {
          movieid: '63c42486110b37fbea4ee930'
        },
        body: {
          title: 'The Matrix',
          year: 1999,
          genre: 'Sci-Fi',
          poster: 'images/matrix.jpg',
          rating: 5,
          location: 'Tabernas, Spain'
        }
      })
      const mockMovie = {
        _id: '63c42486110b37fbea4ee930',
        title: 'The Matrix',
        year: 1999,
        genre: 'Sci-Fi',
        poster: 'images/matrix.jpg',
        rating: 5,
        location: 'Tabernas, Spain'
      }
      const movie = new Movies(mockMovie)
      const movieStub = sinon.stub(Movies, 'findOneAndUpdate').resolves(movie)
      await moviesCtrl.moviesUpdateOne(req, res)
      assert.strictEqual(res.statusCode, 200, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().success, true, 'Response is not correct')
      assert.strictEqual(res._getJSONData().data.title, 'The Matrix', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnce, true, 'Stub was not called with correct arguments')
    })
  })
  describe('moviesDeleteOne unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })
    it('should return 404 when no movie is found for the given id', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'DELETE',
        params: {
          movieid: '63c42486110b37fbea4ee930'
        }
      })
      const movieStub = sinon.stub(Movies, 'findByIdAndRemove').resolves(null)
      await moviesCtrl.moviesDeleteOne(req, res)
      assert.strictEqual(res.statusCode, 404, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'Movie not found', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnceWith('63c42486110b37fbea4ee930'), true, 'Stub was not called with correct arguments')
    })
    it('should return 406 when model layer throws error', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'DELETE',
        params: {
          movieid: '63c42486110b37fbea4ee930'
        }
      })
      const movieStub = sinon.stub(Movies, 'findByIdAndRemove').throws(new Error('Movie not deleted'))
      await moviesCtrl.moviesDeleteOne(req, res)
      assert.strictEqual(res.statusCode, 406, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().message, 'Movie not deleted', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnceWith('63c42486110b37fbea4ee930'), true, 'Stub was not called with correct arguments')
    })
    it('should return 200 and the movie for the given id', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'DELETE',
        params: {
          movieid: '63c42486110b37fbea4ee930'
        },
        body: {
          title: 'The Matrix',
          year: 1999,
          genre: 'Sci-Fi',
          poster: 'images/matrix.jpg',
          rating: 5,
          location: 'Tabernas, Spain'
        }
      })
      const mockMovie = {
        _id: '63c42486110b37fbea4ee930',
        title: 'The Matrix',
        year: 1999,
        genre: 'Sci-Fi',
        poster: 'images/matrix.jpg',
        rating: 5,
        location: 'Tabernas, Spain'
      }
      const movie = new Movies(mockMovie)
      const movieStub = sinon.stub(Movies, 'findByIdAndRemove').resolves(movie)
      await moviesCtrl.moviesDeleteOne(req, res)
      assert.strictEqual(res.statusCode, 204, 'Status code is not correct')
      assert.strictEqual(res._getJSONData().success, true, 'Response is not correct')
      assert.strictEqual(res._getJSONData().movieid, '63c42486110b37fbea4ee930', 'Response is not correct')
      assert.strictEqual(movieStub.calledOnceWith('63c42486110b37fbea4ee930'), true)
    })
  })
})
