import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// O vite-plugin-pwa registra e gerencia o service worker automaticamente.
// Não é necessário nenhum código manual aqui.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
