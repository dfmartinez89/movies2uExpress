const { describe, it, before, afterEach, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const testdb = require('../../src/middleware/testdb')
let token
let id

describe('movies integration tests', () => {
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
  describe('movies moviesFindAll tests', () => {
    it('should return the list of movies', async () => {
      const res = await fetch('http://localhost:3000/movies', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 200, 'Status code is not correct')
      assert.strictEqual(result.count, 4, 'Response is not correct')
    })
  })

  describe('movies moviesCreate tests', () => {
    it('should return 400 when user is not logged in', async () => {
      const res = await fetch('http://localhost:3000/movies', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Transformers',
          year: 2007,
          genre: 'Sci-Fi',
          poster: 'transfomers.jpg',
          rating: 5,
          location: 'Aguadulce, Almería, Spain'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 401, 'Status code is not correct')
      assert.strictEqual(result.message, 'Not authorized, token is required', 'Response is not correct')
    })
    it('should return 400 when user location is not provided', async () => {
    // create user
      const register = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'movies',
          email: 'movies@test.com'
        })
      })
      // get token from login response to send as authorization header
      const loginResult = await register.json()
      token = loginResult.token
      const res = await fetch('http://localhost:3000/movies', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          title: 'Transformers',
          year: 2007,
          genre: 'Sci-Fi',
          poster: 'transfomers.jpg',
          rating: 5
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 400, 'Status code is not correct')
      assert.strictEqual(result.message, 'Location is required')
    })
    it('should return 201 when the movie is succesfully created', async () => {
      const res = await fetch('http://localhost:3000/movies', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          title: 'Transformers',
          year: 2007,
          genre: 'Action',
          poster: 'transfomers.jpg',
          rating: 5,
          location: 'Aguadulce, Almería, Spain'
        })
      })
      const result = await res.json()
      id = result.data._id
      assert.strictEqual(res.status, 201, 'Status code is not correct')
      assert.strictEqual(result.success, true, 'Response is not correct')
      assert.strictEqual(result.data.title, 'Transformers')
    })
  })

  describe('movies moviesReadOne tests', () => {
    it('should return the 400 when the provided movieid has a wrong format', async () => {
      const res = await fetch('http://localhost:3000/movies/1', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 400, 'Status code is not correct')
      assert.strictEqual(result.message, 'Cast to ObjectId failed for value "1" (type string) at path "_id" for model "Movie"', 'Response is not correct')
    })
    it('should return the 404 when no movies is found for the provided movieid', async () => {
      const res = await fetch('http://localhost:3000/movies/641e0f79f95fbd4a30067fda', {
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
    it('should return the movie found for the provided movieid', async () => {
      const res = await fetch(`http://localhost:3000/movies/${id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 200, 'Status code is not correct')
      assert.strictEqual(result.success, true, 'Response is not correct')
      assert.strictEqual(result.data.title, 'Transformers', 'Response is not correct')
      assert.strictEqual(result.data.year, 2007, 'Response is not correct')
    })
  })

  describe('movies moviesUpdateOne tests', () => {
    it('should return 400 when user is not logged in', async () => {
      const res = await fetch(`http://localhost:3000/movies/${id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Transformers',
          year: 2007,
          genre: 'Sci-Fi',
          poster: 'transfomers.jpg',
          rating: 4,
          location: 'El Ejido, Almería, Spain'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 401, 'Status code is not correct')
      assert.strictEqual(result.message, 'Not authorized, token is required', 'Response is not correct')
    })
    it('should return 400 when location is not provided', async () => {
      const res = await fetch(`http://localhost:3000/movies/${id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          title: 'Transformers',
          year: 2007,
          genre: 'Sci-Fi',
          poster: 'transfomers.jpg',
          rating: 4
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 400, 'Status code is not correct')
      assert.strictEqual(result.message, 'Location is required', 'Response is not correct')
    })
    it('should return 404 when no movie is found for the given movied', async () => {
      const res = await fetch('http://localhost:3000/movies/6427536ddafbe3b100ac4713', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          title: 'Transformers',
          year: 2007,
          genre: 'Sci-Fi',
          poster: 'transfomers.jpg',
          rating: 4,
          location: 'El Ejido, Almería, Spain'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.message, 'Movie not found', 'Response is not correct')
    })
    it('should return 200 when the movie is updated', async () => {
      const res = await fetch(`http://localhost:3000/movies/${id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          title: 'Transformers',
          year: 2007,
          genre: 'Adventures',
          poster: 'transfomers.jpg',
          rating: 4,
          location: 'El Ejido, Almería, Spain'
        })
      })
      const result = await res.json()
      assert.strictEqual(res.status, 200, 'Status code is not correct')
      assert.strictEqual(result.data.title, 'Transformers', 'Response is not correct')
      assert.strictEqual(result.data.rating, 4, 'Response is not correct')
    })
  })
})
