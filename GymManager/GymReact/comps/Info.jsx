import React, { useEffect, useState } from "react";

function Info({ toggleModal, onViewClient, onEditClient }) {
  const [clients, setClients] = useState([]); // Todos los clientes
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    fetch("http://localhost:3001/api/clients")
      .then((response) => response.json())
      .then((data) => setClients(data))
      .catch((err) => console.error("Error cargando clientes:", err));
  };

  const refreshClients = () => {
    fetchClients();
  };

  const deleteClient = (dni) => {
    fetch(`http://localhost:3001/api/clients/${dni}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          setClients((prevClients) =>
            prevClients.filter((client) => client.dni !== dni)
          );
        } else {
          console.error("Error al eliminar el cliente");
        }
      })
      .catch((err) =>
        console.error("Error en la solicitud de eliminación:", err)
      );
  };

  const getStateClass = (state) => {
    if (state <= 3) {
      return "red";
    } else if (state <= 7) {
      return "yellow";
    } else {
      return "green";
    }
  };

  const calculateExpirationDate = (currentPaymentDate) => {
    const paymentDate = new Date(currentPaymentDate);
    const expirationDate = new Date(paymentDate);
    expirationDate.setDate(paymentDate.getDate() + 30); // Sumar 30 días
    const today = new Date();

    return expirationDate <= today
      ? expirationDate.toISOString().split("T")[0]
      : null;
  };

  // Filtrar clientes con membresías vencidas
  const expiredMemberships = clients
    .filter((client) => {
      const expirationDate = calculateExpirationDate(
        client.currentPayment?.date
      );
      return expirationDate !== null;
    })
    .map((client) => ({
      name: client.name,
      dni: client.dni,
      expirationDate: calculateExpirationDate(client.currentPayment?.date),
    }));

  // Filtra los clientes según el término de búsqueda
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || // Coincidencia parcial con nombre
      client.dni.toString().includes(searchTerm) // Coincidencia parcial con DNI
  );

  return (
    <div className="info">
      <div className="client-table cards-bkg">
        <div className="client-title">
          <h2>Lista de Clientes</h2>
          <div>
            <i className="ri-refresh-line refresh" onClick={refreshClients}></i>
            <button onClick={() => toggleModal("agregarCliente")}>
              <p>Agregar Cliente</p>
              <i className="ri-add-circle-line"></i>
            </button>
          </div>
        </div>
        <div className="search-bar">
          <input
            type="text"
            name="client-search"
            placeholder="Buscar cliente..."
            value={searchTerm} // Enlaza el estado con el input
            onChange={(e) => setSearchTerm(e.target.value)} // Actualiza el término de búsqueda
          />
          <i className="ri-search-line"></i>
        </div>
        <div className="table clients">
          <div className="table-head">
            <p>Nombre</p>
            <p>DNI</p>
            <p>Membresía</p>
            <p>Estado</p>
            <p></p>
          </div>
          <div className="table-body">
            {filteredClients.map((client, index) => (
              <div className="table-body-cont" key={index}>
                <span>{client.name}</span>
                <span>{client.dni}</span>
                <span>{client.membership}</span>
                <span>
                  <div
                    className={`client-state ${getStateClass(client.state)}`}
                  >
                    <p>{client.state} Ingresos Restantes</p>
                  </div>
                </span>
                <span>
                  <div className="table-actions">
                    <i
                      className="ri-id-card-line"
                      onClick={() => onViewClient(client)}
                    ></i>
                    <i
                      className="ri-edit-line"
                      onClick={() => onEditClient(client)}
                    ></i>
                    <i
                      className="ri-delete-bin-line delete"
                      onClick={() => deleteClient(client.dni)}
                    ></i>
                  </div>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cards-bkg">
        <div className="pending">
          <h2>Membresías Expiradas</h2>
          <div className="pending-card-cont">
            {expiredMemberships.slice(0, 3).map((client, index) => (
              <div className="pending-card" key={index}>
                <h5>{client.name}</h5>
                <h3>{client.dni}</h3>
                <div>
                  <i className="ri-calendar-close-line"></i>
                  <p>
                    Membresía vencida el: <span>{client.expirationDate}</span>
                  </p>
                </div>
              </div>
            ))}
            {expiredMemberships.length === 0 && (
              <p>No hay membresías expiradas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Info;
