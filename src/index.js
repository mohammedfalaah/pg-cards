import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from 'react-hot-toast';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '340844493737-ldev50489jene365c0smg0ttgm2siba5.apps.googleusercontent.com';

console.log("Google Client ID:", GOOGLE_CLIENT_ID);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
      <Toaster
  position="top-center"
  reverseOrder={false}
/>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

