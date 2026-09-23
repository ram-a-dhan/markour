declare interface IFetchRes<T, M = never> {
  data: T;
  meta: M;
}

declare interface IFetchErr<D = unknown> {
  status: number;
  message: string;
  code?: string;
  details?: D;
}
