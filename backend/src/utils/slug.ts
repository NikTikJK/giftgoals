import { nanoid } from "nanoid";

export const generateSlug = (title: string): string => {
  const base = title
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, "")
    .trim()
    .replace(/[\s]+/g, "-")
    .slice(0, 40);

  const suffix = nanoid(8);
  return base ? `${base}-${suffix}` : suffix;
};
