const tracker = require("@middleware.io/node-apm");

logEnvVariables();

if (process.env.MW_TARGET) {
  console.log("STARTING SERVERLESS MODE");
  tracker.track({
    serviceName: process.env.MW_SERVICE_NAME || "grpc-word-game-client",
    agentService: process.env.MW_AGENT_SERVICE,
    accessToken: process.env.MW_API_KEY,
    target: process.env.MW_TARGET,
    DEBUG: process.env.MW_DEBUG ? true : false,
    disabledInstrumentations: "net,dns",
  });
} else {
  console.log("STARTING AGENT MODE");
  tracker.track({
    serviceName: process.env.MW_SERVICE_NAME || "grpc-word-game-client",
    accessToken: process.env.MW_API_KEY,
    DEBUG: process.env.MW_DEBUG ? true : false,
    disabledInstrumentations: "net,dns",
  });
}

/*
  APPENDED CUSTOM SAMPLE LOG MESSAGES
*/
tracker.info("GRPC Info sample");
tracker.warn("GRPC Warning sample");
tracker.debug("GRPC Debugging Sample");
tracker.error("GRPC Error Sample");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const readline = require("readline");

const PROTO_PATH = "./word_game.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const wordgameProto = grpc.loadPackageDefinition(packageDefinition).wordgame;

const client = new wordgameProto.WordGameService(
  "localhost:7001",
  grpc.credentials.createInsecure()
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function playGame() {
  process.on("SIGTERM", async () => {
    await tracker.sdkShutdown("SIGTERM");
    process.exit(0);
  });
  process.once("SIGINT", async () => {
    await tracker.sdkShutdown("SIGINT");
    process.exit(0);
  });
  rl.question("Choose difficulty (easy/medium/hard): ", (difficulty) => {
    const validDifficulties = ["easy", "medium", "hard"];

    if (!validDifficulties.includes(difficulty.toLowerCase())) {
      console.log("Invalid difficulty. Please choose easy, medium, or hard.");
      playGame();
      return;
    }

    client.getChallenge({ difficulty }, (error, challenge) => {
      if (error) {
        console.error("Error receiving challenge:", error);
        rl.close();
        return;
      }

      console.log(`Challenge type: ${challenge.challenge_type}`);
      console.log(`Word: ${challenge.word}`);
      rl.question("Your solution: ", (solution) => {
        client.submitSolution(
          {
            challenge_type: challenge.challenge_type,
            original_word: challenge.original_word, // Fix: use original_word for validation
            solution: solution,
          },
          (error, result) => {
            if (error) {
              console.error("Error submitting solution:", error);
              rl.close();
              return;
            }

            if (result.is_correct) {
              console.log("Correct! Well done!");
            } else {
              console.log(
                `Sorry, that's incorrect. The correct answer was: ${result.correct_answer}`
              );
            }

            rl.question("Play again? (yes/no): ", (answer) => {
              if (answer.toLowerCase() === "yes") {
                playGame();
              } else {
                rl.close();
                process.exit(0);
                return;
              }
            });
          }
        );
      });
    });
  });
}

playGame();

function logEnvVariables() {
  console.log({
    serviceName: process.env.MW_SERVICE_NAME || "grpc-word-game-client",
    agentService: process.env.MW_AGENT_SERVICE,
    accessToken: process.env.MW_API_KEY,
    target: process.env.MW_TARGET,
    DEBUG: process.env.MW_DEBUG || false,
  });
}
