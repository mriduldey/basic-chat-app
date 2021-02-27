const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const http = require("http").Server(app);
const io = require("socket.io")(http);

const mongoose = require("mongoose");

app.use(express.static(__dirname));
app.use(bodyParser.json());

const dbUrl = `mongodb+srv://user:user@mdcluster.bllx9.mongodb.net/chatApp?retryWrites=true&w=majority`;

const Message = mongoose.model("Message", {
  name: String,
  data: String,
});

const messages = [];

app.get("/messages", (req, res) => {
  Message.find({}, (err, msgs) => {
    if (!err) {
      res.send(msgs);
    } else {
      console.log("Messages can not be loaded", err);
    }
  });
});

app.post("/messages", (req, res) => {
  const { body: msg } = req;

  const message = new Message(msg);

  message.save((err) => {
    if (!err) {
      messages.push(msg);
      io.emit("message", msg);
      res.sendStatus(200);
    } else {
      console.log("Message not saved", err);
      res.sendStatus(500);
    }
  });
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

mongoose.connect(
  dbUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log("MongoDB connection error", err);
    } else {
      console.log("MongoDB connected");
    }
  }
);

const server = http.listen(3000, () => {
  console.log(`Server is listening to ${server.address().port}`);
});
