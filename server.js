const express = require('express')
const bodyParser = require('body-parser') //helps read data from the <form> element
const MongoClient = require('mongodb').MongoClient
const app = express()
require('dotenv').config() 


app.set('view engine', 'ejs') //Tells express that we're using EJS as the template engine

// Middlewares and other routes here...
app.use(express.static('public')) // ?
app.use(bodyParser.json()) //makes server accept json
app.use(express.urlencoded({ extended: true}))
//app.use(bodyParser.urlencoded({ extended: true })) //Not needed

MongoClient.connect(process.env.DB_STRING, { useUnifiedTopology: true })
  .then(client => {
      console.log('Connected to Database')
      const db = client.db('star-wars-quotes')
      const quotesCollection = db.collection('quotes')

      app.listen(3000, function () {
        console.log('listening on 3000')
        })  

      app.get('/', (req, res) => {
        db.collection('quotes').find().toArray().then(results => {
            res.render('index.ejs', { quotes: results})
            })
            .catch(error => console.error(error))
      })

      app.put('/quotes', (req, res) => {
        quotesCollection.findOneAndUpdate(
            { name: 'Yoda' },
            {
                $set: {
                    name: req.body.name,
                    quote: req.body.quote,
                    },
            },
            {
                upsert: true,
            }
        )
          .then(result => {
            res.json('Success')
           })
          .catch(error => console.error(error))
      })

      app.delete('/quotes', (req, res) => {
        quotesCollection.deleteOne({ name: req.body.name })
        .then(result => {
            if (result.deletedCount === 0) {
              return res.json('No quote to delete')
            }
            res.json(`Deleted Darth Vader's quote`)
          })
          .catch(error => console.error(error))
      })

      app.post('/quotes', (req, res) => {
        quotesCollection
            .insertOne(req.body)
            .then(result => {
              res.redirect('/')
            })
            .catch(error => console.error(error))
      })
    }
  )
