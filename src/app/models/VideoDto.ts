export interface VideoDto {
  _id: string;
  title: string;
  desc: string;
  tags: Array<string>;
  path: string;
  thumb: string;
  cover: string;
  visits: number;
  stat: number;
}
