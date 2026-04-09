const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI)

const db = mongoose.connection

db.once('open', () => {
    console.log('MongoDB connected');
})
