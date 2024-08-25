/*

Interface for extension settings @ chrome://extensions/?options=<extension-id>

*/

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Options = () => {
  const [coreUrl, setCoreUrl] = useState<string>("https://core.polybrain.xyz");

  function saveChanges() {
    chrome.storage.local.set({ coreUrl: coreUrl });
    alert("Changes saved.")
  }

  useEffect(()=>{
    chrome.storage.local.get("coreUrl", (items)=>{
      setCoreUrl(items["coreUrl"])
    })
  },[])

  return <>
    <div>
      Core URL:
      <input style={{width: "100%"}} type='url' value={coreUrl} onChange={(ev) => { setCoreUrl(ev.target.value) }} />
      <br />
      <button onClick={saveChanges}>Done</button>
    </div>
  </>
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
);
