import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsappChat = () => {
  const phoneNumber = "+971521041736"; // Replace with your WhatsApp number
  const message = "Hello! I need some assistance."; // Customize your message

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed", 
        bottom: "80px",    
        right: "20px",     
        backgroundColor: "#25D366", 
        color: "white",
        borderRadius: "50%",
        width: "60px",
        height: "60px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1000, 
        cursor: "pointer",
      }}
    >
      <FaWhatsapp size={30} />
    </a>
  );
};

export default WhatsappChat;
