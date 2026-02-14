const http = require("http");
const WebSocket = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");

function setupYjsServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (conn, req) => {
    setupWSConnection(conn, req);
  });

  console.log("✅ Yjs WebSocket server running");
}

module.exports = setupYjsServer;
