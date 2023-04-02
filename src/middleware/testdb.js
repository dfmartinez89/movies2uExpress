const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const Movies = require('../../src/models/movies.js')

mongoose.set('strictQuery', false)

let mongod

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

  await mongoose.connect(uri, mongooseOpts)
  console.log('MongoMemoryServer connected at ', uri)
}

/**
 * Seed initial data
 */
module.exports.initialData = async () => {
  const mockMovie1 = {
    _id: '641e0f79f95fbd4a30067fda',
    title: 'The Matrix',
    year: 1999,
    genre: 'Sci-Fi',
    poster: 'images/matrix.jpg',
    rating: 5,
    location: 'Tabernas, Spain'
  }
  const mockMovie2 = {
    _id: '641e0f79f95fbd4a30067fdc',
    title: 'The Matrix Reloaded',
    year: 2003,
    genre: 'Sci-Fi',
    poster: 'images/matrix.jpg',
    rating: 5,
    location: 'Carboneras, Spain'
  }
  const mockMovie3 = {
    _id: '641e0f79f95fbd4a30067fde',
    title: 'The Matrix Revolutions',
    year: 2003,
    genre: 'Sci-Fi',
    poster: 'images/matrix.jpg',
    rating: 5,
    location: 'Roquetas, Spain',
    reviews: [
      {
        reviewGeoLocation: {
          type: 'Point',
          coordinates: [
            -1.87244,
            37.24776
          ],
          formattedLocation: ', Vera, AN, ES'
        },
        author: 'Frodo',
        rating: 5,
        description: 'Great movie',
        _id: '6428a9b7cff67d6c149f6a57',
        createdAt: '2023-04-01T22:01:27.932Z'
      }
    ]
  }
  const mockMovie4 = {
    _id: '641e0f79f95fbd4a30067fdf',
    title: 'The Matrix Resurrections',
    year: 2021,
    genre: 'Sci-Fi',
    poster: 'images/matrix.jpg',
    rating: 5,
    location: 'Albox, Spain'
  }
  await Movies.create(mockMovie1, mockMovie2, mockMovie3, mockMovie4)
  console.log('Initial data seeded')
}

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  if (mongod) {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongod.stop()
    console.log('Database closed')
  }
}

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  if (mongod) {
    const collections = mongoose.connection.collections

    for (const key in collections) {
      const collection = collections[key]
      await collection.deleteMany()
      console.log('Database deleted')
    }
  }
}
