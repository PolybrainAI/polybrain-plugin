import React, { useEffect, useState } from "react";
import EventEmitter from "events";

import { Message } from "./text-mode";

export default function MessageDisplay(props: { messages: Array<Message>, messageEvent: EventEmitter}) {

  function buildMessageElement(message: Message) {
    return (
      <div className="message-container">
        <div>
          <img src={message.imageRef} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingLeft: "12px",
          }}
        >
          <h3>{message.name}</h3>
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  const [messageElements, setMessageElements] = useState<
    React.JSX.Element[] | null
  >(null);
  
  // listen for new messages
  useEffect(()=>{
    const messages: Message[] = []
    props.messageEvent.on("new", (msg)=>{ 
      messages.push(msg)
      setMessageElements(
        messages.map((message) => buildMessageElement(message)),
      );
      setTimeout(()=>{scrollToNewest()},100)      
    })
  },[])
  
  function scrollToNewest() {
    const msgDisplay = document.getElementById("chat-message-display");
    if (msgDisplay) {
      msgDisplay.scrollTop = msgDisplay.scrollHeight;
    }
  }

  return <div id="chat-message-display">{messageElements}</div>;
}
