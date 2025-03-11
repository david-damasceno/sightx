
export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSettings {
  model: "gpt-4" | "gpt-3.5-turbo";
  temperature: number;
  saveHistory: boolean;
  autoAnalysis: boolean;
}
