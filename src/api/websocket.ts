

import EventEmitter from "events";
import { SessionStartRequest, SessionStartResponse } from "./types";
import { extractDocumentId, getCookie } from "./util";

const bus = new EventEmitter();

async function waitForMessage<T>(socket: WebSocket): Promise<T>{
    var payload: any = null

    socket.addEventListener("message", (event) => {
        payload = JSON.parse(event.data)
        bus.emit("recv");
      });

    await new Promise(resolve => bus.once('recv', resolve));

    console.log("Incoming ws message:");
    console.log(payload);

    return payload
}


async function sendMessage<T>(socket: WebSocket, payload: T) {
    socket.send(JSON.stringify(payload))
}


export async function setupCallbacks(
    getUserInput: (prompt: string) => string,
    onModelInfo: (message: string) => void,

){

    const userCooke = await getCookie();
    const documentId = extractDocumentId();

    if (userCooke === null){
        console.warn("Cookie is null, skipping websocket connection")
        return
    }

    if (documentId === null){
        console.error("Unable to extract document id, stopping websocket connection")
        return
    }
    
    console.log("connecting to ws...")
    const socket = new WebSocket("ws://127.0.0.1:6379");

    socket.addEventListener("open", (event) => {
        bus.emit("connected");
      });

    await new Promise(resolve => bus.once('connected', resolve));


    console.log("connected to ws")
    
    

    const startRequest: SessionStartRequest = {
        user_token: userCooke,
        onshape_document_id: documentId
    }
    sendMessage(socket, startRequest);

    const startResponse = await waitForMessage<SessionStartResponse>(socket);
    const sessionId = startResponse.session_id;

    for (;;){

    }


}   