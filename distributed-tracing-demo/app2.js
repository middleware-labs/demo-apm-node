const tracker = require("@middleware.io/node-apm");
tracker.track({
  serviceName: "missing-node-app-3001",
  projectName: "distributed-tracing-demo",
  accessToken: "<MW_API_KEY>", // Add your access token here
  target: "https://<MW_UID>.middleware.io:443",
});

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 3001;

app.use(cors());

app.get("/endpoint", async (req, res) => {
  console.log("request recieved 2");
  try {
    const response = await axios.get("http://localhost:3002/endpoint");
    //await wait(120000)
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
