/**
 * Gets the polybrain-session cookie from the browser
 * @returns The value of the cookie
 */
import EventEmitter from "events";
import { UserInfo } from "./types";
import { startRecord, stopRecord } from "../misc/assets";

const API_BASE = "http://127.0.0.1:8000";
window.polybrainCookie = null;

/**
 * Fetches the polybrain cookie from the background process
 * @returns The polybrain.xyz cookie
 */
export async function getCookie(): Promise<string | null> {
  if (window.polybrainCookie === null) {
    const bus = new EventEmitter();
    let token: string | null = null;

    chrome.runtime.sendMessage(
      { action: "fetchCookie", cookieName: "polybrain-session" },
      (response) => {
        if (response.status === "success") {
          token = response.token;
          bus.emit("resolved");
        } else {
          token = response.token;
          bus.emit("resolved");
        }
      },
    );

    await new Promise((resolve) => bus.once("resolved", resolve));
    window.polybrainCookie = token;
    return token;
  } else {
    return window.polybrainCookie;
  }
}

/**
 * Gets the info about a logged in user. Caches response in window.user_info
 * @returns a UserInfo object, or null if the user is not logged in
 */
export async function getUserInfo(): Promise<UserInfo | null> {
  const jwt = await getCookie();

  if (jwt == null) {
    console.debug("no JWT found");
    return null;
  } else {
    const user_response = await fetch(`https://polybrain.xyz/auth0/user-data`, {
      method: "GET",
      credentials: "include",
    });

    if (user_response.status === 403) {
      console.debug("user is not logged in");
      return null;
    } else {
      return (await user_response.json()) as UserInfo;
    }
  }
}

export function extractDocumentId() {
  const url = window.location.href;
  const regex = /documents\/([a-f0-9]{24})/;
  const match = url.match(regex);
  if (match) {
    return match[1];
  } else {
    console.debug(`Unable to extract document id from the url ${url}`);
    return null;
  }
}

export async function tts(
  message: string,
  onSpeakingStart: () => Promise<void>,
) {
  const cookie = await getCookie();

  const response = await fetch(`${API_BASE}/api/audio/speak`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      Authorization: `Bearer ${cookie}`,
    },
    body: JSON.stringify({
      text: message,
    }),
  });

  if (!response.ok) {
    throw new Error("API speech response was not ok " + response.statusText);
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);
  await onSpeakingStart();
  audio.play();
  await new Promise((resolve) => setTimeout(resolve, audio.duration * 1000));
}

export function playSound(audioFile: string) {
  const audio = new Audio(audioFile);
  audio.play();
}

const SpeechRecognition = webkitSpeechRecognition;
export async function recordAudio(
  onRecordStart: () => void,
  waitForStop: () => Promise<void>,
): Promise<string | null> {
  if (!SpeechRecognition) {
    throw new Error("Speech Recognition API is not supported in this browser.");
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  onRecordStart();
  playSound(startRecord);

  let transcript: string | null = null;

  recognition.onresult = (event) => {
    console.log(event);
    transcript = transcript ? transcript : "";
    transcript += event.results[event.results.length - 1][0].transcript;
  };

  recognition.onerror = (event) => {
    console.error(`error occurred in recognition: ${event.error}`);
  };

  await waitForStop();
  recognition.stop();
  playSound(stopRecord);

  if (!transcript) {
    // wait a moment for transcript to come in, otherwise abort
    transcript = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 2000);

      recognition.onresult = (event) => {
        resolve(event.results[0][0].transcript);
      };
    });
  }

  if (!transcript) {
    console.error("no audio");
  }
  return transcript;
}
