// require("./instrument"); // Ensure OpenTelemetry/Sentry is initialized


const { trace } = require("@opentelemetry/api");


const express = require("express");
// const Sentry = require("@sentry/node");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "./status.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const statusProto = grpc.loadPackageDefinition(packageDefinition).status;

const SERVER_HOST = process.env.GRPC_SERVER_HOST || "localhost:50051"; // Get from env
const app = express();
// Sentry.setupExpressErrorHandler(app);
const client = new statusProto.StatusService(
  SERVER_HOST,
  grpc.credentials.createInsecure()
);

// Middleware to add events to the active span
function addErrorEventMiddleware(err, req, res, next) {
  if (res.statusCode === 500) {
    console.log("Error recording via Middleware");
    const currentSpan = trace.getActiveSpan();
    if (currentSpan) {
      currentSpan.recordException(err);
    }
  }
  next(err); // Pass the error to the next middleware (e.g., error handler)
}

// Apply the middleware globally
app.use(addErrorEventMiddleware);

// HTTP API to call `SuccessStatus` gRPC method
app.get("/success", (req, res) => {
  client.SuccessStatus({}, (error, response) => {
    if (error) {
      console.error("gRPC Error:", error);
      return res.status(500).json({ error: "gRPC request failed" });
    }
    res.json(response);
  });
});

// HTTP API to call `ErrorStatus` gRPC method
app.get("/error", (req, res) => {
  const currentSpan = trace.getActiveSpan();
  client.ErrorStatus({}, (error, response) => {
    if (error) {      
      return res.status(500).json({ error: "gRPC request failed" });
    }
    res.json(response);
  });
});

// Start HTTP server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`HTTP API running on http://localhost:${PORT}`);
});
