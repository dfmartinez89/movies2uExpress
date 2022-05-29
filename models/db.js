const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://movies2u:movies2u@cluster0.ki5t0.mongodb.net/movies';
mongoose.connect(dbURI, { useUnifiedTopology: true,  useNewUrlParser: true });

// ATLAS
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://movies2u:movies2u@cluster0.ki5t0.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("movies").collection("movies");
//   // perform actions on the collection object
//   client.close();
// });



// CONNECTION EVENTS
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
const gracefulShutdown = (msg, callback) => {
    mongoose.connection.close( () => {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};
// For nodemon restarts
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});

// For app termination
process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});

// BRING IN YOUR SCHEMAS & MODELS
require('./movies');