/*

Entrypoint to react, injected by content_script.tsx

*/

import React, { useEffect, useState } from "react";
import "./index.css";
import { baseButton, logoNoBackground } from "../misc/assets";
import HoverMenu from "./compnents/hover-menu";
import VoiceMode from "./mode-handles/voice/voice-mode";
import TextMode from "./mode-handles/text/text-mode";
import { websocketListen } from "../api/websocket";

export type setFunction<T> = (state: T) => void;
export enum SelectedMode {
  None,
  Voice,
  Text,
  Settings,
}
export enum MenuState {
  None,
  Default,
  Voice,
}

const ICON_TRANSITION_DURATION = 0.3; // seconds

export default function App() {
  const [activeIcon, setActiveIcon] = useState<string>(logoNoBackground);

  const [buttonHovered, setButtonHovered] = useState(false); // state of the main button being hovered
  const [menuHovered, setMenuHovered] = useState(false); // state of the hover menu being hovered

  const [menuVisible, setMenuVisible] = useState(false); // visibility of the hover menu
  const [menuType, setMenuType] = useState<MenuState>(MenuState.Default); // type of hover menu

  const [selectedMode, setSelectedMode] = useState<SelectedMode>(
    SelectedMode.None,
  ); // mode of the main chain (voice, text, etc.)

  /**
   * Sets the icon on the main plugin button. Adds in and out animations
   * @param icon The path to the icon to set
   */
  async function setIcon(iconPath: string): Promise<void> {
    if (iconPath === activeIcon) {
      return;
    }

    const iconElement = document.getElementById("primary-button-icon");
    console.log(`setting icon to ${iconPath}`);

    if (iconElement === null) {
      throw Error("Icon element cannot be null");
    }
    iconElement.style.transition = `${ICON_TRANSITION_DURATION}s`;

    // fade icon to nothing
    iconElement.style.transform = "scale(0)";
    iconElement.style.opacity = "0%";
    await new Promise((resolve) =>
      setTimeout(resolve, ICON_TRANSITION_DURATION * 1000),
    );

    setActiveIcon(iconPath); // chance icon

    // fade back to normal
    iconElement.style.transform = "scale(1)";
    iconElement.style.opacity = "100%";
    await new Promise((resolve) =>
      setTimeout(resolve, ICON_TRANSITION_DURATION * 1000),
    );
  }

  useEffect(() => {
    setMenuVisible(buttonHovered || menuHovered);

    if (selectedMode === SelectedMode.Voice) {
      setMenuType(MenuState.Voice);
    } else if (selectedMode == SelectedMode.None) {
      setIcon(logoNoBackground);
      setMenuType(MenuState.Default);
    } else {
      setMenuType(MenuState.None);
    }
  });

  return (
    <div style={{ position: "relative" }}>
      <button
        id="primary-button"
        className={
          menuVisible || selectedMode !== SelectedMode.None ? "hover" : ""
        }
        onMouseEnter={() => {
          setButtonHovered(true);
        }}
        onMouseLeave={() => {
          setButtonHovered(false);
        }}
      >
        <img
          id="primary-button-backing"
          src={baseButton}
          className={buttonHovered ? "fade-hover" : ""}
        />
        <img
          id="primary-button-icon"
          src={activeIcon}
          className={buttonHovered ? "fade-hover" : ""}
        />
      </button>

      <HoverMenu
        visible={menuVisible}
        triggerMenuHovered={setMenuHovered}
        setMode={setSelectedMode}
        menuState={menuType}
      />

      {/* Dispatch selection to the different modes */}
      <VoiceMode
        enabled={selectedMode === SelectedMode.Voice}
        setIcon={setIcon}
        onReturn={() => {
          setSelectedMode(SelectedMode.None);
        }}
      />
      <TextMode
        enabled={selectedMode === SelectedMode.Text}
        setIcon={setIcon}
        onReturn={() => {
          setSelectedMode(SelectedMode.None);
        }}
      />
    </div>
  );
}
