const { app, BrowserWindow } = require("electron");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const CLIENTS_FILE = path.join(__dirname, "clients.json");

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

/// LEER TODOS LOS DATOS DE LOS CLIENTES ///
apiServer.get("/api/clients", (req, res) => {
  const clients = readClientsFromFile();
  res.json(clients);
});

/// AGREGAR CLIENTES ///
apiServer.post("/api/clients", (req, res) => {
  const clients = readClientsFromFile();
  const nuevoCliente = {
    ...req.body,
  };

  const exists = clients.some((client) => client.dni === nuevoCliente.dni);
  if (exists) {
    return res.status(400).json({ error: "El cliente con este DNI ya existe" });
  }

  
  clients.push(nuevoCliente);
  writeClientsToFile(clients);

  res.status(201).json(nuevoCliente);
});

/// BORRAR CLIENTES ///
apiServer.delete("/api/clients/:dni", (req, res) => {
  const { dni } = req.params;
  let clients = readClientsFromFile();

  const updatedClients = clients.filter(client => client.dni !== dni);

  if (clients.length === updatedClients.length) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  writeClientsToFile(updatedClients);

  res.status(200).json({ message: "Cliente eliminado con éxito" });
});

apiServer.listen(PORT, () => {
  console.log(`Servidor de API corriendo en http://localhost:${PORT}`);
});

/// EDITAR CLIENTES ///
apiServer.put("/api/clients/:dni", (req, res) => {
  const { dni } = req.params;
  const updatedData = req.body;
  let clients = readClientsFromFile();

  const clientIndex = clients.findIndex((client) => client.dni === dni);

  if (clientIndex === -1) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  clients[clientIndex] = { ...clients[clientIndex], ...updatedData };
  writeClientsToFile(clients);

  res.status(200).json({ message: "Cliente actualizado con éxito", updatedClient: clients[clientIndex] });
});

/// ASIGNAR PAGOS ///
apiServer.post("/api/clients/:dni/assign-payment", (req, res) => {
  const { dni } = req.params;
  const { priceAmount, membership, paymentDate, state } = req.body;

  if (!priceAmount || !membership || !paymentDate) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  if (isNaN(priceAmount) || priceAmount <= 0) {
    return res.status(400).json({ error: "El precio debe ser un número mayor a 0" });
  }

  const clients = readClientsFromFile();
  const clientIndex = clients.findIndex((client) => client.dni === dni);

  if (clientIndex === -1) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  const client = clients[clientIndex];

  if (!client.currentPayment) {
    client.currentPayment = {
      amount: priceAmount,
      date: paymentDate, 
    };
    client.previousPayment = {
      amount: null,
      date: null,
    };
    client.monthlyPayments = parseFloat(priceAmount);
    client.globalPayments = parseFloat(priceAmount);
  } else {
    client.previousPayment = {
      amount: client.currentPayment.amount,
      date: client.currentPayment.date,
    };
    client.currentPayment = {
      amount: priceAmount,
      date: paymentDate,
    };

    const currentMonth = new Date(paymentDate).getMonth();
    const lastPaymentMonth = new Date(client.currentPayment.date).getMonth();

    if (currentMonth === lastPaymentMonth) {
      client.monthlyPayments += parseFloat(priceAmount);
    } else {
      client.monthlyPayments = parseFloat(priceAmount);
    }

    client.globalPayments += parseFloat(priceAmount);
    client.state = state;
  }

  clients[clientIndex] = client;

  writeClientsToFile(clients);

  res.status(200).json({
    message: "Pago asignado correctamente",
    updatedClient: client,
  });
});

