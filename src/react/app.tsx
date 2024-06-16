/*

Entrypoint to react, injected by content_script.tsx

*/

import React, { useEffect, useState } from "react";
import "./index.css";
import { baseButton, logoNoBackground } from "../misc/assets";
import HoverMenu from "./compnents/hover-menu";
import VoiceMode from "./mode-handles/voice/voice-mode";
import TextMode from "./mode-handles/text/text-mode";

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

export default function App() {
  const [activeIcon, setActiveIcon] = useState<string>(logoNoBackground);

  const [buttonHovered, setButtonHovered] = useState(false); // state of the main button being hovered
  const [menuHovered, setMenuHovered] = useState(false); // state of the hover menu being hovered

  const [menuVisible, setMenuVisible] = useState(false); // visibility of the hover menu
  const [menuType, setMenuType] = useState<MenuState>(MenuState.Default); // type of hover menu

  const [selectedMode, setSelectedMode] = useState<SelectedMode>(
    SelectedMode.None,
  ); // mode of the main chain (voice, text, etc.)

  useEffect(() => {
    setMenuVisible(buttonHovered || menuHovered);

    if (selectedMode === SelectedMode.Voice) {
      setMenuType(MenuState.Voice);
    } else if (selectedMode == SelectedMode.None) {
      setActiveIcon(logoNoBackground);
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

      <HoverMenu
        visible={menuVisible}
        triggerMenuHovered={setMenuHovered}
        setMode={setSelectedMode}
        menuState={menuType}
      />

      {/* Dispatch selection to the different modes */}
      <VoiceMode
        enabled={selectedMode === SelectedMode.Voice}
        setIcon={setActiveIcon}
        onReturn={() => {
          setSelectedMode(SelectedMode.None);
        }}
      />
      <TextMode
        enabled={selectedMode === SelectedMode.Text}
        setIcon={setActiveIcon}
        onReturn={() => {
          setSelectedMode(SelectedMode.None);
        }}
      />
    </div>
  );
}
