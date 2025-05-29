import React from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";

const layout = ({ children }) => {
  return (
    <div>
      <NavBar />
      {children}
      <Footer />
    </div>
  );
};

export default layout;
