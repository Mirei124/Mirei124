import dayjs from "dayjs";

export function formatDate(date) {
  return dayjs(date).format("YYYY-MM-DD");
}

export function formatWordCount(contentLength) {
  return `${contentLength} 字`;
}

export function formatReadTime(contentLength) {
  const readtime = Math.max(1, parseInt(contentLength / 300));
  return `${readtime} 分钟`;
}

export function calcDescription(blog) {
  return blog.data.description
    ? blog.data.description
    : blog.body.substring(0, 120) + "...";
}
