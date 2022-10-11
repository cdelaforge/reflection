const ALPH = "ABCDEFGH__IJKLMNOP__QRSTUVWX__YZabcdef__ghijklmn__opqrstuv__wxyz0123__456789+-";

export class SeedHelper {
  private EncodeRow(row: number[]) {
    const oddList = row.filter((n, i) => i & 1);
    const evenList = row.filter((n, i) => !(i & 1));

    return evenList.map((e, i) => {
      const o = oddList[i] || 0;
      const v = e * 10 + o;
      return ALPH.charAt(v);
    }).join('');
  }

  private DecodeRow(encodedRow: string, gridSize: number) {
    const row = [];

    for (let i = 0; i < encodedRow.length; i++) {
      const c = encodedRow[i];
      const val = ALPH.indexOf(c);
      const o = val % 10;
      const e = (val - o) / 10;
      row.push(e);
      row.push(o);
    }

    return row.slice(0, gridSize);
  }

  public Encode(grid: number[][]) {
    return grid.map(r => this.EncodeRow(r)).join('');
  }

  public Decode(encoded: string) {
    const gridSize = Math.floor(Math.sqrt(encoded.length * 2));

    const rowLength = Math.ceil(gridSize / 2);
    const grid = [];

    for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
      const start = rowIndex * rowLength;
      const encodedRow = encoded.substring(start, start + rowLength);
      grid.push(this.DecodeRow(encodedRow, gridSize));
    }

    return grid;
  }
}