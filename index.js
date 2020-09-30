const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")
const app = express();
const port = 4200
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require("dotenv").config();

console.log(process.env.DB_PASS,process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8acpe.mongodb.net/burjAlArab?retryWrites=true&w=majority`;




var serviceAccount = require("./burj-al-arab-b2653-firebase-adminsdk-s2gsk-e99a7565e6.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burj-al-arab-b2653.firebaseio.com"
});



app.use(cors());
app.use(bodyParser.json());

//database



app.get("/",(req,res)=>{
    res.send("hello")
})




const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });
client.connect(err => {
  const BookingCollection = client.db("burjAlArab").collection("bookings");

  app.post("/addBooking",(req,res) =>{
      const newBooking = req.body;
      BookingCollection.insertOne(newBooking)
      .then(result =>{
          res.send(result.insertedCount > 0)
      })
      
  })

  app.get("/bookings",(req,res)=>{
      
    const bearer = req.headers.authorization;

    if(bearer && bearer.startsWith("Bearer ")){
        const idToken = bearer.split(' ')[1];

        admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
        let tokenEmail = decodedToken.email;
        if(tokenEmail == req.query.email){
            BookingCollection.find({email : req.query.email})
            .toArray((err,documents) => {
            res.send(documents);
        })
        }
        else{
            res.status(401).send("un authorized lo")
        }

        }).catch(function(error) {
            res.status(401).send("un authorized lo")
        });

    }
    else{
        res.status(401).send("un authorized lo")
    }
  })

});






app.listen(port)