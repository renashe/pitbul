import React, { useEffect, useState } from "react";

function Info({ toggleModal, onViewClient, onEditClient }) {
  const [clients, setClients] = useState([]);

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
          />
          <i className="ri-search-line"></i>
        </div>
        <div className="table">
          <div className="table-head">
            <p>Nombre</p>
            <p>DNI</p>
            <p>Membresía</p>
            <p>Estado</p>
            <p></p>
          </div>
          <div className="table-body">
            {clients.map((client, index) => (
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
            <div className="pending-card">
              <h5>Carlos López</h5>
              <h3>45125563</h3>
              <div>
                <i class="ri-calendar-close-line"></i>
                <p>
                  Membresía vencida el: <span>2024/7/12</span>
                </p>
              </div>
              <button>Gestionar</button>
            </div>
            <div className="pending-card">
              <h5>Juan Romero</h5>
              <h3>38323812</h3>
              <div>
                <i class="ri-calendar-close-line"></i>
                <p>
                  Membresía vencida el: <span>2024/28/11</span>
                </p>
              </div>
              <button>Gestionar</button>
            </div>
            <div className="pending-card">
              <h5>Sofía García</h5>
              <h3>41235678</h3>
              <div>
                <i class="ri-calendar-close-line"></i>
                <p>
                  Membresía vencida el: <span>2024/4/12</span>
                </p>
              </div>
              <button>Gestionar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Info;
