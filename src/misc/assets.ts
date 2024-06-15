

const get = (file: string): string => {return chrome.runtime.getURL("assets/" + file)}

export const baseButton = get('button-plain.svg');
export const logoNoBackground = get('logo-no-background.svg')