/** First names for randomly placed home-page background shapes. */
export const HOME_PAGE_MOCK_CREATOR_NAMES = [
  "Amelie",
  "Jordan",
  "Riley",
  "Sam",
  "Alex",
  "Morgan",
  "Casey",
  "Drew",
  "Kai",
  "Noah",
  "Sage",
  "Quinn",
  "Avery",
  "Blair",
  "Cameron",
  "Devon",
  "Ellis",
  "Finley",
  "Harper",
  "Jesse",
  "Luna",
  "Nico",
  "Parker",
  "Reese",
  "Taylor",
  "Wren",
  "Yuki",
  "Zara",
  "Iris",
  "Marco",
  "Ada",
  "Leo",
  "Maya",
  "Oscar",
  "Priya",
  "Remy",
  "Sasha",
  "Theo",
  "Vera",
] as const;

export function pickUniqueCreatorNames(
  count: number,
  random: () => number,
  reservedNames: readonly string[] = [],
) {
  const reserved = new Set(reservedNames);
  const available = HOME_PAGE_MOCK_CREATOR_NAMES.filter(
    (name) => !reserved.has(name),
  );

  for (let index = available.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [available[index], available[swapIndex]] = [
      available[swapIndex]!,
      available[index]!,
    ];
  }

  return available.slice(0, count);
}
