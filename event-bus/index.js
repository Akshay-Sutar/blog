const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.post("/events", async (req, res) => {
  const event = req.body;
  console.log("event received", event);

  try {
    await axios.post("http://localhost:4000/events", event);
    await axios.post("http://localhost:4001/events", event);
    await axios.post("http://localhost:4002/events", event);
    await axios.post("http://localhost:4003/events", event);
    console.log("data");
  } catch (err) {
    console.log(err);
  }

  return res.send({ status: "OK" }).end();
});

app.listen(4005, () => {
  console.log("Event bus started on 4005");
});
