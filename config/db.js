const mongoose = require('mongoose');

const options = { keepAlive: 300000, connectTimeoutMS: 30000, useNewUrlParser: true };

const mongodbUri = 'mongodb://collection:pwd@localhost:27017/db';

mongoose.Promise = global.Promise;
mongoose.connect(mongodbUri, options)
    .then(function() {console.log('Database connected')})
    .catch(function(err) {console.log(`Database connection error: ${err.message}`)});
