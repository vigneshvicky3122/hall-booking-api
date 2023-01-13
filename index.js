const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const Client = new MongoClient(process.env.DB_URL);
app.use(
  bodyParser.json({ limit: "50mb", extended: true, parameterLimit: 50000 }),
  cors({
    origin: "*",
    credentials: true,
  })
);

app.get("/movies", async (req, res) => {
  await Client.connect();
  const Db = Client.db(process.env.DB_NAME);
  try {
    const Shows = await Db.collection(process.env.DB_COLLECTION_TWO)
      .find()
      .toArray();
    if (Shows) {
      res.status(201).json({ Shows });
    } else {
      res.status(401).send("failed");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("internal error");
  } finally {
    await Client.close();
  }
});
app.get("/bookings", async (req, res) => {
  await Client.connect();

  try {
    const Db = Client.db(process.env.DB_NAME);
    const bookings = await Db.collection(process.env.DB_COLLECTION_THREE)
      .find()
      .toArray();
    if (bookings) {
      res.status(200).json({ bookings });
    } else {
      res.status(401).send("failed");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("internal error");
  } finally {
    await Client.close();
  }
});
app.post("/create_movies", async (req, res) => {
  await Client.connect();

  try {
    const Db = Client.db(process.env.DB_NAME);
    const insert = await Db.collection(process.env.DB_COLLECTION_TWO).insertOne(
      req.body
    );
    if (insert) {
      res.status(200).send("created successful");
    } else {
      res.status(401).send("failed");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("internal error");
  } finally {
    await Client.close();
  }
});
app.post("/booking/:id", async (req, res) => {
  await Client.connect();

  try {
    const Db = Client.db(process.env.DB_NAME);

    const booking = await Db.collection(
      process.env.DB_COLLECTION_THREE
    ).insertOne(req.body);

    const booked = await Db.collection(
      process.env.DB_COLLECTION_TWO
    ).findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      {
        $pull: {
          available_seats: { $in: req.body.no_of_tickets },
        },
      }
    );

    if (booked) {
      res.status(200).send("Booking successful");
    } else {
      res.status(401).send("failed");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("internal error");
  } finally {
    await Client.close();
  }
});
app.listen(PORT, () => {
  console.log("Server running into port " + PORT);
});
