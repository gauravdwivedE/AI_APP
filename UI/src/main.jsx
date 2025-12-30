import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import { LoginProvider } from "../src/context/LoginProvider.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#0d0d0d",
          color: "#fff",
          border: "1px solid #333",
          padding: "12px 16px",
        },
      }}
    />
    <LoginProvider>
      <App />
    </LoginProvider>
  </BrowserRouter>,
)
