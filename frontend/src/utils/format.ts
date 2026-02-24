export const formatPrice = (kopecks: number): string =>
  (kopecks / 100).toLocaleString("ru-RU", { maximumFractionDigits: 0 });

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
