/*

The small popup that appears when hovering over the main button is defined here

*/

import React from "react";
import { popupLogo } from "../../misc/assets";

import { SelectedMode, setFunction, MenuState } from "../app";

export default function HoverMenu(props: {
  visible: boolean;
  triggerMenuHovered: setFunction<boolean>;
  setMode: setFunction<SelectedMode>;
  menuState: MenuState;
}) {
  const renderContents = () => {
    switch (props.menuState) {
      case MenuState.Default:
        return (
          <>
            <button
              className="hover-menu-button"
              onClick={() => {
                props.setMode(SelectedMode.Voice);
              }}
            >
              <i className="bi bi-mic"></i>
            </button>
            <button
              className="hover-menu-button"
              onClick={() => {
                props.setMode(SelectedMode.Text);
              }}
            >
              <i className="bi bi-chat-left"></i>
            </button>
            <button
              className="hover-menu-button"
              disabled
              onClick={() => {
                props.setMode(SelectedMode.Settings);
              }}
            >
              <i className="bi bi-gear"></i>
            </button>
          </>
        );
      case MenuState.Voice:
        return (
          <>
            <button
              className="hover-menu-button"
              onClick={() => {
                props.setMode(SelectedMode.None);
              }}
            >
              Cancel
            </button>
          </>
        );
      default:
        return <></>;
    }
  };

  return (
    <div
      id="hover-menu"
      style={{
        transform:
          props.visible && props.menuState !== MenuState.None
            ? "scale(1.1)"
            : "scale(0)",
        opacity:
          props.visible && props.menuState !== MenuState.None ? "100%" : "0%",
      }}
      onMouseEnter={() => {
        props.triggerMenuHovered(true);
      }}
      onMouseLeave={() => {
        props.triggerMenuHovered(false);
      }}
    >
      {renderContents()}

      <img src={popupLogo} className="background" />
    </div>
  );
}
