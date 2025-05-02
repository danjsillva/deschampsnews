export interface IPost {
  _id?: string;
  date: string;
  number: string;
  text: string;
  html: string;
  categories: string[];
  entities: string[];
  sponsored: boolean;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}
