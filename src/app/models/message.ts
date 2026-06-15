export interface Message {

  id: number;
  message: string;
  read: boolean;
  type: string;
  userId: number;
  relatedId?: number;
  username: string;
  senderUsername?: string;
  date?: string;

}
