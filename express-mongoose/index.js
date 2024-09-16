const tracker = require("@middleware.io/node-apm");

process.env.MW_SERVICE_NAME = "node-mongoose-app";
process.env.MW_API_KEY = "xzdyagardggtppccwqfgqsqeocjflbddytwg";
process.env.MW_TARGET = "https://msehd.middleware.io";
//process.env.MW_DEBUG = "true";

logEnvVariables();

console.log("STARTING SERVERLESS MODE");

tracker.track({
  serviceName: process.env.MW_SERVICE_NAME || "simple-express-app",
  agentService: process.env.MW_AGENT_SERVICE,
  accessToken: process.env.MW_API_KEY,
  target: process.env.MW_TARGET,
  DEBUG: process.env.MW_DEBUG ? true : false,
  disabledInstrumentations: "net,dns",
});

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const PORT = process.env.PORT || "5555";
const mongoose = require("mongoose");
require("dotenv").config();

var blogsRouter = require("./routes/blogs");

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", blogsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).json({
    error: "Unable to find the requested resource!",
  });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

if (process.env.NODE_ENV != "test") {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
    })
    .then(async () => {
      console.log("Connected to MongoDB");
      app.listen(parseInt(PORT, 10), () => {
        console.log(`Listening on ${PORT}`);
      });
    });
} else {
  process.env.MONGODB_URI = 
  console.log("herer")
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
    })
    .then(async () => {
      console.log("Connected to MongoDB");
      app.listen(parseInt(PORT, 10), () => {
        console.log(`Listening on ${PORT}`);
      });
    });
  app.listen(parseInt(PORT, 10), () => {
    console.log(`Listening on ${PORT}`);
  });
}

function logEnvVariables() {
  console.log({
    serviceName: process.env.MW_SERVICE_NAME,
    agentService: process.env.MW_AGENT_SERVICE,
    accessToken: process.env.MW_API_KEY,
    target: process.env.MW_TARGET,
    DEBUG: process.env.MW_DEBUG,
  });
}

module.exports = app;
