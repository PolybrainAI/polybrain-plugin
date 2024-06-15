/*

Entrypoint to react, injected by content_script.tsx

*/

import React, { useEffect, useState } from "react";
import "./index.css";
import { baseButton, logoNoBackground } from "../misc/assets";
import HoverMenu from "./compnents/hover-menu";

export default function App() {
  const [activeIcon, setActiveIcon] = useState<string>(logoNoBackground);

  const [buttonHovered, setButtonHovered] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    setMenuVisible(buttonHovered || menuHovered);
  });

  return (
    <div style={{ position: "relative" }}>
      <button
        id="primary-button"
        className={menuVisible ? "hover" : ""}
        onMouseEnter={() => {
          setButtonHovered(true);
        }}
        onMouseLeave={() => {
          setButtonHovered(false);
        }}
      >
        <img
          id="primary-button-icon"
          src={baseButton}
          className={buttonHovered ? "fade-hover" : ""}
        />
        <img
          id="primary-button-icon"
          src={activeIcon}
          className={buttonHovered ? "fade-hover" : ""}
        />
      </button>

      <HoverMenu visible={menuVisible} triggerMenuHovered={setMenuHovered} />
    </div>
  );
}
