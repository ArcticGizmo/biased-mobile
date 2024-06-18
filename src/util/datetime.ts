const padNumber = (num: number) => `${num}`.padStart(2, '0');

export const getDateTimeFileName = (date: Date) => {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const dateNum = padNumber(date.getDate());
  const hour = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());
  const seconds = padNumber(date.getSeconds());
  return `${year}-${month}-${dateNum}-${hour}-${minutes}-${seconds}`;
};
