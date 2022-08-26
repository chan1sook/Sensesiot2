import { log, error } from "../utils/logging.js";

/**
 * @param {import("aedes").Client} client
 */
function getTagsFromClient(client) {
  const tags = [];
  if (client.userData) {
    const { uid, role } = client.userData;
    if (role === "api") {
      tags.push("API");
    } else {
      tags.push(`${uid}`);
    }
  } else {
    tags.push(`${client.id}`);
  }

  return tags;
}
/**
 * @param {import("aedes").Aedes} aedesServer
 */
function bindClientEvent(aedesServer, clients) {
  aedesServer.on("client", (client) => {
    const count = aedesServer.connectedClients;
    clients.push(client);

    log(["Connected (Total: ", `${count}`.green, ")"], {
      name: "MQTT Broker",
      tags: getTagsFromClient(client),
    });
  });

  return aedesServer;
}

/**
 * @param {import("aedes").Aedes} aedesServer
 */
function bindClientDisconnectEvent(aedesServer, clients) {
  aedesServer.on("clientDisconnect", (client) => {
    const count = aedesServer.connectedClients;
    const index = clients.indexOf(client);
    if (index !== -1) {
      clients.splice(index, 1);
    }

    log(["Disconnected (Total: ", `${count}`.green, ")"], {
      name: "MQTT Broker",
      tags: getTagsFromClient(client),
    });
  });

  return aedesServer;
}

/**
 * @param {import("aedes").Aedes} aedesServer
 */
function bindClientErrorEvent(aedesServer) {
  aedesServer.on("clientError", (client, err) => {
    error(err.message, {
      name: "MQTT Broker",
      tags: getTagsFromClient(client),
    });
  });

  return aedesServer;
}

/**
 * @param {import("aedes").Aedes} aedesServer
 */
export default function bindAedesEvents(aedesServer, { clients }) {
  bindClientEvent(aedesServer, clients);
  bindClientDisconnectEvent(aedesServer, clients);
  bindClientErrorEvent(aedesServer);

  return aedesServer;
}
