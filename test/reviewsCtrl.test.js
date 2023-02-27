const assert = require('node:assert/strict')
const { describe, it, afterEach } = require('node:test')
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const Movies = require('../src/models/movies.js')
const reviewsCtrl = require('../src/controllers/reviews.js')

const callTracker = new assert.CallTracker()
process.on('exit', () => callTracker.verify())

describe('reviews controller unit tests', () => {
  describe('reviewsReadOne unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('should return 404 when no movie is found for the given id', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          movieid: '507f1f77bcf86cd799439011',
          reviewid: '507f1f77bcf86cd799439012'
        }
      })
      const movieStub = sinon.stub(Movies, 'findById')
      movieStub.returns({
        select: sinon.stub().resolves(null)
      })
      await reviewsCtrl.reviewsReadOne(req, res)
      assert.strictEqual(res.statusCode, 404)
      assert.strictEqual(res._getJSONData().message, 'movie not found')
      assert.strictEqual(movieStub.calledOnceWith('507f1f77bcf86cd799439011'), true)
    })

    it('should return 404 when no reviews are found for the given movie', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          movieid: '507f1f77bcf86cd799439011',
          reviewid: '507f1f77bcf86cd799439012'
        }
      })
      const expectedMovie = {
        _id: '123',
        title: 'Example Movie'
      }
      const movieStub = sinon.stub(Movies, 'findById')
      movieStub.returns({
        select: sinon.stub().returnsThis(expectedMovie)
      })
      await reviewsCtrl.reviewsReadOne(req, res)
      assert.strictEqual(res.statusCode, 404)
      assert.strictEqual(res._getJSONData().message, 'No reviews found')
      assert.strictEqual(movieStub.calledOnceWith('507f1f77bcf86cd799439011'), true)
    })

    it('should return 404 when no review is found for the given reviewid', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          movieid: '507f1f77bcf86cd799439011',
          reviewid: '507f1f77bcf86cd799439012'
        }
      })
      const mockMovie = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Transformers',
        reviews: [
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 5,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439013',
            createdAt: '2023-02-25T10:08:31.081Z'
          }
        ]
      }
      const movie = new Movies(mockMovie)
      const movieStub = sinon.stub(Movies, 'findById').returns({
        select: sinon.stub().resolves(movie)
      })
      await reviewsCtrl.reviewsReadOne(req, res)
      assert.strictEqual(movieStub.calledOnceWith('507f1f77bcf86cd799439011'), true)
      assert.strictEqual(res.statusCode, 404)
      assert.strictEqual(res._getJSONData().message, 'Review not found')
    })

    it('should return 400 when model layer call throws an error', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          movieid: '507f1f77bcf86cd799439011',
          reviewid: '507f1f77bcf86cd799439012'
        }
      })
      const movieStub = sinon.stub(Movies, 'findById')
      movieStub.returns({
        select: sinon.stub().throwsException(new Error('error calling model'))
      })
      await reviewsCtrl.reviewsReadOne(req, res)
      assert.strictEqual(res.statusCode, 400)
      assert.strictEqual(res._getJSONData().message, 'error calling model')
      assert.strictEqual(movieStub.calledOnceWith('507f1f77bcf86cd799439011'), true)
    })

    it('should return 200 with movie title and reviews', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          movieid: '507f1f77bcf86cd799439011',
          reviewid: '507f1f77bcf86cd799439012'
        }
      })
      const mockMovie = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Transformers',
        reviews: [
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 5,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439012',
            createdAt: '2023-02-25T10:08:31.081Z'
          }
        ]
      }
      const movie = new Movies(mockMovie) // necesario para tener disponible el metodo id() dentro del prototype
      const movieStub = sinon.stub(Movies, 'findById').withArgs('507f1f77bcf86cd799439011').returns({
        select: sinon.stub().resolves(movie)
      })
      await reviewsCtrl.reviewsReadOne(req, res)
      assert.strictEqual(res.statusCode, 200)
      assert.strictEqual(movieStub.calledOnceWith('507f1f77bcf86cd799439011'), true)
      assert.deepStrictEqual(res._getJSONData(), {
        movie: {
          id: '507f1f77bcf86cd799439011',
          review: {
            _id: '507f1f77bcf86cd799439012',
            author: 'Damian',
            createdAt: '2023-02-25T10:08:31.081Z',
            description: 'The very first movie of the saga is always the best',
            rating: 5
          },
          title: 'Transformers'
        }
      })
    })
  })

  describe('reviewsCreate unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })
    it('should return 400 when reviewLocation is not sent', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        params: {
          movieid: '507f1f77bcf86cd799439011'
        },
        body: {
          author: 'Nabe',
          rating: 4,
          description: 'Too nerdy for me'
        }
      })
      await reviewsCtrl.reviewsCreate(req, res)
      assert.strictEqual(res.statusCode, 400)
      assert.strictEqual(res._getJSONData().message, 'reviewLocation is required')
    })

    it('should return 400 when model layer call throws an error', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        params: {
          movieid: '507f1f77bcf86cd799439011'
        },
        body: {
          author: 'Nabe',
          rating: 4,
          description: 'Too nerdy for me',
          reviewLocation: 'Sevilla, Spain'
        }
      })
      const movieStub = sinon.stub(Movies, 'findById')
      movieStub.withArgs('507f1f77bcf86cd799439011').returns({
        select: sinon.stub().throwsException(new Error('error calling model'))
      })
      await reviewsCtrl.reviewsCreate(req, res)
      assert.strictEqual(res.statusCode, 400)
      assert.strictEqual(res._getJSONData().message, 'error calling model')
      assert.strictEqual(movieStub.calledOnceWith('507f1f77bcf86cd799439011'), true)
    })

    it('should return call doAddReview with correct args', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        params: {
          movieid: '507f1f77bcf86cd799439011'
        },
        body: {
          author: 'Nabe',
          rating: 4,
          description: 'Too nerdy for me',
          reviewLocation: 'Sevilla, Spain'
        }
      })
      const movieStub = sinon.stub(Movies, 'findById').withArgs('507f1f77bcf86cd799439011').returns({
        select: sinon.stub().resolves(null)
      })
      const reviewStub = sinon.stub(reviewsCtrl, 'doAddReview')
      await reviewsCtrl.reviewsCreate(req, res)
      assert.strictEqual(movieStub.calledOnceWith('507f1f77bcf86cd799439011'), true)
      assert.strictEqual(reviewStub.calledOnceWith(req, res), false)
    })
  })

  describe('doAddReview unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('should return 404 when no movie is found by the given movieid', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'POST',
        params: {
          movieid: '507f1f77bcf86cd799439011'
        },
        body: {
          author: 'Nabe',
          rating: 4,
          description: 'Too nerdy for me',
          reviewLocation: 'Sevilla, Spain'
        }
      })
      await reviewsCtrl.doAddReview(req, res, null)
      assert.strictEqual(res.statusCode, 404)
      assert.strictEqual(res._getJSONData().message, 'movie not found')
    })

    it('should push to reviews array the data sent in request, call updateAverageRating and return data of last review added', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          movieid: '507f1f77bcf86cd799439011'
        },
        body: {
          author: 'Nabe',
          rating: 4,
          description: 'Too nerdy for me',
          reviewLocation: 'Sevilla, Spain'
        }
      })
      const mockMovie = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Transformers',
        reviews: [
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 5,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439012',
            createdAt: '2023-02-25T10:08:31.081Z'
          }
        ]
      }
      const movie = new Movies(mockMovie) // necesario para tener disponible el metodo push() dentro del prototype
      const movieStub = sinon.stub(Movies, 'findById').returns({
        select: sinon.stub().withArgs('rating reviews').returnsThis(),
        exec: sinon.stub().resolves(movie)
      })
      const saveStub = sinon.stub(Movies.prototype, 'save').resolves(true)
      const averageStub = sinon.stub(reviewsCtrl, 'updateAverageRating').resolves(true)
      await reviewsCtrl.doAddReview(req, res, movie)
      assert.strictEqual(res.statusCode, 201)
      assert.strictEqual(movie.reviews.length, 2)
      assert.strictEqual(movieStub.calledOnceWith(movie._id), true)
      assert.strictEqual(saveStub.calledOnceWith(movie), true)
      assert.strictEqual(res._getJSONData().success, true)
      assert.deepStrictEqual(res._getJSONData().data.author, 'Nabe')
      assert.deepStrictEqual(res._getJSONData().data.description, 'Too nerdy for me')
      assert.strictEqual(averageStub.calledOnce, false)
    })

    it('should return 406 when model layer call throws an error saving the movie', async () => {
      const res = httpMocks.createResponse()
      const req = httpMocks.createRequest({
        method: 'GET',
        params: {
          movieid: '507f1f77bcf86cd799439011'
        },
        body: {
          author: 'Nabe',
          rating: 4,
          description: 'Too nerdy for me',
          reviewLocation: 'Sevilla, Spain'
        }
      })
      const mockMovie = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Transformers',
        reviews: [
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 5,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439012',
            createdAt: '2023-02-25T10:08:31.081Z'
          }
        ]
      }
      const movie = new Movies(mockMovie)
      const movieStub = sinon.stub(Movies, 'findById').returns({
        select: sinon.stub().withArgs('rating reviews').returnsThis(),
        exec: sinon.stub().resolves(movie)
      })
      const saveStub = sinon.stub(Movies.prototype, 'save').throwsException(new Error('error calling model'))
      await reviewsCtrl.doAddReview(req, res, movie)
      assert.strictEqual(res.statusCode, 406)
      assert.strictEqual(movie.reviews.length, 2)
      assert.strictEqual(movieStub.calledOnceWith(movie._id), false)
      assert.strictEqual(saveStub.calledOnceWith(movie), true)
    })
  })

  describe('updateAverageRating unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('should call doSetAverageRating when movie is found by given id', async () => {
      const mockMovie = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Transformers',
        reviews: [
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 5,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439012',
            createdAt: '2023-02-25T10:08:31.081Z'
          }
        ]
      }
      const movie = new Movies(mockMovie)
      const movieStub = sinon.stub(Movies, 'findById').returns({
        select: sinon.stub().withArgs('rating reviews').returnsThis(),
        exec: sinon.stub().resolves(true)
      })
      const averageStub = sinon.stub(reviewsCtrl, 'doSetAverageRating').resolves(true)
      await reviewsCtrl.updateAverageRating(movie._id)
      assert.strictEqual(movieStub.calledOnceWith(movie._id), true)
      assert.strictEqual(averageStub.calledOnce, false)
    })

    it('should not call doSetAverageRating when model layer call throws an error', async () => {
      const mockMovie = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Transformers',
        reviews: [
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 5,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439012',
            createdAt: '2023-02-25T10:08:31.081Z'
          }
        ]
      }
      const movie = new Movies(mockMovie)
      const movieStub = sinon.stub(Movies, 'findById').returns({
        select: sinon.stub().withArgs('rating reviews').returnsThis(),
        exec: sinon.stub().throwsException(new Error('error calling model'))
      })
      const averageStub = sinon.stub(reviewsCtrl, 'doSetAverageRating').resolves(true)
      await assert.rejects(
        async () => {
          await reviewsCtrl.updateAverageRating(movie._id)
        },
        (err) => {
          assert.strictEqual(averageStub.notCalled, true)
          assert.strictEqual(movieStub.calledOnceWith(movie._id), true)
          assert.strictEqual(err.message, 'error calling model')
          return true
        }
      )
    })
  })

  describe('doSetAverageRating unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('should save average rating of 4', async () => {
      const mockMovie = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Transformers',
        rating: 5,
        reviews: [
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 5,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439012',
            createdAt: '2023-02-25T10:08:31.081Z'
          },
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 4,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439013',
            createdAt: '2023-02-25T10:08:31.081Z'
          },
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 3,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439014',
            createdAt: '2023-02-25T10:08:31.081Z'
          }
        ]
      }
      const movie = new Movies(mockMovie)
      sinon.stub(Movies.prototype, 'save').resolves(true)
      await reviewsCtrl.doSetAverageRating(movie)
      assert.strictEqual(movie.rating, 4)
    })

    it('should calculate new rating in spite of save function throws an error', async () => {
      const mockMovie = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Transformers',
        rating: 5,
        reviews: [
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 5,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439012',
            createdAt: '2023-02-25T10:08:31.081Z'
          },
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 4,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439013',
            createdAt: '2023-02-25T10:08:31.081Z'
          },
          {
            reviewGeoLocation: 'Almeria, Spain',
            author: 'Damian',
            rating: 3,
            description: 'The very first movie of the saga is always the best',
            _id: '507f1f77bcf86cd799439014',
            createdAt: '2023-02-25T10:08:31.081Z'
          }
        ]
      }
      const movie = new Movies(mockMovie)
      sinon.stub(Movies.prototype, 'save').throwsException(new Error('error saving movie'))
      await assert.rejects(
        async () => {
          await reviewsCtrl.doSetAverageRating(movie)
        },
        (err) => {
          assert.strictEqual(movie.rating, 4)
          assert.strictEqual(err.message, 'error saving movie')
          return true
        }
      )
    })
  })

  describe('reviewsUpdateOne unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })
    it.todo('should return 400 when reviewLocation is not sent', async () => {})
    it.todo('should return 404 when not movie is found for the given id', async () => {})
    it.todo('should return 404 when not review is found for the given id', async () => {})
    it.todo('should update the review with the data sent in request', async () => {})
    it.todo('should return 201, call updateAverageRating and return data of review updated', async () => {})
    it.todo('should return 406 when model layer call throws an error saving the movie', async () => {})
    it.todo('should return 404 when the movie has no review', async () => {})
  })

  describe('reviewsDeleteOne unit tests', () => {
    afterEach(() => {
      sinon.restore()
    })
    it.todo('should return 400 when movieid is not sent', async () => {})
    it.todo('should return 400 when reviewid is not sent', async () => {})
    it.todo('should return 404 when not movie is found for the given id', async () => {})
    it.todo('should return 404 when not review is found for the given id', async () => {})
    it.todo('should return 204 when the reviews is removed successfully', async () => {})
    it.todo('should return 406 when model layer call throws an error saving the movie', async () => {})
    it.todo('should return 404 when the movie has no review', async () => {})
    it.todo('should return 400 when model layer call throws an error', async () => {})
  })
})
