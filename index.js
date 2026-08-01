const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT;
const cors = require("cors");

app.use(express.json());
app.use(cors());




app.get("/", (req, res) => {
    res.send("Hello World!");
})




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri =process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function server() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    // Work is start from hare 
    const db = client.db("studynook");
    const addRoomCollection = db.collection("addroom");

    app.post("/addroom", async (req, res) => {
        const addRoom = req.body;
        const result = await addRoomCollection.insertOne(addRoom);
        res.send(result);
    })
    


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
server().catch(console.dir);





app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
