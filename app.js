const express = require('express')
const app = express()
const ejs = require('ejs')
const axios = require('axios')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/total', async (req, res) => {
  const url = 'https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json'
  const { data } = await axios.get(url)
  res.render('total', { data })
})

app.get('/rent',async(req,res) => {
  const number=req.query.number
  const { data } =await axios.get('https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json')
  const number1 = data.filter( data => data['sbi'] >= Number(req.query.number) )
  res.render('rent', { number1 })
})

app.get('/return',async(req,res)=>{
  const { data } =await axios.get('https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json')
  const number = data.filter( data => data['sna'] === "YouBike2.0_南門國中" )
  res.render('return', { number })
})


app.listen(3000, () => {
  console.log('Server running on port 3000')
})
