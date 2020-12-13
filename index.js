const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${(process.env.DB_USER)}:${(process.env.DB_PASS)}@cluster0.oor8w.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
const port = 5000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productsCollection = client.db(`${(process.env.DB_NAME)}`).collection("products");
  const orderCollection = client.db(`${(process.env.DB_NAME)}`).collection("orders");

  app.post('/addProduct', (req, res) => {
      const product = req.body;
      productsCollection.insertMany(product)
      .then(result => {
          res.send(result.insertedCount > 0)
      })
  })

  app.get('/products', (req, res) => {
      productsCollection.find({})
      .toArray((err, documents) => {
          res.send(documents)
      })
  })

  app.get('/product/:id', (req, res) => {
      productsCollection.find({key: req.params.id})
      .toArray((err, documents) => {
          res.send(documents[0])
      })
  })

  app.post('/productsByKeys', (req, res) => {
      const productsKeys = req.body;

      productsCollection.find({key: { $in: productsKeys}})
      .toArray((err, documents) => {
          res.send(documents)
      })
  })
  
  app.post('/order', (req, res) => {
      const order = req.body;
      orderCollection.insertOne(order)
      .then(result => {
          res.send(result.insertedCount > 0)
      })
  })

});


app.listen(port)