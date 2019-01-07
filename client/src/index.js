const { spawnSync } = require("child_process");
const { client: WebSocketClient } = require("websocket");

const client = new WebSocketClient();

client.on("connectFailed", error => {
  console.log("Connect Error: " + error.toString());
});

client.on("connect", connection => {
  connection.on("message", message => {
    if (message.type !== "utf8") {
      return;
    }
    const [cmd, args] = JSON.parse(message.utf8Data);
    const output = spawnSync(cmd, args);
    connection.sendUTF(
      JSON.stringify({ signal: output.signal, stdout: output.stdout.toString(), stderr: output.stderr.toString() })
    );
  });
  // connection.on("message", message => {
  //   if (message.type === "utf8") {
  //     console.log("Received: '" + message.utf8Data + "'");
  //   }
  // });
});

client.connect(
  "ws://localhost:8080/",
  "echo-protocol"
);
