const rotations = [0, -90, 90, 180];

const rotationsMatrice = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  [0, 2, 1, 4, 3, 5, 6, 7, 10, 11, 9, 8],
  [0, 2, 1, 4, 3, 5, 6, 7, 11, 10, 8, 9],
  [0, 1, 2, 3, 4, 5, 6, 7, 9, 8, 11, 10],
];

const flipsMatrice = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  [0, 2, 1, 3, 4, 5, 6, 7, 10, 11, 8, 9],
  [0, 2, 1, 3, 4, 5, 6, 7, 12, 10, 9, 8],
  [0, 1, 2, 3, 4, 5, 6, 7, 9, 8, 11, 10],
];

export class Transformations {
  private rotate: number;
  private flip: number;

  constructor(transfo: number) {
    this.rotate = transfo % 10;
    this.flip = (transfo - this.rotate) / 10;
  }

  public getTransform() {
    const result: string[] = [];

    if (this.rotate) {
      result.push(`rotate(${rotations[this.rotate]}deg)`);
    }

    if (this.flip === 1) {
      result.push("scaleX(-1)");
    } else if (this.flip === 2) {
      result.push("scaleY(-1)");
    } else if (this.flip === 3) {
      result.push("scaleX(-1) scaleY(-1)");
    }

    return result.join(' ');
  };

  public getReverseTransform() {
    const result: string[] = [];

    if (this.flip === 1) {
      result.push("scaleX(-1)");
    } else if (this.flip === 2) {
      result.push("scaleY(-1)");
    } else if (this.flip === 3) {
      result.push("scaleX(-1) scaleY(-1)");
    }

    if (this.rotate) {
      result.push(`rotate(${-rotations[this.rotate]}deg)`);
    }

    return result.join(' ');
  };

  public getDisplayedIcon(icon: number) {
    return rotationsMatrice[this.rotate][flipsMatrice[this.flip][icon]];
  }
}