const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
// middle wares 
app.use(cors())
app.use(express.json());

// Decode JWT
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        console.log(decoded)
        req.decoded = decoded
        next()
    })
}
// connection 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nkyrz6w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: ServerApiVersion.v1
    });



async function run() {
    try {
        const designCollection = client.db('nokshiDb').collection('service');
        const reviewCollection = client.db('nokshiDb').collection('reviews');
        const usersCollection = client.db('nokshiDb').collection('users');
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = designCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        // Save user email 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body

            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)

            console.log(result)
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });
        /*   app.get('/serviceshome', async (req, res) => {
              const query = {}
              const cursor = designCollection.find(query);
              const services2 = await cursor.toArray();
              res.send(services2);
          }); */


        /* const sort = { length: -1 };
        const limit = 3;
        const cursor = true.find(query).sort({ length: -1 }).limit(3);
        const services = await cursor.forEach(); */

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const services = await designCollection.findOne(query);
            res.send(services);
        });
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await designCollection.insertOne(service);
            res.send(result);
        });

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await designCollection.insertOne(service);
            res.send(result);
        });
        // review 
        app.get('/reviews', async (req, res) => {
            // console.log(req.query.service);
            let query = {};
            console.log(req.query.email);
            if (req.query.service) {
                query = {
                    service: req.query.service
                }
            }
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);

            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const services = await reviewCollection.findOne(query);
            res.send(services);
        });
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            console.log(query);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('Nokshi server is running');
})

app.listen(port, () => {
    console.log(`Nokshi logistic running on ${port}`);
})