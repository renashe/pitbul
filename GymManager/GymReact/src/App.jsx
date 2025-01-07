import { useState } from "react";
import Site from "/comps/Site.jsx";
import "./App.css";
import { ModalProvider } from "../comps/modal";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <>
      <ModalProvider>
        <Router>
          <Site />
        </Router>
      </ModalProvider>
    </>
  );
}

export default App;
