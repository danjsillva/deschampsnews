import { ObjectId } from "mongodb";

export interface IPost {
  _id?: ObjectId;
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
