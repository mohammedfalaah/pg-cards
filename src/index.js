import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from 'react-hot-toast';

console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <App />
      <Toaster
  position="top-center"
  reverseOrder={false}
/>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

