export const randomInt = (maxExclusive: number): number => {
  if (maxExclusive <= 0) {
    return 0;
  }

  return Math.floor(Math.random() * maxExclusive);
};

export const pickRandom = <T>(items: T[]): T | null => {
  if (items.length === 0) {
    return null;
  }

  return items[randomInt(items.length)];
};
