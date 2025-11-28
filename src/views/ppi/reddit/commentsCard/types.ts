// 评论数据类型定义
export interface CommentItem {
  body: string;
  downs: number;
  ups: number;
  id?: string | number;
  sentiment?: string; // 可选的情感分析字段
}

export interface CommentsCardProps {
  list: CommentItem[];
  title?: string;
  maxHeight?: string;
  showStats?: boolean;
}
