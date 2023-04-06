const { describe, it, before, afterEach, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const testdb = require('../../src/middleware/testdb')

let token

describe('Reviews integration tests', async () => {
  before(async () => {
    await testdb.connect()
  })
  beforeEach(async () => {
    await testdb.initialData()
  })
  afterEach(async () => {
    await testdb.clearDatabase()
  })
  after(async () => {
    await testdb.closeDatabase()
  })
  describe('Get the reviews of a movie tests', async () => {
    it('should return the 404 when no movies is found for the provided movieid', async () => {
      const res = await fetch('http://localhost:3000/movies/6428a0765d38b76f6dbfa746/reviews/641e0f79f95fbd4a30067fdm', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.message, 'Movie not found', 'Response is not correct')
    })
    it('should return the 404 when no reviews are found for the provided movieid', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fda/reviews/641e0f79f95fbd4a30067fdm', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.message, 'No reviews found', 'Response is not correct')
    })
    it('should return the 404 when no review is found for the provided reviewid', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fde/reviews/641e0f79f95fbd4a30067fdc', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.message, 'Review not found', 'Response is not correct')
    })
    it('should return the 200 when a review is found for the provided reviewid', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fde/reviews/6428a9b7cff67d6c149f6a57', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 200, 'Status code is not correct')
      assert.strictEqual(result.movie.title, 'The Matrix Revolutions', 'Response is not correct')
      assert.strictEqual(result.movie.id, '641e0f79f95fbd4a30067fde', 'Response is not correct')
      assert.strictEqual(result.movie.review.author, 'Frodo', 'Response is not correct')
      assert.strictEqual(result.movie.review.description, 'Great movie', 'Response is not correct')
    })
  })
  describe('Create a new review tests', async () => {
    it('should return the 404 when movie is not found for the provided id', async () => {
      const res = await fetch('http://localhost:3000/movies/6428a9b7cff67d6c149f6a57/reviews', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          author: 'Gandalf',
          rating: 2,
          description: 'Boring',
          reviewLocation: 'Vera, Almeria, Andalucia'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.message, 'Movie not found', 'Response is not correct')
    })
    it('should return the 400 when reviewLocation is not provided', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fde/reviews', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          author: 'Gandalf',
          rating: 2,
          description: 'Boring'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 400, 'Status code is not correct')
      assert.strictEqual(result.message, 'reviewLocation is required', 'Response is not correct')
    })
    it('should return the 201 when review is created', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fde/reviews/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          author: 'Gandalf',
          rating: 2,
          description: 'Boring',
          reviewLocation: 'Vera, Almeria, Andalucia'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 201, 'Status code is not correct')
      assert.strictEqual(result.success, true, 'Response is not correct')
      assert.strictEqual(result.data.author, 'Gandalf', 'Response is not correct')
    })
  })
  describe('Update a review tests', async () => {
    it('should return the 401 when user is not authenticated', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fde/reviews/6428a9b7cff67d6c149f6a57', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          author: 'Frodo',
          rating: 5,
          description: 'Great movie, GOAT',
          reviewLocation: 'Vera, Almeria, Andalucia'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 401, 'Status code is not correct')
      assert.strictEqual(result.message, 'Not authorized, token is required', 'Response is not correct')
    })
    it('should return the 400 when reviewLocation is not provided', async () => {
      // create user
      const register = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'reviews',
          email: 'reviews@test.com'
        })
      })
      // get token from login response to send as authorization header
      const loginResult = await register.json()
      token = loginResult.token
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fde/reviews/6428a9b7cff67d6c149f6a57', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          author: 'Frodo',
          rating: 5,
          description: 'Great movie, GOAT'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 400, 'Status code is not correct')
      assert.strictEqual(result.message, 'reviewLocation is required', 'Response is not correct')
    })
    it('should return the 404 when movie is not found for the provided movieid', async () => {
      const res = await fetch('http://localhost:3000/movies/6428a9b7cff67d6c149f6a58/reviews/6428a9b7cff67d6c149f6a57', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          author: 'Frodo',
          rating: 5,
          description: 'Great movie, GOAT',
          reviewLocation: 'Vera, Almeria, Andalucia'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.message, 'Movie not found', 'Response is not correct')
    })
    it('should return the 404 when the movie has not reviews', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fdc/reviews/6428a9b7cff67d6c149f6a57', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          author: 'Frodo',
          rating: 5,
          description: 'Great movie, GOAT',
          reviewLocation: 'Vera, Almeria, Andalucia'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.message, 'No review to update', 'Response is not correct')
    })
    it('should return the 404 when no review was found for the provided reviewid', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fde/reviews/6428a9b7cff67d6c149f6a58', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          author: 'Frodo',
          rating: 5,
          description: 'Great movie, GOAT',
          reviewLocation: 'Vera, Almeria, Andalucia'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.message, 'Review not found', 'Response is not correct')
    })
    it('should return the 201 when no review was found for the provided reviewid', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fde/reviews/6428a9b7cff67d6c149f6a57', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          author: 'Frodo',
          rating: 5,
          description: 'Great movie, GOAT',
          reviewLocation: 'Vera, Almeria, Andalucia'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 201, 'Status code is not correct')
      assert.strictEqual(result.success, true, 'Response is not correct')
      assert.strictEqual(result.data.description, 'Great movie, GOAT', 'Response is not correct')
    })
  })
  describe('Delete a review tests', async () => {
    it('should return the 401 when user is not authenticated', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fde/reviews/6428a9b7cff67d6c149f6a57', {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 401, 'Status code is not correct')
      assert.strictEqual(result.message, 'Not authorized, token is required', 'Response is not correct')
    })
    it('should return the 404 when movie is not found for the provided movieid', async () => {
      const res = await fetch('http://localhost:3000/movies/6428a9b7cff67d6c149f6a58/reviews/6428a9b7cff67d6c149f6a57', {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.message, 'Movie not found', 'Response is not correct')
    })
    it('should return the 404 when the movie has not reviews', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fdc/reviews/6428a9b7cff67d6c149f6a57', {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.message, 'No review to delete', 'Response is not correct')
    })
    it('should return the 404 when no review was found for the provided reviewid', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fde/reviews/6428a9b7cff67d6c149f6a58', {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.message, 'Review not found', 'Response is not correct')
    })
    it('should return the 204 when the review is deleted', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fde/reviews/6428a9b7cff67d6c149f6a57', {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      assert.strictEqual(res.status, 204, 'Status code is not correct')
    })
  })
})
