// server.js
const tracker = require("@middleware.io/node-apm");

logEnvVariables();

if (process.env.MW_TARGET) {
  console.log("STARTING SERVERLESS MODE");
  tracker.track({
    serviceName: process.env.MW_SERVICE_NAME || "grpc-word-game-server",
    agentService: process.env.MW_AGENT_SERVICE,
    accessToken: process.env.MW_API_KEY,
    target: process.env.MW_TARGET,
    DEBUG: process.env.MW_DEBUG ? true : false,
    customResourceAttributes: {
      mycustomattribute: "anyvalue",
    },
    disabledInstrumentations: "net,dns",
  });
} else {
  console.log("STARTING AGENT MODE");
  tracker.track({
    serviceName: process.env.MW_SERVICE_NAME || "grpc-word-game-server",
    accessToken: process.env.MW_API_KEY,
    DEBUG: process.env.MW_DEBUG ? true : false,
    customResourceAttributes: {
      mycustomattribute: "anyvalue",
    },
    disabledInstrumentations: "net,dns",
  });
}

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "./word_game.proto";

/* 
  GET TRACER TO CREATE CUSTOM SPANS
*/
const tracer = tracker.getTracer("testTRacer", "2.0.0");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const wordgameProto = grpc.loadPackageDefinition(packageDefinition).wordgame;

const words = {
  easy: ["cat", "dog", "bird", "fish", "tree", "book", "chair", "table"],
  medium: [
    "elephant",
    "giraffe",
    "penguin",
    "octopus",
    "computer",
    "bicycle",
    "guitar",
    "mountain",
  ],
  hard: [
    "aardvark",
    "platypus",
    "rhinoceros",
    "hippopotamus",
    "phenomenon",
    "calisthenics",
    "serendipity",
    "quintessential",
  ],
};

function getRandomWord(difficulty) {
  return words[difficulty][
    Math.floor(Math.random() * words[difficulty].length)
  ];
}

function shuffleWord(word) {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function removeVowels(word) {
  return word.replace(/[aeiou]/gi, "_");
}

function reverseWord(word) {
  return word.split("").reverse().join("");
}

function getChallenge(call, callback) {
  tracer.startActiveSpan("HeavyProcessing", (span) => {
    /*
       Add Custom Events and Attributes
    */
    span.setAttribute("foo", "bar");
    span.addEvent("Custom Get CHallenge Event");

    const difficulty = call.request.difficulty;
    const originalWord = getRandomWord(difficulty); // Correct original word is selected
    const challengeTypes = ["anagram", "missing_vowels", "reverse"];
    const challengeType =
      challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

    let challengeWord;
    switch (challengeType) {
      case "anagram":
        challengeWord = shuffleWord(originalWord);
        break;
      case "missing_vowels":
        challengeWord = removeVowels(originalWord);
        break;
      case "reverse":
        challengeWord = reverseWord(originalWord);
        break;
    }

    // Ensure original_word is passed back
    callback(null, {
      challenge_type: challengeType,
      word: challengeWord,
      original_word: originalWord, // Make sure this is sent to the client
    });

    span.end();
  });
}

function submitSolution(call, callback) {
  const { challenge_type, original_word, solution } = call.request;

  let isCorrect = false;

  switch (challenge_type) {
    case "anagram":
      isCorrect = isAnagram(original_word, solution); // Check if solution is an anagram of the original word
      break;
    case "reverse":
      isCorrect = solution.toLowerCase() === original_word.toLowerCase();
      break;
    case "missing_vowels":
      isCorrect =
        solution.toLowerCase() === original_word.toLowerCase() &&
        removeVowels(solution) === removeVowels(original_word);
      break;
  }

  callback(null, { is_correct: isCorrect, correct_answer: original_word });
}

function isAnagram(str1, str2) {
  // Helper function to check if two strings are anagrams
  const normalize = (str) => str.toLowerCase().split("").sort().join("");
  return normalize(str1) === normalize(str2);
}

function main() {
  const server = new grpc.Server();
  server.addService(wordgameProto.WordGameService.service, {
    getChallenge: getChallenge,
    submitSolution: submitSolution,
  });
  const port = process.env.PORT || 7001;
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(`Server running at http://0.0.0.0:${port}`);
      server.start();
    }
  );
}

function logEnvVariables() {
  console.log({
    serviceName: process.env.MW_SERVICE_NAME || "grpc-word-game-server",
    agentService: process.env.MW_AGENT_SERVICE,
    accessToken: process.env.MW_API_KEY,
    target: process.env.MW_TARGET,
    DEBUG: process.env.MW_DEBUG || false,
  });
}

main();

/*GRACEFUL HANDLER*/
process.on("SIGTERM", async () => {
  await tracker.sdkShutdown("SIGTERM");
  process.exit(0);
});
process.once("SIGINT", async () => {
  await tracker.sdkShutdown("SIGINT");
  process.exit(0);
});
