import EventEmitter from "events";
import {
  ServerResponse,
  SessionStartRequest,
  SessionStartResponse,
  UserInputResponse,
  UserPromptInitial,
} from "./types";
import { extractDocumentId, getCookie } from "./util";

const bus = new EventEmitter();

var message_queue: object[] = [];

async function waitForMessage<T>(socket: WebSocket): Promise<T> {
  var payload: T | null = null;

  if (message_queue.length > 0) {
    const recv = message_queue.pop();
    payload = recv ? (recv as T) : null;
  }

  // if the payload is still null, wait for a new message
  if (payload === null) {
    while (payload === null) {
      await new Promise((resolve) => bus.on("message", resolve));
      const recv = message_queue.pop();
      payload = recv ? (recv as T) : null;
    }
  }

  console.log("Incoming ws message:");
  console.log(payload);

  return payload;
}

async function sendMessage<T>(socket: WebSocket, payload: T) {
  socket.send(JSON.stringify(payload));
}

export async function websocketListen(
  initialPrompt: string,
  getUserInput: (prompt: string) => Promise<string>,
  onModelInfo: (message: string) => Promise<void>,
  onModelFinal: (message: string) => Promise<void>,
) {
  const userCooke = await getCookie();
  const documentId = extractDocumentId();

  if (userCooke === null) {
    console.warn("Cookie is null, skipping websocket connection");
    return;
  }

  if (documentId === null) {
    console.error(
      "Unable to extract document id, stopping websocket connection",
    );
    return;
  }

  console.log("connecting to ws...");
  const socket = new WebSocket("ws://127.0.0.1:6379");

  // ensure socket closes on close
  window.addEventListener("beforeunload", () => {
    socket.close();
  });

  socket.addEventListener("open", (event) => {
    bus.emit("connected");
  });

  await new Promise((resolve) => bus.once("connected", resolve));

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (payload !== null) {
      message_queue.push(payload);
      bus.emit("message");
    }
  });

  console.log("connected to ws");

  const startRequest: SessionStartRequest = {
    user_token: userCooke,
    onshape_document_id: documentId,
  };
  sendMessage(socket, startRequest);

  const startResponse = await waitForMessage<SessionStartResponse>(socket);
  const sessionId = startResponse.session_id;

  // send initial prompt
  const initialPromptMessage: UserPromptInitial = {
    contents: initialPrompt,
  };
  await sendMessage(socket, initialPromptMessage);

  // dispatch incoming messages
  while (socket.readyState === socket.OPEN || message_queue.length > 0) {
    const incoming = await waitForMessage<ServerResponse>(socket);

    switch (incoming.response_type) {
      case "Query":
        const user_input = await getUserInput(incoming.content);
        const response: UserInputResponse = {
          response: user_input,
        };
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

  console.log("closing connection");
  socket.close();
}
