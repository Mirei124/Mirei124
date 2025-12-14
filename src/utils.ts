function range(start: number, stop: number, step: number = 1) {
  if (arguments.length === 1) {
    [start, stop] = [0, start];
  }
  if (step === 0) throw new Error("step must not be zero");

  const len = Math.max(0, Math.ceil((stop - start) / step));
  return Array.from({ length: len }, (_, i) => start + i * step);
}

function dateToString(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year} 年 ${month} 月 ${day} 日`;
}

export { range, dateToString };
