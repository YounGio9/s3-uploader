const mongoose = require('mongoose');
require('dotenv').config()


async function initMongoose() {
   try {
      await mongoose.connect(process.env.MONGO_URI)
   } catch (error) {
      return console.log(error)
   }
}


const uploadSchema =  mongoose.Schema({
   link: String
})

const Upload = mongoose.model('Upload', uploadSchema)

module.exports = {initMongoose, Upload}
