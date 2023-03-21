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
  const mockMovie = {
    title: 'The Matrix',
    year: 1999,
    genre: 'Sci-Fi',
    poster: 'images/matrix.jpg',
    rating: 5,
    location: 'Tabernas, Spain'
  }
  await Movies.create(mockMovie)
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
