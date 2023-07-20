export interface IQuery {
  page: string;
  limit: string;
  sortedBy: string;

  [key: string]: string;
}
export interface IPaginationResponse<T> {
  page: number;
  perPage: number;
  itemsCount: number;
  itemsFound: number;
  data: T[];
}
