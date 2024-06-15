/*

The small popup that appears when hovering over the main button is defined here

*/

import React from "react";
import { popupLogo } from "../../misc/assets";

type setFunction = (state: boolean) => void;

export default function HoverMenu(props: {
  visible: boolean;
  triggerMenuHovered: setFunction;
}) {
  return (
    <div
      id="hover-menu"
      style={{
        transform: props.visible ? "scale(1.1)" : "scale(0)",
        opacity: props.visible ? "100%" : "0%",
      }}
      onMouseEnter={() => {
        props.triggerMenuHovered(true);
      }}
      onMouseLeave={() => {
        props.triggerMenuHovered(false);
      }}
    >
      <button className="hover-menu-button"><i className="bi bi-mic"></i></button>
      <button className="hover-menu-button"><i className="bi bi-chat-left"></i></button>
      <button className="hover-menu-button"><i className="bi bi-gear"></i></button>

      <img src={popupLogo} className="background" />
    </div>
  );
}
