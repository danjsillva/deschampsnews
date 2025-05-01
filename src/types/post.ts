export interface IPost {
  _id?: string;
  date: string;
  number: number;
  text: string;
  html: string;
  categories: string[];
  entities: string[];
  sponsored: boolean;
  likes: number;
}
