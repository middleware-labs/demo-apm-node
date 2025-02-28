// require("./instrument");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "./status.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const statusProto = grpc.loadPackageDefinition(packageDefinition).status;

const server = new grpc.Server();

server.addService(statusProto.StatusService.service, {
  SuccessStatus: (call, callback) => {
    callback(null, { code: 0, message: "Success: Status OK" });
  },
  ErrorStatus: (call, callback) => {
    callback({
      code: grpc.status.UNKNOWN,
      message: "Error: Status UNKNOWN",
    });
  },
});

server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
  console.log("gRPC Server running on port 50051");
  server.start();
});
