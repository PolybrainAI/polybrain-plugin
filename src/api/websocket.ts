

import EventEmitter from "events";
import { ServerResponse, SessionStartRequest, SessionStartResponse, UserInputResponse, UserPromptInitial } from "./types";
import { extractDocumentId, getCookie } from "./util";

const bus = new EventEmitter();

async function waitForMessage<T>(socket: WebSocket): Promise<T>{
    var payload: T|null = null

    while (payload === null){
        socket.addEventListener("message", (event) => {
            payload = JSON.parse(event.data)
            bus.emit("recv");
          });
    
        await new Promise(resolve => bus.once('recv', resolve));
    
    }

    console.log("Incoming ws message:");
    console.log(payload);

    return payload
}


async function sendMessage<T>(socket: WebSocket, payload: T) {
    socket.send(JSON.stringify(payload))
}


export async function websocketListen(
    initialPrompt: string,
    getUserInput: (prompt: string) => Promise<string>,
    onModelInfo: (message: string) => Promise<void>,
    onModelFinal: (message: string) => Promise<void>,
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

    // ensure socket closes on close
    window.addEventListener("beforeunload", ()=>{
        socket.close()
    })

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

    // send initial prompt
    const intialPromptMessage: UserPromptInitial = {
        contents: initialPrompt
    };
    await sendMessage(socket, intialPromptMessage);

    // dispatch incoming messages
    while (socket.readyState === socket.OPEN){

        const incoming = await waitForMessage<ServerResponse>(socket);

        switch (incoming.response_type) {
            case "Query":
                const user_input = await getUserInput(incoming.content);
                const response: UserInputResponse = {
                    response: user_input
                } 
                await sendMessage(socket, response);
                break;
            case "Info":
                await onModelInfo(incoming.content);
                break;
            case "Final":
                await onModelFinal(incoming.content);
                socket.close();
                break;       
            default:
                console.error(`Illegal ws response type "${incoming.response_type}"`);
                break;
        }
    }

    socket.close()


}   