///ASIGNAR PAGO SHORTCUT///
apiServer.post("/api/clients/:dni/assign-payment-from-popup", (req, res) => {
  const { dni } = req.params;
  const { priceAmount, membership, paymentDate, state } = req.body;

  if (!priceAmount || !membership || !paymentDate) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  if (isNaN(priceAmount) || priceAmount <= 0) {
    return res.status(400).json({ error: "El precio debe ser un número mayor a 0" });
  }

  const clients = readClientsFromFile();
  const clientIndex = clients.findIndex((client) => client.dni === dni);

  if (clientIndex === -1) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  const client = clients[clientIndex];

  // Asigna el valor de 'membership' y 'state' correctamente
  client.membership = membership;  // "Normal" o "Libre"
  client.state = state;  // 12 o 24

  if (!client.currentPayment) {
    client.currentPayment = {
      amount: priceAmount,
      date: paymentDate,
    };
    client.previousPayment = {
      amount: null,
      date: null,
    };
    client.monthlyPayments = parseFloat(priceAmount);
    client.globalPayments = parseFloat(priceAmount);
  } else {
    client.previousPayment = {
      amount: client.currentPayment.amount,
      date: client.currentPayment.date,
    };
    client.currentPayment = {
      amount: priceAmount,
      date: paymentDate,
    };

    const currentMonth = new Date(paymentDate).getMonth();
    const lastPaymentMonth = new Date(client.currentPayment.date).getMonth();

    if (currentMonth === lastPaymentMonth) {
      client.monthlyPayments += parseFloat(priceAmount);
    } else {
      client.monthlyPayments = parseFloat(priceAmount);
    }

    client.globalPayments += parseFloat(priceAmount);
  }

  clients[clientIndex] = client;
  writeClientsToFile(clients);

  res.status(200).json({
    message: "Pago asignado correctamente",
    updatedClient: client,
  });
});

apiServer.get("/api/clients/payments-summary", (req, res) => {
  const clients = readClientsFromFile();

  const summary = clients.reduce(
    (acc, client) => {
      acc.totalMonthlyPayments += client.monthlyPayments || 0;
      acc.totalGlobalPayments += client.globalPayments || 0;
      return acc;
    },
    { totalMonthlyPayments: 0, totalGlobalPayments: 0 }
  );

  res.status(200).json(summary);
});

/// RESTAR DEL ESTADO DEL CLIENTE ///
apiServer.put("/api/clients/:dni/decrease-state", (req, res) => {
  const { dni } = req.params;
  const { decreaseAmount } = req.body;

  if (isNaN(decreaseAmount) || decreaseAmount <= 0) {
    return res.status(400).json({ error: "La cantidad a restar debe ser un número mayor a 0" });
  }

  const clients = readClientsFromFile();
  const clientIndex = clients.findIndex((client) => client.dni === dni);

  if (clientIndex === -1) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  let client = clients[clientIndex];

  if (client.state >= decreaseAmount) {
    client.state -= decreaseAmount;
  } else {
    return res.status(400).json({ error: "El estado no puede ser menor a 0" });
  }

  clients[clientIndex] = client;
  writeClientsToFile(clients);

  res.status(200).json({ message: "Estado actualizado correctamente", updatedClient: client });
});

/// ELIMINAR UN PAGO ///
apiServer.put("/api/clients/:dni/delete-payment", (req, res) => {
  const { dni } = req.params;
  const { paymentType } = req.body;
  let clients = readClientsFromFile();

  const client = clients.find((c) => c.dni === dni);

  if (!client) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  if (paymentType === "currentPayment") {
    const amountToSubtract = client.currentPayment.amount;

    client.globalPayments -= amountToSubtract;
    client.monthlyPayments -= amountToSubtract;

    client.currentPayment = client.previousPayment || null;
    client.previousPayment = null;
  } else if (paymentType === "previousPayment") {
    const amountToSubtract = client.previousPayment.amount;

    client.globalPayments -= amountToSubtract;
    client.monthlyPayments -= amountToSubtract;

    client.previousPayment = null;
  } else {
    return res.status(400).json({ error: "Tipo de pago no válido" });
  }

  writeClientsToFile(clients);

  res.status(200).json(client);
});

apiServer.get("/api/clients/count", (req, res) => {
  const clients = readClientsFromFile();
  const totalClients = clients.length;
  res.json({ totalClients });
});

apiServer.get("/api/clients/:dni", (req, res) => {
  const { dni } = req.params;
  const clients = readClientsFromFile();
  const client = clients.find((c) => c.dni === dni);

  if (!client) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  res.json(client);
});


let mainWindow;
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
