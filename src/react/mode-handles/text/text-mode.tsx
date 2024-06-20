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
  const chatWindow = useRef<HTMLDivElement>(null);
  
  const [value, setValue] = useState("");
  const [textboxSelected, setTextboxSelected] = useState(false);
  const [textboxAvailable, setTextboxAvailable] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]); // fix because react is weird


  
  function appendMessage(msg: Message) {
    messagesRef.current.push(msg);
    setMessages(messagesRef.current);
  }
  
  const bus = useRef<null| EventEmitter>(null);

  useEffect(()=>{
    bus.current = new EventEmitter();
    console.log("refreshing?")
  },[])


  function addUserMessage() {
    if (value.trim() === "") {
      return;
    }

    const newMessage: Message = {
      name: "You", // todo: get name from api
      content: value,
      imageRef: userIcon,
    };
    const messageContent = value;
    
    appendMessage(newMessage);
    setValue("");
    
    bus.current?.emit("messageSent", messageContent); // Pass the message content with the event
    console.log(`User added message: ${value}`)

  }

  async function waitForMessage(): Promise<string>{
    setTextboxAvailable(true);
    console.log("waiting for message")
    const messageContent: string = await new Promise(resolve => bus.current?.once('messageSent', resolve));

    setTextboxAvailable(false);
    return messageContent
  }

  async function beginChain(){

    addServerMessage("Hello! How can I help you?")

    const initialPrompt = await waitForMessage()

    async function getUserInput(prompt: string): Promise<string> {
      addServerMessage(prompt);
      return waitForMessage()
    }
  
    async function onModelInfo(info: string): Promise<void> {
      console.log(`incoming model info: ${info}`);
      addServerMessage(info);
    }
  
    async function onModelFinal(message: string): Promise<void> {
      console.log(`chain finished with message: ${message}`);
      addServerMessage(message);
    }

    await websocketListen(
      initialPrompt,
      getUserInput,
      onModelInfo,
      onModelFinal
    );
  }

  useEffect(()=>{
    beginChain()
  },[])

  useEffect(() => {
    if (textareaRef.current !== null) {
      // Temporarily set the height to 'auto' to allow shrinking
      textareaRef.current.style.height = "auto";
      // Set the height to the scrollHeight
      var desiredHeight = textareaRef.current.scrollHeight;
      if (desiredHeight < 22) {
        desiredHeight = 22;
      }
      textareaRef.current.style.height = `${desiredHeight}px`;
    }
  }, [value]);

  function addServerMessage(message: string) {
    const serverMessage: Message = {
      name: "Polybrain",
      content: message,
      imageRef: logoCircle
    }
    appendMessage(serverMessage);

    console.log(`Added server message: ${message}`);

  }

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

        <MessageDisplay messages={messages} />

        <div id="chat-input" className={(textboxSelected ? "selected" : "") + (textboxAvailable ? "" : " disabled")}>

          <textarea
            ref={textareaRef}
            disabled={!textboxAvailable}
            placeholder="Message Polybrain"
            value={value}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                addUserMessage();
              }
            }}
            onChange={(ev) => {
              setValue(ev.target.value.replace("\n", ""));
            }}
            onFocus={() => {
              setTextboxSelected(true);
            }}
            onBlur={() => {
              setTextboxSelected(false);
            }}
            rows={1}
          />

          <button id="chat-input-send" disabled={!textboxAvailable} onClick={addUserMessage}>
            <i className="bi bi-send"></i>
          </button>
        </div>
      </div>
    </>
  );
}
