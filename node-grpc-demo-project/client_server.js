const tracker = require("@middleware.io/node-apm");
/*
 THIS IS USED IN K8S EXAMPLE
*/
console.log({
  serviceName: process.env.MW_SERVICE_NAME || "grpc-word-game-client",
  agentService: process.env.MW_AGENT_SERVICE,
  accessToken: process.env.MW_API_KEY,
  target: process.env.MW_TARGET,
  DEBUG: process.env.MW_DEBUG || false,
});
if (process.env.MW_TARGET) {
  console.log("starting serverless tracker");
  tracker.track({
    serviceName: process.env.MW_SERVICE_NAME || "grpc-word-game-client",
    agentService: process.env.MW_AGENT_SERVICE,
    accessToken: process.env.MW_API_KEY,
    target: process.env.MW_TARGET,
    DEBUG: process.env.MW_DEBUG ? true : false,
  });
} else {
  console.log("starting K8S AGENT tracker");
  tracker.track({
    serviceName: process.env.MW_SERVICE_NAME || "grpc-word-game-server",
    accessToken: process.env.MW_API_KEY,
    DEBUG: process.env.MW_DEBUG ? true : false,
  });
}

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const express = require("express");

const PROTO_PATH = "./word_game.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const wordgameProto = grpc.loadPackageDefinition(packageDefinition).wordgame;

// Use environment variable for service address, defaulting to localhost for local testing
const serviceAddress = process.env.GRPC_SERVICE_ADDRESS || "localhost:7001";

const client = new wordgameProto.WordGameService(
  serviceAddress,
  grpc.credentials.createInsecure()
);

const app = express();
const port = process.env.PORT || 7002;

app.use(express.json());

app.post("/play", (req, res) => {
  console.log("play request recieved");
  const { difficulty } = req.body;

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return res.status(400).json({
      error: "Invalid difficulty. Choose 'easy', 'medium', or 'hard'.",
    });
  }

  client.getChallenge({ difficulty }, (error, challenge) => {
    if (error) {
      console.error("Error receiving challenge:", error);
      return res.status(500).json({ error: "Failed to get challenge" });
    }

    res.json({
      challenge_type: challenge.challenge_type,
      word: challenge.word,
      ans: challenge.original_word,
      message: "Respond to this endpoint  /submit with your solution.",
    });
  });
});

app.post("/submit", (req, res) => {
  console.log("submit request recieved");
  const { challenge_type, original_word, solution } = req.body;

  if (!challenge_type || !original_word || !solution) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  client.submitSolution(
    { challenge_type, original_word, solution },
    (error, result) => {
      if (error) {
        console.error("Error submitting solution:", error);
        return res.status(500).json({ error: "Failed to submit solution" });
      }

      res.json({
        is_correct: result.is_correct,
        correct_answer: result.correct_answer,
        message: result.is_correct
          ? "Correct! Well done!"
          : "Sorry, that's incorrect.",
      });
    }
  );
});

app.listen(port, () => {
  console.log(`HTTP server listening at http://localhost:${port}`);
  console.log(`gRPC client connected to ${serviceAddress}`);
});
