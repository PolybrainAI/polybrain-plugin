import React, { useEffect, useState } from "react";

import { Message } from "./text-mode";

export default function MessageDisplay(props: { messages: Array<Message> }) {
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

  function scrollToNewest() {
    var msgDisplay = document.getElementById("chat-message-display");
    if (msgDisplay) {
      msgDisplay.scrollTop = msgDisplay.scrollHeight;
    }
  }

  useEffect(() => {
    setMessageElements(
      props.messages.map((message) => buildMessageElement(message)),
    );
    scrollToNewest();
  });

  useEffect(() => {
    scrollToNewest();
  }, [props.messages]);

  return <div id="chat-message-display">{messageElements}</div>;
}
