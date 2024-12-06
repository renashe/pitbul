import React, { useState } from "react";
import { useModal } from "./modal";

function Modal({ id, content }) {
  const { activeModal, toggleModal } = useModal();

  if (activeModal !== id) return null;

  return (
    <>
      <div className="popupBkg">
        <div className="overlay" onClick={() => toggleModal(null)}></div>
        {content}
      </div>
    </>
  );
}

export default Modal;
