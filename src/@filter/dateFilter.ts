import { FilterByDateType } from 'src/book/dto/book.dto';

function applyCustomDateFilter(query, filter, table, column) {
  return query
    .andWhere(`${table}.${column} >= :start_date`, {
      start_date: filter.start_date,
    })
    .andWhere(`${table}.${column} <= :end_date`, { end_date: filter.end_date });
}

function applyTodayFilter(query, table, column) {
  return query.andWhere(`${table}.${column} >= :today`, {
    today: new Date().toISOString().slice(0, 10),
  });
}

function applyYesterdayFilter(query, table, column) {
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    .toISOString()
    .slice(0, 10);
  return query.andWhere(`${table}.${column} >= :yesterday`, { yesterday });
}

function applyLast7DaysFilter(query, table, column) {
  const last_7_days = new Date(new Date().setDate(new Date().getDate() - 7))
    .toISOString()
    .slice(0, 10);
  return query.andWhere(`${table}.${column} >= :last_7_days`, { last_7_days });
}

function applyLast30DaysFilter(query, table, column) {
  const last_30_days = new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .slice(0, 10);
  return query.andWhere(`${table}.${column} >= :last_30_days`, {
    last_30_days,
  });
}

export function applyDateFilter(query, filter, table, column) {
  switch (filter.date) {
    case FilterByDateType.CUSTOM:
      return applyCustomDateFilter(query, filter, table, column);
    case FilterByDateType.TODAY:
      return applyTodayFilter(query, table, column);
    case FilterByDateType.YESTERDAY:
      return applyYesterdayFilter(query, table, column);
    case FilterByDateType.LAST_7_DAYS:
      return applyLast7DaysFilter(query, table, column);
    case FilterByDateType.LAST_30_DAYS:
      return applyLast30DaysFilter(query, table, column);
    default:
      return query;
  }
}
