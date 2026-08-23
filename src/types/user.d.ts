declare interface IUserBE {
  id: string;
  name: string;
  email: string;
  picture: string;
  createdAt: Date;
}

declare interface IUserFE {
  id: string;
  name: string;
  email: string;
  picture: string;
  createdAt: number;
}
