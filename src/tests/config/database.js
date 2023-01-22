const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient } = require("mongodb");

const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  connection = await MongoClient.connect(mongoServer.getUri(), {});
  const url = mongoServer.getUri();
  console.log(`MongoDB connected to in-memory database at ${url}`);
};

const close = async () => {
//   await mongoose.connection.dropDatabase();
await clear();
  await mongoose.connection.close();
  await mongoServer.stop();
};

const clear = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
module.exports = { connect, close, clear };
