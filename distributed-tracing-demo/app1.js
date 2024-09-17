const tracker = require("@middleware.io/node-apm");
tracker.track({
  serviceName: "missing-node-app-3000",
  projectName: "distributed-tracing-demo",
  accessToken: "<MW_API_KEY>", // Add your access token here
  target: "https://4plo493_fzx.middleware.io:443",
});

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 3000;

app.use(cors());

app.get("/health", async (req, res) => {
  // console.log("request recieved");
  // res.status(200);
  // res.json(response.data);
  //return;
  try {
    const response = await axios.get("http://localhost:3001/endpoint");
    //await wait(120000)
    res.status(200);
    res.json(response.data);
  } catch (error) {
    tracker.error(error);
    res.status(500).json({ error: "Error calling the next service" });
  }
});

app.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3001/endpoint");
    res.json(response.data);
  } catch (error) {
    tracker.error(error);
    res.status(500).json({ error: "Error calling the next service" });
  }
});

app.listen(port, () => {
  console.log(`Node.js app listening at http://localhost:${port}`);
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
