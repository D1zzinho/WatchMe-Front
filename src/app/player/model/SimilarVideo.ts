import {CommentDto} from '../../models/CommentDto';

export interface SimilarVideo {
  _id: string;
  title: string;
  desc: string;
  tags: Array<string>;
  comments: Array<CommentDto>;
  path: string;
  thumb: string;
  cover: string;
  visits: number;
  stat: number;
  author: string;
  authorAvatar: string;
  uploadDate: Date;
  loaded: boolean;
  matchingTags: number;
}
