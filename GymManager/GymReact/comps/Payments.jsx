import { useState } from "react";

function Payments({ toggleModal }) {
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
            <p>Cliente</p>
            <p>DNI</p>
            <p>Monto</p>
            <p>Fecha</p>
            <p>Próxima Renovación</p>
            <p></p>
          </div>
          <div className="table-body pay">
            {[
              {
                name: "Ana García",
                dni: "40482123",
                amount: "$8.000",
                date: "2024/11/14",
                renewal: "Renueva en 2 días",
                renewalClass: "yellow",
              },
              {
                name: "Carlos López",
                dni: "29424820",
                amount: "$9.500",
                date: "2024/11/14",
                renewal: "Renueva en 12 días",
                renewalClass: "green",
              },
              {
                name: "María Rodríguez",
                dni: "28138902",
                amount: "$12.500",
                date: "2024/11/14",
                renewal: "Renovación requerida",
                renewalClass: "red",
              },
              {
                name: "Pablo Aimar",
                dni: "40482123",
                amount: "$12.000",
                date: "2024/10/14",
                renewal: "Renueva en 6 días",
                renewalClass: "yellow",
              },
              {
                name: "Juan Romero",
                dni: "29424820",
                amount: "$11.500",
                date: "2024/02/14",
                renewal: "Renueva en 12 días",
                renewalClass: "green",
              },
              {
                name: "Mariana López",
                dni: "28134232",
                amount: "$11.500",
                date: "2024/02/14",
                renewal: "Renovación requerida",
                renewalClass: "red",
              },
            ].map((payment, index) => (
              <div className="table-body-cont pay" key={index}>
                <span>{payment.name}</span>
                <span>{payment.dni}</span>
                <span>{payment.amount}</span>
                <span>{payment.date}</span>
                <span>
                  <div
                    className={`client-state renewal-payx ${payment.renewalClass}`}
                  >
                    <p className="renewal-pay">{payment.renewal}</p>
                  </div>
                </span>
                <span>
                  <div className="table-actions">
                    <i className="ri-id-card-line"></i>
                    <i className="ri-edit-line"></i>
                    <i className="ri-delete-bin-line delete"></i>
                  </div>
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="advice">Esta lista se borrará cada 1 mes</p>
      </div>
      <div className="payments-info-cont">
        <div className="payment-history cards-bkg">
          <h2>Historial de Pagos Recientes</h2>
          <div className="history-list scrollable">
            {[...Array(12)].map((_, i) => (
              <div className="history-card">
                <div className="history-card-first">
                  <span className="history-icon-bkg">
                    <i class="ri-file-check-line"></i>
                  </span>
                  <div>
                    <p>Juan Pérez</p>
                    <span>12345678</span>
                  </div>
                </div>
                <div className="history-card-last">
                  <span>$12.500</span>
                  <p>2024/11/14</p>
                </div>
              </div>
            ))}
          </div>
          <p className="advice">Esta lista se actualizará cada 3 días.</p>
        </div>
        <div className="payments-cards-cont">
          <div className="payments-cards blueskewbkg">
            <div>
              <h5 className="blue-card-text">Pagos Totales (Mes)</h5>
              <i className="ri-money-dollar-circle-line blue-card-text"></i>
            </div>
            <span>$45,550</span>
            <p>+20.1% del mes anterior</p>
            <div className="payments-card-skew rightskew blueskew"></div>
          </div>

          <div className="payments-cards greenskewbkg">
            <div>
              <h5 className="green-card-text">Pagos Totales (Global)</h5>
              <i className="ri-line-chart-line green-card-text"></i>
            </div>
            <span>$205,720</span>
            <p>+7.15% del mes anterior</p>
            <div className="payments-card-skew leftskew greenskew"></div>
          </div>

          <div className="payments-cards purpleskewbkg">
            <div>
              <h5 className="purple-card-text">Próximo cierre</h5>
              <i className="ri-calendar-line purple-card-text"></i>
            </div>
            <span>15 días</span>
            <p>Hasta el próximo cierre mensual</p>
            <div className="payments-card-skew rightskew purpleskew"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;
