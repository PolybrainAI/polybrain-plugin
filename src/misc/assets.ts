const get = (file: string): string => {
  return chrome.runtime.getURL("assets/" + file);
};

export const baseButton = get("button-plain.svg");
export const logoNoBackground = get("logo-no-background.svg");
export const popupLogo = get("popup-menu.svg");
export const micIcon = get("mic-icon.svg");
export const logoCircle = "https://polybrain.b-cdn.net/logo-circle.svg";
export const userIcon =
  "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
