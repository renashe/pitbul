import { useState, useEffect } from "react";

const calculateRenewalStatus = (currentPayment) => {
  if (!currentPayment || !currentPayment.date) {
    return { status: "Fecha de pago no disponible", class: "gray" };
  }

  const today = new Date();
  const currentPaymentDate = new Date(currentPayment.date);
  const diffTime = today - currentPaymentDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const remainingDays = 30 - diffDays;
  if (diffDays >= 30) {
    return { status: "Renovación requerida", class: "red" };
  } else if (diffDays >= 23 && diffDays < 30) {
    return { status: `Renueva en ${remainingDays} días`, class: "yellow" };
  } else if (diffDays < 23) {
    return { status: `Renueva en ${remainingDays} días`, class: "green" };
  }
};

const isWithinLast31Days = (paymentDate) => {
  const today = new Date();
  const payment = new Date(paymentDate);
  const diffTime = today - payment;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 31;
};

const getDaysUntilEndOfMonth = () => {
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const diffTime = lastDayOfMonth - today;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

function Payments({ toggleModal }) {
  const [clients, setClients] = useState([]);
  const [totalMonthlyPayments, setTotalMonthlyPayments] = useState(0);
  const [totalGlobalPayments, setTotalGlobalPayments] = useState(0);
  const [daysUntilEndOfMonth, setDaysUntilEndOfMonth] = useState(0);

  useEffect(() => {
    // Llamar a la función de días restantes hasta el final del mes
    setDaysUntilEndOfMonth(getDaysUntilEndOfMonth());

    const fetchClients = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/clients");
        const data = await response.json();
        setClients(data);

        let globalTotal = 0;
        let monthlyTotal = 0;

        data.forEach((client) => {
          globalTotal += parseFloat(client.globalPayments || 0);
          monthlyTotal += parseFloat(client.monthlyPayments || 0);
        });

        setTotalGlobalPayments(globalTotal);
        setTotalMonthlyPayments(monthlyTotal);
      } catch (error) {
        console.error("Error al obtener los clientes:", error);
      }
    };

    fetchClients();
  }, []);

  const getTopClients = () => {
    // Ordenar los clientes según globalPayments y tomar los 9 mejores
    const sortedClients = [...clients]
      .sort((a, b) => b.globalPayments - a.globalPayments)
      .slice(0, 9);

    // Rellenar con espacios vacíos si hay menos de 9 clientes
    while (sortedClients.length < 9) {
      sortedClients.push({ name: "", dni: "", globalPayments: 0 });
    }

    return sortedClients;
  };

  const topClients = getTopClients();

  const handleDeletePayment = async (dni, paymentType) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/clients/${dni}/delete-payment`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentType }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo eliminar el pago");
      }

      const updatedClient = await response.json();
      setClients((prevClients) =>
        prevClients.map((client) =>
          client.dni === dni ? updatedClient : client
        )
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="payments">
      <div className="client-table cards-bkg">
        <div className="client-title">
          <h2>Lista de Pagos</h2>
          <button onClick={() => toggleModal("asignarPago")} type="submit">
            <p>Asignar Pago</p>
            <i className="ri-sticky-note-add-line"></i>
          </button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            name="client-search"
            placeholder="Buscar pago..."
          />
          <i className="ri-search-line"></i>
        </div>
        <div className="table pay">
          <div className="table-head pay">
            <p>Nombre</p>
            <p>DNI</p>
            <p>Monto</p>
            <p>Fecha</p>
            <p>Próxima Renovación</p>
            <p></p>
          </div>
          <div className="table-body pay">
            {clients
              .filter(
                (client) =>
                  (client.currentPayment && client.currentPayment.amount) ||
                  (client.previousPayment &&
                    isWithinLast31Days(client.previousPayment.date))
              )
              .map((client, index) => {
                const currentRenewal =
                  client.currentPayment &&
                  calculateRenewalStatus(client.currentPayment);

                return (
                  <>
                    {client.currentPayment && client.currentPayment.amount && (
                      <div
                        className="table-body-cont pay"
                        key={`${client.dni}-current`}
                      >
                        <span>{client.name}</span>
                        <span>{client.dni}</span>
                        <span>${client.currentPayment.amount}</span>
                        <span>{client.currentPayment.date}</span>
                        <span>
                          <div
                            className={`client-state renewal-payx ${
                              currentRenewal?.class || "gray"
                            }`}
                          >
                            <p className="renewal-pay">
                              {currentRenewal?.status}
                            </p>
                          </div>
                        </span>
                        <span>
                          <div className="table-actions">
                            <i
                              className="ri-delete-bin-line delete"
                              onClick={() =>
                                handleDeletePayment(
                                  client.dni,
                                  "currentPayment"
                                )
                              }
                            ></i>
                          </div>
                        </span>
                      </div>
                    )}

                    {client.previousPayment &&
                      isWithinLast31Days(client.previousPayment.date) && (
                        <div
                          className="table-body-cont pay"
                          key={`${client.dni}-previous`}
                        >
                          <span>{client.name}</span>
                          <span>{client.dni}</span>
                          <span>${client.previousPayment.amount}</span>
                          <span>{client.previousPayment.date}</span>
                          <span>
                            <div className={`client-state renewal-payx gray`}>
                              <p className="renewal-pay">Fecha pasada</p>
                            </div>
                          </span>
                          <span>
                            <div className="table-actions">
                              <i
                                className="ri-delete-bin-line delete"
                                onClick={() =>
                                  handleDeletePayment(
                                    client.dni,
                                    "previousPayment"
                                  )
                                }
                              ></i>
                            </div>
                          </span>
                        </div>
                      )}
                  </>
                );
              })}
          </div>
        </div>
        <p className="advice">
          Esta lista muestra los pagos de los ultimos 31 días
        </p>
      </div>
      <div className="payments-info-cont">
        <div className="payment-history cards-bkg">
          <h2>Clientes Más Activos</h2>
          <div className="history-list scrollable">
            {topClients
              .sort((a, b) => b.globalPayments - a.globalPayments)
              .map((client, i) => (
                <div className="history-card" key={i}>
                  <div className="history-card-first">
                    <span className="history-icon-bkg">
                      <i className="ri-trophy-line"></i>
                      <p>{i + 1}</p>
                    </span>
                    <div>
                      <p>{client.name || " "}</p>
                      <span>{client.dni || " "}</span>
                    </div>
                  </div>
                  <div className="history-card-last">
                    <span>
                      {client.globalPayments > 0
                        ? `$${client.globalPayments.toLocaleString()}`
                        : ""}
                    </span>
                    <p>Total Pagado</p>
                  </div>
                </div>
              ))}
          </div>
          <p className="advice">Esta lista muestra los pagos totales.</p>
        </div>
        <div className="payments-cards-cont">
          <div className="payments-cards blueskewbkg">
            <div>
              <h5 className="blue-card-text">Pagos Totales (Mes)</h5>
              <i className="ri-money-dollar-circle-line blue-card-text"></i>
            </div>
            <span>${totalMonthlyPayments.toLocaleString()}</span>
            <div className="payments-card-skew rightskew blueskew"></div>
          </div>

          <div className="payments-cards greenskewbkg">
            <div>
              <h5 className="green-card-text">Pagos Totales (Global)</h5>
              <i className="ri-line-chart-line green-card-text"></i>
            </div>
            <span>${totalGlobalPayments.toLocaleString()}</span>
            <div className="payments-card-skew leftskew greenskew"></div>
          </div>

          <div className="payments-cards purpleskewbkg">
            <div>
              <h5 className="purple-card-text">Próximo cierre</h5>
              <i className="ri-calendar-line purple-card-text"></i>
            </div>
            <span>{daysUntilEndOfMonth} días</span>
            <p>Hasta el próximo cierre mensual</p>
            <div className="payments-card-skew rightskew purpleskew"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;
