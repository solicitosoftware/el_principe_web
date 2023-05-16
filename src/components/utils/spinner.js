import React from "react";
import ReactLoading from "react-loading";

//componente de cargando
const Spinner = () => (
  <div className="position-absolute top-2/4 left-2/4 ">
    <ReactLoading type="spinningBubbles" color="white" />
  </div>
);

export default Spinner;
