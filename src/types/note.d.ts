declare interface INoteBE {
  id: string;
  userId: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  version: number;
}

declare interface INoteFE {
  id: string;
  userId: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  version: number;
  tagIds: string[];
}
