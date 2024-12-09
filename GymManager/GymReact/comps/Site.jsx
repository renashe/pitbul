import { useState } from "react";
import { useModal } from "./modal";
import { Routes, Route, Link } from "react-router-dom";
import Info from "./Info";
import Payments from "./Payments";
import {
  AgregarClientePopup,
  EditarClientePopup,
  VerClientePopup,
  AsignarPagoPopup,
} from "./popups";
import Modal from "./modalBkg";

function Nav() {
  return (
    <div className="nav cards-bkg">
      <h2>Pitbull Manager</h2>
      <div className="nav-cont">
        <Link to="/" className="Link">
          <button>
            <i className="ri-group-line"></i>
            <span>Clientes</span>
          </button>
        </Link>
        <Link to="/payments" className="Link">
          <button>
            <i className="ri-money-dollar-box-line"></i>
            <span>Pagos</span>
          </button>
        </Link>
        <button>
          <i className="ri-bar-chart-fill"></i>
          <span>Estadísticas</span>
        </button>
      </div>
      <div className="nav-card">
        <h4>Resumen</h4>
        <p>Total Clientes: 57</p>
        <p>Membresías Expiradas: 6</p>
      </div>
      <div className="nav-card">
        <h4>Expirados</h4>
        <p>Carlos López</p>
        <p>Juan Romero</p>
        <p>Sofía García</p>
        <p>Ramon Alés</p>
        <p>Carlos Martínez</p>
        <p>Jose Gomez</p>
      </div>
      <div className="nav-card">
        <h4>Inactivos (1 mes)</h4>
        <p>Pablo Pablin</p>
      </div>
    </div>
  );
}

function Site() {
  const { toggleModal } = useModal();

  const [selectedClient, setSelectedClient] = useState(null);

  // Función para manejar la apertura del modal y selección del cliente
  const handleViewClient = (client) => {
    setSelectedClient(client);
    toggleModal("verCliente");
  };
  const handleEditClient = (client) => {
    setSelectedClient(client);
    toggleModal("editarCliente");
  };

  return (
    <section className="container">
      <Nav />
      <Routes>
        <Route
          path="/"
          element={
            <Info
              toggleModal={toggleModal}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
            />
          }
        />
        <Route
          path="/payments"
          element={<Payments toggleModal={toggleModal} />}
        />
      </Routes>

      <Modal
        id="agregarCliente"
        content={
          <AgregarClientePopup
            toggleModal={() => toggleModal("agregarCliente")}
          />
        }
      />
      <Modal
        id="editarCliente"
        content={
          selectedClient && (
            <EditarClientePopup
              toggleModal={() => toggleModal("editarCliente")}
              client={selectedClient}
            />
          )
        }
      />
      <Modal
        id="verCliente"
        content={
          selectedClient && (
            <VerClientePopup
              toggleModal={() => toggleModal("verCliente")}
              client={selectedClient}
            />
          )
        }
      />
      <Modal
        id="asignarPago"
        content={
          <AsignarPagoPopup toggleModal={() => toggleModal("asignarPago")} />
        }
      />
    </section>
  );
}

export default Site;
