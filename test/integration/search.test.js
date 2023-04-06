const { describe, it, before, afterEach, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const testdb = require('../../src/middleware/testdb')
const nock = require('nock')
let token

describe('search integration tests', async () => {
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

  describe('Search IMDb movies tests', async () => {
    it('should return 401 when user is not logged in', async () => {
      const res = await fetch(`http://localhost:3000/imdb?${new URLSearchParams({ criteria: 'No country for old men' })}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 401, 'Status code is not correct')
      assert.strictEqual(result.message, 'Not authorized, token is required', 'Response is not correct')
    })
    it('should return 200 and data when user is authenticated', async () => {
      // create user
      const register = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'imdbtest',
          email: 'imdbtest@test.com'
        })
      })
      // get token from login response to send as authorization header
      const loginResult = await register.json()
      token = loginResult.token
      const res = await fetch(`http://localhost:3000/imdb?${new URLSearchParams({ criteria: 'No country for old men' })}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      const imdbMock = {
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
        ],
        errorMessage: ''
      }
      nock('https://imdb-api.com/en/API/SearchMovie/')
        .get('/$/', 'username=pgte&password=123456')
        .reply(200, imdbMock)
      const result = await res.json()
      assert.strictEqual(res.status, 200, 'Status code is not correct')
      assert.strictEqual(result.searchType, 'Movie', 'Response is not correct')
      assert.strictEqual(result.expression, 'No country for old men', 'Response is not correct')
      assert.strictEqual(result.results[0].description, '2007 Tommy Lee Jones, Javier Bardem', 'Response is not correct')
    })
    it('should return 400 when criteria query param is not provided', async () => {
      const res = await fetch(`http://localhost:3000/imdb?${new URLSearchParams({ search: 'No country for old men' })}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 400, 'Status code is not correct')
      assert.strictEqual(result.message, 'missing search criteria')
    })
  })

  describe('Search Utils tests', async () => {
    it('should return 400 when criteria query param is not provided', async () => {
      const res = await fetch(`http://localhost:3000/search?${new URLSearchParams({ search: 'No country for old men' })}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 400, 'Status code is not correct')
      assert.strictEqual(result.message, 'missing search criteria, use title, year or genre')
    })
    it('should return 404 when no movie is found for the provided title', async () => {
      const res = await fetch(`http://localhost:3000/search?${new URLSearchParams({ title: 'No country for old men' })}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.success, true, 'Response is not correct')
      assert.strictEqual(result.count, 0, 'Response is not correct')
      assert.strictEqual(result.data, 'there are no movies with title No country for old men', 'Response is not correct')
    })
    it('should return 200 when movie is found for the provided title', async () => {
      const res = await fetch(`http://localhost:3000/search?${new URLSearchParams({ title: 'The Matrix' })}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 200, 'Status code is not correct')
      assert.strictEqual(result.success, true, 'Response is not correct')
      assert.strictEqual(result.count, 3, 'Response is not correct')
    })
    it('should return 404 when no movie is found for the provided year', async () => {
      const res = await fetch(`http://localhost:3000/search?${new URLSearchParams({ year: 2022 })}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.success, true, 'Response is not correct')
      assert.strictEqual(result.count, 0, 'Response is not correct')
      assert.strictEqual(result.data, 'there are no movies on the year 2022', 'Response is not correct')
    })
    it('should return 200 when movie is found for the provided year', async () => {
      const res = await fetch(`http://localhost:3000/search?${new URLSearchParams({ year: 1999 })}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 200, 'Status code is not correct')
      assert.strictEqual(result.success, true, 'Response is not correct')
      assert.strictEqual(result.count, 1, 'Response is not correct')
      assert.strictEqual(result.data[0].title, 'The Matrix', 'Response is not correct')
      assert.strictEqual(result.data[0].location, 'Tabernas, Spain', 'Response is not correct')
    })
    it('should return 404 when no movie is found for the provided genre', async () => {
      const res = await fetch(`http://localhost:3000/search?${new URLSearchParams({ genre: 'Action,Sci-Fi' })}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 404, 'Status code is not correct')
      assert.strictEqual(result.success, true, 'Response is not correct')
      assert.strictEqual(result.count, 0, 'Response is not correct')
      assert.strictEqual(result.data, 'there are no movies with genre Action,Sci-Fi', 'Response is not correct')
    })
    it('should return 200 when movie is found for the provided genre', async () => {
      const res = await fetch(`http://localhost:3000/search?${new URLSearchParams({ genre: 'Sci-Fi' })}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const result = await res.json()
      assert.strictEqual(res.status, 200, 'Status code is not correct')
      assert.strictEqual(result.success, true, 'Response is not correct')
      assert.strictEqual(result.count, 3, 'Response is not correct')
    })
  })
})
