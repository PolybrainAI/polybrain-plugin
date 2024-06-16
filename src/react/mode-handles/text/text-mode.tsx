import React, { useEffect, useRef, useState } from "react";
import { logoCircle, userIcon } from "../../../misc/assets";
import MessageDisplay from "./message-display";

export interface Message{
    name: string 
    content: string 
    imageRef: string
}


export default function TextMode(props: {enabled: boolean, setIcon: (icon: string) => void, onReturn: () => void}){
    
    const chatWindow = useRef<HTMLDivElement>(null);

    const [value, setValue] = useState('');
    const [textboxSelected, setTextboxSelected] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    function appendMessage(msg: Message){
        setMessages([...messages, msg])
    }

    useEffect(() => {
        if (textareaRef.current !== null) {
          // Temporarily set the height to 'auto' to allow shrinking
          textareaRef.current.style.height = 'auto';
          // Set the height to the scrollHeight
          var desiredHeight = textareaRef.current.scrollHeight;
          if (desiredHeight < 22){
            desiredHeight = 22;
          }
          textareaRef.current.style.height = `${desiredHeight}px`;
        }
      }, [value]);


    function addNewMessage(){

        if (value.trim() === ""){
            return
        }

        const newMessage: Message = {
            name: "You", // todo: get name from api
            content: value,
            imageRef: userIcon,
        }

        appendMessage(newMessage)
        setValue("")

    }
    
    
    return <>
    
        <div id="chat-window" style={{display: props.enabled ? "flex" : "none"}} ref={chatWindow}>
            <div id="chat-header">
                <img className="logo" src={logoCircle}></img>
                <h2 className="logo-font">Polybrain</h2>

                {/* <button className="chat-header-btn min"><i className="bi bi-dash"></i></button> */}
                <button className="chat-header-btn exit" onClick={props.onReturn}><i className="bi bi-x"></i></button>
            </div>

            <MessageDisplay messages={messages} />

            <div id="chat-input" className={textboxSelected ? "selected" : ""}>
                {/* <input type="text" value={messageInputText} placeholder="Message Polybrain" onChange={(ev) => {setMessageInputText(ev.target.value)}} /> */}


                <textarea
                    ref={textareaRef}
                    placeholder="Message Polybrain"
                    value={value}
                    onKeyDown ={(ev) => {
                        if (ev.key === "Enter"){
                            addNewMessage();
                        }
                    }}

                    onChange={(ev)=>{setValue(ev.target.value.replace("\n", ""));}}
                    
                    onFocus={()=>{
                        console.log("focused!!! s3")
                        setTextboxSelected(true)
                        }
                    }

                    onBlur={()=>{
                        console.log("unfocused")
                        setTextboxSelected(false)
                    }}

                    rows={1}
                    />

                <button id="chat-input-send" onClick={addNewMessage}><i className="bi bi-send"></i></button>
            </div>

            

        </div>
    
    </>
}