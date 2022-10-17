export interface StockCellData {
  index: number;
  val: number;
  displayedVal: number;
}

export const compareData = (d1: StockCellData, d2: StockCellData) => {
  if (d1.displayedVal === d2.displayedVal) {
    return 0;
  }

  // put black hole in last position
  if (d1.displayedVal === 6) {
    return 1;
  }
  if (d2.displayedVal === 6) {
    return -1;
  }

  return d1.displayedVal < d2.displayedVal ? -1 : 1;
}