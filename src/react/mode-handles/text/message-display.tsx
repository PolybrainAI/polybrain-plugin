import React, { useEffect } from "react";

import { Message } from "./text-mode";

export default function MessageDisplay(props: {messages: Array<Message>}){

    
    function buildMessageElement(message: Message){
        return <div className="message-container">

            <div>
                <img src={message.imageRef}/>
            </div>
            <div style={{display: "flex", flexDirection: "column", flex: 1, paddingLeft: "12px"}}> 
                <h3>{message.name}</h3>
                <p>{message.content}</p>
            </div>
        </div>
    }
    
    const messageElements = props.messages.map(message => buildMessageElement(message));

    useEffect(()=>{
        var msgDisplay = document.getElementById('chat-message-display');
        if (msgDisplay){
            msgDisplay.scrollTop = msgDisplay.scrollHeight;
        }
    }, [props.messages])
    
    return <div id="chat-message-display">

        {messageElements}
        
    </div>

}