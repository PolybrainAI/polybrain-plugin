export interface UserInfo {
  created_at: string;
  email: string;
  name: string;
  nickname: string;
  user_id: string;
  username: string;
  last_ip: string;
  last_login: string;
}

export interface SessionStartRequest {
  user_token: string;
  onshape_document_id: string;
}

export interface SessionStartResponse {
  session_id: string;
}

export interface UserPromptInitial {
  contents: string;
}
export interface UserInputResponse {
  response: string;
}
export interface ServerResponse {
  response_type: string;
  content: string;
}

export interface ApiCredentials {
  openai_token: string;
  onshape_access_key: string;
  onshape_secret_key: string;
}
