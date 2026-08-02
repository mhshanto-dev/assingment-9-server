const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(express.json());
app.use(cors());




app.get("/", (req, res) => {
    res.send("Hello World!");
})




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
const uri =process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const JWKS =createRemoteJWKSet(
  new URL("http://localhost:3000/api/auth/jwks")
)

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    req.user = payload;
    next();
  } catch (error) {
    console.error("Token verify error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Forbidden access",
    });
  }
}

async function server() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    // Work is start from hare 
    const db = client.db("studynook");
    const addRoomCollection = db.collection("addroom");
    const bookingCollection = db.collection("bookings");


    app.get("/rooms", async (req, res) => {
  try {
    const search = req.query.search || "";
    const amenities = req.query.amenities || "";

    const query = {};

    // Search by room name
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Amenities filter
    if (amenities) {
      query.amenities = {
        $in: amenities.split(","),
      };
    }

    const result = await addRoomCollection.find(query).toArray();

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

 //  single room show
    app.get("/rooms/:id", verifyToken, async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await addRoomCollection.findOne(query);

        if (!result) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        res.json(result);
    })

    app.post("/add-room", async (req, res) => {
        const addRoom = req.body;
        console.log(addRoom);
        const result = await addRoomCollection.insertOne(addRoom);
        res.send(result);
    })




    app.patch("/rooms/:id", async (req, res) => {
        const id = req.params.id;
        const updateRoom = req.body;
        console.log(updateRoom);
        const result = await addRoomCollection.updateOne(
          {
            _id: new ObjectId(id),
          },
          {
            $set: updateRoom,
          }
        );
        res.json(result);
    })


    app.delete('/rooms/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await addRoomCollection.deleteOne(query);
        res.json(result);
    })

    app.get("/bookings/:userId", async (req, res) => {
        const { userId } = req.params;
        const result = await bookingCollection.find({ userId:userId }).toArray();
        res.json(result);
  })
    
    app.post("/bookings", async (req, res) => {
        const booking = req.body;
        console.log(booking);
        const result = await bookingCollection.insertOne(booking);
        res.json(result);
    })

    app.delete('/bookings/:bookingId', async (req, res) => {
        const {bookingId} = req.params;
        const query = { _id: new ObjectId(bookingId) };
        const result = await bookingCollection.deleteOne(query);
        res.json(result);
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



