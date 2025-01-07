import React from "react";
import { useState, useEffect } from "react";

export function AgregarClientePopup({ toggleModal }) {
  const [client, setClient] = useState({
    name: "",
    dni: "",
    phone: "",
    membership: "",
    state: 0,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const options = ["Normal", "Libre"]; // Opciones de membresía

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    const today = new Date();

    const formattedDate = today.toISOString().split("T")[0];

    setClient((prev) => ({
      ...prev,
      membership: option,
      state: option === "Libre" ? 24 : 12,
    }));
    setIsOpen(false);
  };
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = () => {
    fetch("http://localhost:3001/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    })
      .then((response) => response.json())
      .then(() => {
        toggleModal(null);
        window.location.reload(); // Refresca los datos después de agregar
      })
      .catch((err) => console.error("Error agregando cliente:", err));
  };

  return (
    <div className="popup agregarCliente">
      <span className="close" onClick={() => toggleModal(null)}>
        <i className="ri-close-line"></i>
      </span>
      <h5>Agregar Nuevo Cliente</h5>

      <div className="input-cont">
        <div>
          <i className="ri-user-line"></i>
          <p>Nombre</p>
        </div>
        <input
          type="text"
          name="name"
          onChange={handleChange}
          value={client.name}
        />
      </div>
      <div className="input-cont">
        <div>
          <i className="ri-bank-card-line"></i>
          <p>DNI</p>
        </div>
        <input
          type="text"
          name="dni"
          onChange={handleChange}
          value={client.dni}
        />
      </div>
      <div className="input-cont">
        <div>
          <i className="ri-phone-line"></i>
          <p>Teléfono</p>
        </div>
        <input
          type="text"
          name="phone"
          onChange={handleChange}
          value={client.phone}
        />
      </div>

      <div className="input-cont">
        <div>
          <i className="ri-medal-line"></i>
          <p>Membresía</p>
        </div>
        <div className="custom-select">
          <button
            className="custom-select-trigger"
            onClick={toggleDropdown}
            aria-expanded={isOpen}
          >
            {selectedOption || "Seleccione una opción"}
          </button>
          {isOpen && (
            <ul className="custom-select-options">
              {options.map((option, index) => (
                <li
                  key={index}
                  className="custom-select-option"
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button onClick={handleSubmit} className="add-client-btn">
        Agregar Cliente
      </button>
    </div>
  );
}

export function EditarClientePopup({ toggleModal, client }) {
  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const options = ["Normal", "Libre"];

  useEffect(() => {
    if (client) {
      setName(client.name);
      setDni(client.dni);
      setPhone(client.phone);
      setSelectedOption(client.membership);
    }
  }, [client]);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`http://localhost:3001/api/clients/${client.dni}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        dni,
        phone,
        membership: selectedOption,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error de la API: ${response.status}`);
        }
      })
      .then((updatedClient) => {
        alert("Cliente actualizado con éxito");
        toggleModal(null);
      })
      .catch((error) => {
        console.error("Error al enviar la solicitud de actualización:", error);
        alert("Hubo un error al actualizar el cliente");
      });
  };

  return (
    <>
      <div className="popup agregarCliente">
        <span className="close" onClick={() => toggleModal(null)}>
          <i className="ri-close-line"></i>
        </span>
        <h5>Editar Cliente</h5>
        <form className="editarForm" onSubmit={handleSubmit}>
          <div className="input-cont">
            <div>
              <i className="ri-user-line"></i>
              <p>Nombre</p>
            </div>
            <input
              type="text"
              name="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="input-cont">
            <div>
              <i className="ri-bank-card-line"></i>
              <p>DNI</p>
            </div>
            <input
              type="number"
              name="DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />
          </div>
          <div className="input-cont">
            <div>
              <i className="ri-phone-line"></i>
              <p>Teléfono</p>
            </div>
            <input
              type="number"
              name="Telefono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="input-cont">
            <div>
              <i className="ri-gender-line"></i>
              <p>Membresía</p>
            </div>
            <div className="custom-select">
              <button
                className="custom-select-trigger"
                type="button"
                value={selectedOption || ""}
                aria-expanded={isOpen}
                onClick={toggleDropdown}
                readOnly
              >
                {selectedOption || "Seleccione una opción"}
              </button>
              {isOpen && (
                <ul className="custom-select-options">
                  {options.map((option, index) => (
                    <li
                      key={index}
                      className={`custom-select-option ${
                        selectedOption === option ? "selected" : ""
                      }`}
                      onClick={() => handleOptionClick(option)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button type="submit" className="add-client-btn">
            Editar Cliente
          </button>
        </form>
      </div>
    </>
  );
}

export function VerClientePopup({ toggleModal, client }) {
  const today = new Date();
  const currentPaymentDate = new Date(client.currentPayment?.date);

  const diffInMilliseconds = today - currentPaymentDate;
  const diffInDays = diffInMilliseconds / (1000 * 3600 * 24);
  const diffInDaysInt = Math.floor(diffInDays);

  const daysToRenew = diffInDaysInt >= 30 ? 0 : 30 - (diffInDaysInt % 30);

  const getStateClass = (state) => {
    if (state <= 3) {
      return "red";
    } else if (state <= 7) {
      return "yellow";
    } else {
      return "green";
    }
  };

  const getDaysToRenewClass = (days) => {
    if (days <= 3) {
      return "red";
    } else if (days <= 7) {
      return "yellow";
    } else {
      return "green";
    }
  };

  return (
    <div className="popup verCliente">
      <span className="close" onClick={() => toggleModal(null)}>
        <i className="ri-close-line"></i>
      </span>
      <h2>Detalles del Cliente</h2>
      <div className="client-data-cont">
        <div className="client-data">
          <div>
            <i className="ri-user-line"></i>
            <p>Nombre</p>
          </div>
          <span>{client.name}</span>
        </div>
        <div className="client-data">
          <div>
            <i className="ri-bank-card-line"></i>
            <p>DNI</p>
          </div>
          <span>{client.dni}</span>
        </div>
        <div className="client-data">
          <div>
            <i className="ri-phone-line"></i>
            <p>Teléfono</p>
          </div>
          <span>{client.phone || "No disponible"}</span>
        </div>
        <div className="client-data">
          <div>
            <i className="ri-medal-line"></i>
            <p>Membresía</p>
          </div>
          <span>{client.membership}</span>
        </div>
      </div>
      <div className="renovation-cont">
        <div className={`renovation-card ${getDaysToRenewClass(daysToRenew)}`}>
          <div>
            <i className="ri-calendar-schedule-line"></i>
            <p>Fecha del Pago Actual</p>
          </div>
          <span>{daysToRenew} días</span>
          <h5>hasta la próxima renovación</h5>
        </div>
        <div className={`renovation-card ${getStateClass(client.state)}`}>
          <div>
            <i className="ri-coupon-line"></i>
            <p>Ingresos Restantes</p>
          </div>
          <span>{client.state}</span>
          <h5>ingresos disponibles</h5>
        </div>
      </div>
      <div className="renewal-title">
        <i className="ri-calendar-check-line"></i>
        <h5>Renovar Membresía</h5>
      </div>
      <form className="renewal-membership-cont">
        <div className="renewal-input">
          <span>Precio:</span>
          <input type="number" name="precio"></input>
        </div>
        <div className="renewal-checks">
          <label>
            <input type="radio" name="choice"></input>
            <span>Normal</span>
          </label>
          <label>
            <input type="radio" name="choice"></input>
            <span>Libre</span>
          </label>
        </div>
        <button className="btn">Confirmar Renovación</button>
      </form>
      <div className="last-payments-title">
        <i className="ri-money-dollar-box-line"></i>
        <span>Últimos pagos</span>
      </div>
      <div className="client-payments-cont">
        {/* Mostrar el pago actual */}
        {client.currentPayment && (
          <div className="client-payments-struct">
            <div className="client-payments-date">
              <div className="circle lightblue"></div>
              <div>
                <p>Actual</p>
                <span>
                  {client.currentPayment.date || "Fecha no disponible"}
                </span>
              </div>
            </div>
            <div className="client-payments-amount">
              <span>
                ${client.currentPayment.amount || "Monto no disponible"}
              </span>
              <h4>Renovación Membresía</h4>
            </div>
          </div>
        )}

        {client.previousPayment?.date && client.previousPayment?.amount && (
          <div className="client-payments-struct">
            <div className="client-payments-date">
              <div className="circle gray"></div>
              <div>
                <p>Previo</p>
                <span>
                  {client.previousPayment.date || "Fecha no disponible"}
                </span>
              </div>
            </div>
            <div className="client-payments-amount">
              <span>
                ${client.previousPayment.amount || "Monto no disponible"}
              </span>
              <h4>Renovación Membresía</h4>
            </div>
          </div>
        )}

        {!client.currentPayment && !client.previousPayment && (
          <p className="error">No hay pagos registrados.</p>
        )}
      </div>
    </div>
  );
}

export function AsignarPagoPopup({ toggleModal }) {
  const [dni, setDni] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Fecha seleccionada por el usuario
  const [membership, setMembership] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const options = ["Normal", "Libre"];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setMembership(option);
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newIncome;
    if (membership === "Normal") {
      newIncome = 12;
    } else if (membership === "Libre") {
      newIncome = 24;
    }

    const payload = {
      priceAmount,
      membership,
      paymentDate,
      state: newIncome,
    };

    try {
      const response = await fetch(
        `http://localhost:3001/api/clients/${dni}/assign-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        return;
      }

      const data = await response.json();
      alert("Pago asignado correctamente");
      toggleModal(null); // Cierra el popup
    } catch (error) {
      console.error("Error al asignar pago:", error);
      alert("Hubo un error al asignar el pago");
    }
  };

  return (
    <form className="popup agregarCliente" onSubmit={handleSubmit}>
      <span className="close" onClick={() => toggleModal(null)}>
        <i className="ri-close-line"></i>
      </span>
      <h5>Asignar Pago</h5>

      <div className="input-cont">
        <div>
          <i className="ri-info-card-line"></i>
          <p>DNI</p>
        </div>
        <input
          type="number"
          name="dni"
          placeholder="Ingrese DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          required
        />
      </div>
      <div className="input-cont">
        <div>
          <i className="ri-price-tag-3-line"></i>
          <p>Precio</p>
        </div>
        <input
          type="number"
          name="price"
          placeholder="Ingrese precio"
          value={priceAmount}
          onChange={(e) => setPriceAmount(e.target.value)}
          required
        />
      </div>
      <div className="input-cont">
        <div>
          <i className="ri-calendar-2-line"></i>
          <p>Fecha</p>
        </div>
        <input
          type="date"
          name="fecha"
          value={paymentDate} // Aquí usamos el valor de paymentDate
          onChange={(e) => setPaymentDate(e.target.value)}
          required
        />
      </div>
      <div className="input-cont">
        <div>
          <i className="ri-medal-line"></i>
          <p>Membresía</p>
        </div>
        <div className="custom-select">
          <button
            type="button"
            className="custom-select-trigger"
            onClick={toggleDropdown}
            aria-expanded={isOpen}
          >
            {membership || "Seleccione una opción"}
          </button>
          {isOpen && (
            <ul className="custom-select-options">
              {options.map((option, index) => (
                <li
                  key={index}
                  className="custom-select-option"
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button className="add-client-btn" type="submit">
        Asignar
      </button>
    </form>
  );
}
