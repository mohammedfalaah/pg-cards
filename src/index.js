import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from 'react-hot-toast';

const REACT_APP_GOOGLE_CLIENT_ID ='1020234324057-4l2u2ctn6jtq2sgolg569u3mf3aqd9pm.apps.googleusercontent.com';

console.log("Google Client ID:", REACT_APP_GOOGLE_CLIENT_ID);
console.log("Google Client ID:", REACT_APP_GOOGLE_CLIENT_ID);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={REACT_APP_GOOGLE_CLIENT_ID}>
      <App />
      <Toaster
  position="top-center"
  reverseOrder={false}
/>

    </GoogleOAuthProvider>
  </React.StrictMode>
);

