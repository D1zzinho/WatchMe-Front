import {CommentAuthor} from './CommentAuthor';

export interface CommentDto {
  _id: string;
  text: string;
  date: Date;
  author: CommentAuthor;
}
