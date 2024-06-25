import React, { useEffect, useRef } from "react";
import { startConversation } from "../../../api/conversation";
import { micIcon, speakerIcon, loadingAnim } from "../../../misc/assets";
import { play_audio } from "../../../api/util";
import { websocketListen } from "../../../api/websocket";

export default function VoiceMode(props: {
  enabled: boolean;
  setIcon: (icon: string) => Promise<void>;
  onReturn: () => void;
}) {
  const isEnabled = useRef(false);

  /**
   * Speaks a message. Updates icon when audio starts playing.
   * @param message The message to speak
   */
  async function speak(message: string) {
    await play_audio(message, async () => {
      await props.setIcon(speakerIcon);
    });
  }

  /**
   * Prompts the user to input a value
   * @param prompt The prompt to speak to the user
   * @returns The value that the user responded with
   */
  async function getUserInput(prompt: string): Promise<string> {
    await speak(prompt);
    await props.setIcon(micIcon);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await props.setIcon(loadingAnim);
    return "temp";
  }

  /**
   * Speaks an intermediate info message from the model
   * @param info The info message from the model
   */
  async function onModelInfo(info: string): Promise<void> {
    console.log(`incoming model info: ${info}`);
    await speak(info);
    await props.setIcon(loadingAnim);
  }

  /**
   * Called when the chain finishes.
   * @param message The final message from the model
   */
  async function onModelFinal(message: string): Promise<void> {
    console.log(`chain finished with message: ${message}`);
    await speak(message);
    props.onReturn();
  }

  /**
   * Starts the conversation chain over websocket
   */
  async function beginChain() {
    await props.setIcon(loadingAnim);
    const initialPrompt = await getUserInput("Hello! How can I help you?");

    await websocketListen(
      initialPrompt,
      getUserInput,
      onModelInfo,
      onModelFinal,
    );
  }

  useEffect(() => {
    if (props.enabled){
      console.log("beginning voice chain")
      beginChain();
    }
  }, [props.enabled]);

  useEffect(() => {
    if (props.enabled !== isEnabled.current) {
      isEnabled.current = props.enabled;
    }
  });

  return <></>;
}
