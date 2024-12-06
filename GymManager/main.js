const { app, BrowserWindow } = require("electron");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const CLIENTS_FILE = path.join(__dirname, "clients.json");

let mainWindow;
const apiServer = express();
const PORT = 3001;
apiServer.use(bodyParser.json());
apiServer.use(cors({ origin: 'http://localhost:5173' }));


const readClientsFromFile = () => {
  if (!fs.existsSync(CLIENTS_FILE)) {
    return [];
  }
  const data = fs.readFileSync(CLIENTS_FILE, 'utf8');
  return JSON.parse(data);
};
const writeClientsToFile = (clients) => {
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
};

apiServer.get("/api/clients", (req, res) => {
  const clients = readClientsFromFile();
  res.json(clients);
});

apiServer.post("/api/clients", (req, res) => {
  const clients = readClientsFromFile();
  const nuevoCliente = {
    ...req.body,
    membershipStartDate: req.body.membershipStartDate || new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
  };

  const exists = clients.some((client) => client.dni === nuevoCliente.dni);
  if (exists) {
    return res.status(400).json({ error: "El cliente con este DNI ya existe" });
  }

  
  clients.push(nuevoCliente);
  writeClientsToFile(clients);

  res.status(201).json(nuevoCliente);
});

apiServer.delete("/api/clients/:dni", (req, res) => {
  const { dni } = req.params;
  let clients = readClientsFromFile();

  // Filtrar el cliente que se quiere eliminar
  const updatedClients = clients.filter(client => client.dni !== dni);

  if (clients.length === updatedClients.length) {
    // No se encontró el cliente
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  // Guardar la lista actualizada en el archivo JSON
  writeClientsToFile(updatedClients);

  res.status(200).json({ message: "Cliente eliminado con éxito" });
});

apiServer.listen(PORT, () => {
  console.log(`Servidor de API corriendo en http://localhost:${PORT}`);
});

apiServer.put("/api/clients/:dni", (req, res) => {
  const { dni } = req.params;
  const updatedData = req.body;
  let clients = readClientsFromFile();

  // Buscar el índice del cliente que se quiere actualizar
  const clientIndex = clients.findIndex((client) => client.dni === dni);

  if (clientIndex === -1) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  // Actualizar el cliente en la lista
  clients[clientIndex] = { ...clients[clientIndex], ...updatedData };
  writeClientsToFile(clients);

  res.status(200).json({ message: "Cliente actualizado con éxito", updatedClient: clients[clientIndex] });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      devTools: true,
    },
  });

  mainWindow.loadURL('http://localhost:5173');
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
