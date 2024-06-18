/**
 * Gets the polybrain-session cookie from the browser
 * @returns The value of the cookie
 */
import EventEmitter from "events";
import { UserInfo } from "./types";

export async function getCookie(): Promise<string | null> {

    const bus = new EventEmitter();
    var token: string|null = null;

    chrome.cookies.get({ url: 'https://polybrain.xyz', name: 'polybrain-session' },
        function (cookie) {
          if (cookie) {
            console.log(cookie.value);
            token = cookie.value;
            bus.emit("resolved");
        }
        else {
            console.log('Can\'t get cookie! Check the name!');
            token = "nada";
            bus.emit("resolved");
          }
      });

    await new Promise(resolve => bus.once('resolved', resolve));

    return token;
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
        return await user_response.json() as UserInfo;
    }
    }
  }