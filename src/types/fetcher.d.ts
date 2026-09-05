declare interface IFetchRes<T, M = never> {
  data: T;
  meta: M;
}

declare interface IFetchErr {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}
