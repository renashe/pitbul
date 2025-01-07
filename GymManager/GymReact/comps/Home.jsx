import React, { useState, useEffect } from "react";

function Inicio() {
  const [dni, setDni] = useState("");
  const [client, setClient] = useState(null);
  const [error, setError] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setDni(e.target.value);
  };

  const calculateRenewalStatus = (paymentDate) => {
    if (!paymentDate) {
      return { message: "Fecha de pago no disponible", class: "gray" };
    }

    const today = new Date();
    const payment = new Date(paymentDate);
    const diffTime = today - payment;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const remainingDays = 30 - diffDays;

    let renewalClass = "greeny";
    let renewalMessage = `Expira en ${remainingDays} días`;

    if (diffDays >= 30) {
      renewalClass = "redy";
      renewalMessage = "Membresía expirada";
    } else if (diffDays >= 23 && diffDays < 30) {
      renewalClass = "yellowy";
      renewalMessage = `Expira en ${remainingDays} días`;
    }

    return { message: renewalMessage, class: renewalClass };
  };

  const handleSearch = async () => {
    setError("");
    setClient(null);
    setMessage(""); // Reset the message before fetching new client

    try {
      const response = await fetch(`http://localhost:3001/api/clients/${dni}`);
      if (!response.ok) {
        throw new Error("Cliente no encontrado");
      }
      const data = await response.json();

      // Verificación de ingresos insuficientes
      if (data.state <= 0) {
        setMessage("Ingresos insuficientes");
        setTimeout(() => {
          setMessage(""); // Remove the message after 5 seconds
        }, 5000);
        return; // No continuar con la ejecución
      }

      const { message, class: renewalClass } = calculateRenewalStatus(
        data.currentPayment.date
      );

      data.membershipDaysToRenewMessage = message;
      data.renewalClass = renewalClass;

      // Check for expired membership
      if (renewalClass === "redy") {
        setMessage("Membresía expirada");
        setTimeout(() => {
          setMessage(""); // Remove the message after 5 seconds
        }, 5000);
        return; // Close the card and stop further execution
      }

      setClient(data); // Show the client data if valid
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEnter = async () => {
    if (!client) return;

    try {
      // Realizamos la operación de restar al estado
      const response = await fetch(
        `http://localhost:3001/api/clients/${client.dni}/decrease-state`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ decreaseAmount: 1 }), // Puedes ajustar el valor de decreaseAmount
        }
      );

      if (!response.ok) {
        throw new Error("Error al restar al estado del cliente");
      }

      const updatedClient = await response.json();
      setClient(updatedClient.updatedClient); // Actualizamos el estado del cliente

      // Aquí puedes cerrar la card (resetear client a null)
      setClient(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-cont">
      <h3>{time}</h3>
      <p>Buenos días</p>

      <input
        type="number"
        name="dni"
        placeholder="Ingrese DNI"
        value={dni}
        onChange={handleInputChange}
      />
      <button className="home-btn" onClick={handleSearch}>
        Buscar
      </button>

      {message && (
        <div className="alert-message">
          <p>{message}</p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {client && (
        <div className="home-client-cont">
          <div className="home-div-title">
            <div>
              <i className="ri-user-line"></i>
              <span>{client.name}</span>
            </div>
            <h4>DNI: {client.dni}</h4>
          </div>
          <div className="home-info">
            <div className="home-info-div">
              <span>
                <i className="ri-coupon-line"></i>Ingresos restantes
              </span>
              <h4>{client.state}</h4>
            </div>
            <div className="home-info-div">
              <span>
                <i className="ri-medal-line"></i>Membresía
              </span>
              <div>
                <h5>{client.membership}</h5>
                <h6 className={`renewal-status ${client.renewalClass}`}>
                  {client.membershipDaysToRenewMessage}
                </h6>
              </div>
            </div>
            <button className="home-in" onClick={handleEnter}>
              Ingresar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inicio;
