//PRD #25: the scroll rows are flex-col + flex-wrap with a fixed height, so every item is its own column.
//With fewer than SHORT_ROW items the columns stretch over the whole width and drift apart;
//content-start packs them to the left, next to each other, and nothing overflows so no scroll-x shows.
export const SHORT_ROW = 5

export const shortRow = (items) =>
    Array.isArray(items) && items.length < SHORT_ROW ? " content-start" : ""
