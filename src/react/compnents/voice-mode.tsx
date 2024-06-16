import React, { useEffect, useRef } from "react";
import { startConversation } from "../../api/conversation";
import { micIcon } from "../../misc/assets";


export default function VoiceMode(props: {enabled: boolean, setIcon: (icon: string) => void, onReturn: () => void}){

    const isEnabled = useRef(false);


    // Start the vocal conversation chain
    function startChain(){

        startConversation(
            ()=>{},
            (_)=>{},
            (_)=>"wip",
        )

        props.setIcon(micIcon)
    }


    useEffect(()=> {

        if (props.enabled !== isEnabled.current){
            console.log("Setting voice state to:" + (props.enabled ? "enabled" : "disabled"))
            isEnabled.current = props.enabled

            if (props.enabled){
                startChain()
            }

        }

    })




    return <></>
}