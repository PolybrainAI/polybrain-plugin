/*

Window that pops up when clicking the extension button

*/

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getUserInfo } from "../api/util";
import { UserInfo } from "../api/types";
import "./popup.css"

export function Popup() {

  const [userInfo, setUserInfo] = useState<UserInfo|null>(null);
  const [infoMessageVisible, setInfoMessageVisibility] = useState(false);

  useEffect(() => {
    (async () => {setUserInfo(await getUserInfo())})()
  },[])

  useEffect(() => {
    setTimeout(()=>{setInfoMessageVisibility(true)}, 2000)
  }, [])

  const loggedInPopup = () => {
    window.open("https://polybrain.xyz/portal", "_blank")
    return <div id="logged-in-popup">
      
    </div>
  }
  const loggedOutPopup = () => {
    return <div id="logged-out-popup">
      <h1>Log in to continue</h1>
      <p style={{transition: "0.5s", opacity: infoMessageVisible ? "50%" : "0%" }}><em>Reload this window once logged in</em></p>
      <button onClick={()=>{window.open("https://polybrain.xyz/auth0/login", "_blank") }}>Log In</button>
      <a href="https://polybrain.com/" target="_blank">Don't have an account? Sign up</a>
    </div>
  }

  return (
    <>
      {(userInfo === null) ? loggedOutPopup() : loggedInPopup()}
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
