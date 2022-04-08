const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  id: {
    type: String
  },
  name: {
    type: String
  },
  total: {
    type: Number
  }
})

module.exports = mongoose.model('Station', schema)