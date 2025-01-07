import { useState, useEffect } from "react";
import { useModal } from "./modal";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Info from "./Info";
import Payments from "./Payments";
import Home from "./Home";
import {
  AgregarClientePopup,
  EditarClientePopup,
  VerClientePopup,
  AsignarPagoPopup,
} from "./popups";
import Modal from "./modalBkg";

function Nav({ setSectionStyle }) {
  const [totalClients, setTotalClients] = useState(0);
  const [expiredClients, setExpiredClients] = useState([]);
  const [inactiveClients, setInactiveClients] = useState([]);
  const [navVisible, setNavVisible] = useState(true);

  const location = useLocation();

  const fetchClients = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/clients");
      const clients = await response.json();
      const today = new Date();

      const expired = [];
      const inactive = [];
      clients.forEach((client) => {
        if (client.currentPayment && client.currentPayment.date) {
          const paymentDate = new Date(client.currentPayment.date);
          const diffInDays = Math.floor(
            (today - paymentDate) / (1000 * 60 * 60 * 24)
          );

          if (diffInDays > 30 && diffInDays <= 60) {
            expired.push(client.name);
          } else if (diffInDays > 60) {
            inactive.push(client.name);
          }
        }
      });

      setTotalClients(clients.length);
      setExpiredClients(expired);
      setInactiveClients(inactive);
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }
  };
  useEffect(() => {
    fetchClients();
  }, []);

  const refreshClients = () => {
    fetchClients();
  };

  const handleToggleNav = () => {
    setNavVisible(false);
    setSectionStyle({ display: "flex", marginTop: "100px" });
  };

  return (
    <div className={`nav cards-bkg ${!navVisible ? "hidden" : ""}`}>
      <div className="nav-title">
        <h2>Pitbull Manager</h2>
        {location.pathname === "/home" && (
          <i className="ri-eye-off-line" onClick={handleToggleNav}></i>
        )}
      </div>
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
        <Link to="/home" className="Link">
          <button>
            <i className="ri-home-3-line"></i>
            <span>Home</span>
          </button>
        </Link>
      </div>
      <div className="nav-card">
        <div>
          <h4>Resumen</h4>
          <i class="ri-refresh-line" onClick={refreshClients}></i>
        </div>
        <p>Total Clientes: {totalClients}</p>
        <p>Membresías Expiradas: {expiredClients.length}</p>
        <p>Clientes inactivos: {inactiveClients.length}</p>
      </div>
      {expiredClients.length > 0 && (
        <div className="nav-card">
          <h5>Expirados</h5>
          {expiredClients.map((name, index) => (
            <p key={index}>{name}</p>
          ))}
        </div>
      )}
      {inactiveClients.length > 0 && (
        <div className="nav-card">
          <h5>Inactivos</h5>
          {inactiveClients.map((name, index) => (
            <p key={index}>{name}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function Site() {
  const { toggleModal } = useModal();

  const [selectedClient, setSelectedClient] = useState(null);
  const [sectionStyle, setSectionStyle] = useState({});

  const handleViewClient = (client) => {
    setSelectedClient(client);
    toggleModal("verCliente");
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    toggleModal("editarCliente");
  };

  return (
    <section className="container" style={sectionStyle}>
      <Nav setSectionStyle={setSectionStyle} />
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
        <Route path="/home" element={<Home />} />
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
