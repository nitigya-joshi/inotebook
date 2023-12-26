const mongoose = require("mongoose");

const mongoUrl = "mongodb://127.0.0.1:27017/inotebook";

const connectToMongo = () => {
    mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }, () => {
        console.log("Connect to MongoDB was called.");
    });
};

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

module.exports = connectToMongo;
