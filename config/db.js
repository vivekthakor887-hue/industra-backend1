const mongoose=require('mongoose')
require('dotenv').config()
mongoose.connect(process.env.MONGO_URL)

const db=mongoose.connection

db.once('open',()=>{
    console.log('MongoDB connected');
})