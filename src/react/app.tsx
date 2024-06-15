/*

Entrypoint to react, injected by content_script.tsx

*/

import React, { useState } from "react";
import "./index.css";
import { baseButton, logoNoBackground } from "../misc/assets";

export default function App() {

  const [activeIcon, setActiveIcon] = useState<string>(logoNoBackground);
  const [buttonHovered, setButtonHovered] = useState(false);

  return (
    <div style={{position: "relative"}}>

      <button id="primary-button">
        <img id="primary-button-icon" src={baseButton} className={buttonHovered ? "fade-hover" : ""} />
        <img id="primary-button-icon" src={activeIcon} className={buttonHovered ? "fade-hover" : ""} />
      </button>


    </div>
  );
}
