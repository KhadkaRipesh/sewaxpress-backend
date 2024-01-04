export interface PaginateResponse {
  prevPage: number | null;
  currentpage: number | null;
  nextPage: number | null;
  lastPage: number;
  totaCount: number;
  result: any[];
}
export const paginateResponse = (
  data: any,
  page: number,
  limit: number,
): PaginateResponse => {
  const [result, total] = data;
  const lastPage = Math.ceil(total / limit);
  const nextPage = page < lastPage ? +page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;
  return {
    totaCount: total,
    prevPage,
    currentpage: +page,
    nextPage,
    lastPage,
    result,
  };
};
