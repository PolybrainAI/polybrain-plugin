import React, { useEffect, useRef, useState } from "react";
import EventEmitter from "events";
import { logoCircle, userIcon } from "../../../misc/assets";
import MessageDisplay from "./message-display";
import { websocketListen } from "../../../api/websocket";

export interface Message {
  name: string;
  content: string;
  imageRef: string;
}

export default function TextMode(props: {
  enabled: boolean;
  setIcon: (icon: string) => void;
  onReturn: () => void;
}) {
  const chatWindow = useRef<HTMLDivElement>(null); // reference to the primary chat window
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]); // fix because react is weird

  const [textboxContent, setTextboxContent] = useState(""); // the contents of the textbox
  const [textboxSelected, setTextboxSelected] = useState(false); // whether or not the user is selecting the textbox
  const [textboxAvailable, setTextboxAvailable] = useState(false); // whether or no the textbox is enabled for messages
  const textboxRef = useRef<HTMLTextAreaElement>(null); // a reference to the textbox

  // Sets up a local event emitter
  const bus = useRef<EventEmitter>(new EventEmitter);

  /**
   * Appends a new message to the list of messages
   * @param msg The message to append to the window
   */
  function appendMessage(msg: Message): void {
    messagesRef.current.push(msg);
    setMessages(messagesRef.current);
    bus.current.emit("new", msg)
  }

  /**
   * Converts the contents of the textbox into a user message. Clears textbox
   * content and appends message in the process.
   */
  function addUserMessage(): void {
    if (textboxContent.trim() === "") {
      return;
    }

    const newMessage: Message = {
      name: "You", // todo: get name from api
      content: textboxContent,
      imageRef: userIcon,
    };
    const messageContent = textboxContent;

    appendMessage(newMessage);
    setTextboxContent("");

    bus.current?.emit("messageSent", messageContent); // Pass the message content with the event
    console.log(`User added message: ${textboxContent}`);
  }

  /**
   * Adds a message to the chat window from "Polybrain"
   * @param message The contents of the message to add
   */
  function addServerMessage(message: string) {
    const serverMessage: Message = {
      name: "Polybrain",
      content: message,
      imageRef: logoCircle,
    };
    appendMessage(serverMessage);

    console.log(`Added server message: ${message}`);
  }

  /**
   * Wait for the user to input a message
   * @returns The contents of the message
   */
  async function waitForMessage(): Promise<string> {
    setTextboxAvailable(true);
    console.log("waiting for message");
    const messageContent: string = await new Promise(
      (resolve) => bus.current?.once("messageSent", resolve),
    );

    setTextboxAvailable(false);
    return messageContent;
  }

  /**
   * Prompts the user for input
   * @param prompt The message to prompt the user with
   * @returns The user's response to the prompt
   */
  async function getUserInput(prompt: string): Promise<string> {
    addServerMessage(prompt);
    return waitForMessage();
  }

  /**
   * Displays an intermediate info message in the chat window
   * @param info The intermediate info message from the model
   */
  async function onModelInfo(info: string): Promise<void> {
    console.log(`incoming model info: ${info}`);
    addServerMessage(info);
  }

  /**
   * Displays the final chain message in the chat windows
   * @param message The final chat message
   */
  async function onModelFinal(message: string): Promise<void> {
    console.log(`chain finished with message: ${message}`);
    addServerMessage(message);
  }

  /**
   * Begins the conversation chain on websocket
   */
  async function beginChain() {
    addServerMessage("Hello! How can I help you?");
    const initialPrompt = await waitForMessage();

    await websocketListen(
      initialPrompt,
      getUserInput,
      onModelInfo,
      onModelFinal,
    );
  }

  useEffect(() => {
    if (props.enabled) {
      console.log("beginning text chain");
      beginChain();
    }
  }, [props.enabled]);

  // Autocross chat window to bottom on each render
  useEffect(() => {
    if (textboxRef.current !== null) {
      textboxRef.current.style.height = "auto";
      let desiredHeight = textboxRef.current.scrollHeight;
      if (desiredHeight < 22) {
        desiredHeight = 22;
      }
      textboxRef.current.style.height = `${desiredHeight}px`;
    }
  }, [textboxContent]);

  return (
    <>
      <div
        id="chat-window"
        style={{ display: props.enabled ? "flex" : "none" }}
        ref={chatWindow}
      >
        <div id="chat-header">
          <img className="logo" src={logoCircle}></img>
          <h2 className="logo-font">Polybrain</h2>

          {/* <button className="chat-header-btn min"><i className="bi bi-dash"></i></button> */}
          <button className="chat-header-btn exit" onClick={props.onReturn}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <MessageDisplay messages={messages} messageEvent={bus.current} />

        <div
          id="chat-input"
          className={
            (textboxSelected ? "selected" : "") +
            (textboxAvailable ? "" : " disabled")
          }
        >
          <textarea
            ref={textboxRef}
            disabled={!textboxAvailable}
            placeholder="Message Polybrain"
            value={textboxContent}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                addUserMessage();
              }
            }}
            onChange={(ev) => {
              setTextboxContent(ev.target.value.replace("\n", ""));
            }}
            onFocus={() => {
              setTextboxSelected(true);
            }}
            onBlur={() => {
              setTextboxSelected(false);
            }}
            rows={1}
          />

          <button
            id="chat-input-send"
            disabled={!textboxAvailable}
            onClick={addUserMessage}
          >
            <i className="bi bi-send"></i>
          </button>
        </div>
      </div>
    </>
  );
}
