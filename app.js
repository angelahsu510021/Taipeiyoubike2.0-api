const express = require('express')
const app = express()
const ejs = require('ejs')
const axios = require('axios')
const mongoose = require('mongoose')
const Station = require('./station')

mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connect to MongoDB')
}).catch(error => {
  console.log(error)
})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/load', async (req, res, next) => {
  await Station.deleteMany({})
  next()
})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/load', async (req, res) => {
  const url = 'https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json'
  const { data } = await axios.get(url)
  const selected = ["YouBike2.0_南門國中","YouBike2.0_南機場夜市(中華路二段)","YouBike2.0_南海和平路口西南側","YouBike2.0_莒光和平路口","YouBike2.0_水源路11-1號旁","YouBike2.0_介壽公園","YouBike2.0_捷運小南門站(2號出口)","YouBike2.0_中華貴陽街口"]
  const filter = data.filter(item => selected.includes(item['sna']))
  for (let i = 0; i < filter.length; i++) {
    const obj = {
      id: filter[i].sno,
      name: filter[i].sna,
      total: filter[i].tot,
      current_number: filter[i].sbi,
      returned: filter[i].bemp,
    }
    await new Station(obj).save().catch(error => console.log(error))
  }
  res.send('資料儲存成功')
})

app.get('/total', async (req, res) => {
  const stations = await Station.find({})
  res.render('total', { data: stations })
})

app.post('/rent', async(req, res) => {
  const { id, number } = req.body
  const findobj = await Station.findOne({ id })
  if (findobj) {
    if (Number(findobj.current_number) - number >= 0) {
      await Station.updateOne(findobj, { current_number: (findobj.current_number - number), returned: (findobj.returned + number) })
      res.send('租借成功')
    }
    else if (Number(findobj.current_number) - number <= 0) {
      res.send('數量不足，無法借車')
    }
  }
  else {
    res.send('no such station')
  }
})

app.get('/rent',async(req,res) => {
  const { number } = req.query
  const { data } =await axios.get('https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json')
  const number1 = data.filter( data => data['sbi'] >= Number(req.query.number) )
  res.render('rent', { number1 })
})

app.get('/return',async(req,res)=>{
  const { data } = await axios.get('https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json')
  const number = data.filter(data => data['sna'] === 'YouBike2.0_南門國中')
  res.render('return', { number })
})


app.listen(3000, () => {
  console.log('Server running on port 3000')
})