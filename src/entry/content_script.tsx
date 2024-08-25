import React from "react";
import ReactDOM from "react-dom/client";
import App from "../react/app";
import { getCookie } from "../api/util";

var polybrain_attached = false;
var react_root: HTMLDivElement | null;

// Attach the polybrain assistant
async function attach() {
  if (!polybrain_attached) {
    console.log("Attaching Polybrain assistant...");
    polybrain_attached = true;
    react_root = document.createElement("div");
    react_root.id = "polybrain-assistant";
    document.body.appendChild(react_root);

    console.log("Injected Polybrain root:");
    console.log(react_root);

    const root = ReactDOM.createRoot(
      document.getElementById("polybrain-assistant") as HTMLElement,
    );
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );

    console.log("Attached react to root");
  }
}

// Detach the polybrain assistant
async function detach() {
  if (polybrain_attached) {
    console.log("Detaching Polybrain assistant...");
    polybrain_attached = false;
  }
}

/// Gets the document id from the URL, if it exists
function extractDocumentId(): string | null {
  const url = window.location.href;
  const regex = /documents\/([a-f0-9]{24})/;
  const match = url.match(regex);
  if (match) {
    return match[1];
  } else {
    console.debug(`Unable to extract document id from the url ${url}`);
    return null;
  }
}

// Wait for the URL to change to a document
async function await_attach() {
  console.log("Waiting for document url...");

  for (let i = 0; i < 5; i++) {
    const hasDocumentId = extractDocumentId() !== null;
    const hasCookie = await getCookie() !== null;
    const isReady = hasDocumentId && hasCookie;

    if (isReady) {
      return await attach();
    } else {
      console.log("waiting for url update...");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("URL is not an OnShape modeler, or did not resolve in time");
  return await detach();
}

// Set up a listener for trigger from background.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "attachPolybrain") {
    await_attach();
    sendResponse({ status: "Function executed" });
  }
});
