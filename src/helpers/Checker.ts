import { LaserDimension, LaserPosition, LaserProps, LaserType } from "../models/Laser";

export class Checker {
  private _won: boolean;

  constructor() {
    this._won = false;
  }

  public get won() {
    return this._won;
  }

  public checkGrid(grid: number[][], toSolve: string[][]) {
    this._won = true;

    return toSolve.map((cells, position) => {
      return cells.map((cellVal, index) => {
        const traveller = new Traveller(grid, position, index, false);
        while (traveller.walk());
        const exitValue = traveller.getExitValue();
        this._won = this._won && exitValue === cellVal;
        return exitValue;
      });
    });
  }

  public getLaserElements(grid: number[][], position: number, index: number) {
    const traveller = new Traveller(grid, position, index, true);
    while (traveller.walk());
    return traveller.getLaserElements();
  }
}

// top, right, bottom, left

const transDirectionMatrice = [
  [0, 1, 2, 3],     // vide
  [1, 0, 3, 2],     // slash
  [3, 2, 1, 0],     // backslash
  [0, 3, 2, 1],     // miroir vertical
  [2, 1, 0, 3],     // miroir horizontal
  [2, 3, 0, 1],     // miroir carré
  [-1, -1, -1, -1], // trou noir
  [0, 1, 2, 3],     // portail
]
const incRow = [-1, 0, 1, 0];
const incCol = [0, 1, 0, -1];

const laserPropsMatrice = [
  [
    [{ type: LaserType.vertical, dimension: LaserDimension.big }],
    [{ type: LaserType.horizontal, dimension: LaserDimension.big }],
    [{ type: LaserType.vertical, dimension: LaserDimension.big }],
    [{ type: LaserType.horizontal, dimension: LaserDimension.big }],
  ],
  [
    [
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.bottom },
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.right },
    ],
    [
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.left },
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.top },
    ],
    [
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.top },
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.left },
    ],
    [
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.right },
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.bottom },
    ],
  ],
  [
    [
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.bottom },
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.left },
    ],
    [
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.left },
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.bottom },
    ],
    [
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.top },
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.right },
    ],
    [
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.right },
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.top },
    ],
  ],
  [
    [{ type: LaserType.vertical, dimension: LaserDimension.big }],
    [{ type: LaserType.horizontal, dimension: LaserDimension.short, position: LaserPosition.left }],
    [{ type: LaserType.vertical, dimension: LaserDimension.big }],
    [{ type: LaserType.horizontal, dimension: LaserDimension.short, position: LaserPosition.right }],
  ],
  [
    [{ type: LaserType.vertical, dimension: LaserDimension.short, position: LaserPosition.bottom }],
    [{ type: LaserType.horizontal, dimension: LaserDimension.big }],
    [{ type: LaserType.vertical, dimension: LaserDimension.short, position: LaserPosition.top }],
    [{ type: LaserType.horizontal, dimension: LaserDimension.big }],
  ],
  [
    [{ type: LaserType.vertical, dimension: LaserDimension.short, position: LaserPosition.bottom }],
    [{ type: LaserType.horizontal, dimension: LaserDimension.short, position: LaserPosition.left }],
    [{ type: LaserType.vertical, dimension: LaserDimension.short, position: LaserPosition.top }],
    [{ type: LaserType.horizontal, dimension: LaserDimension.short, position: LaserPosition.right }],
  ],
  [
    [{ type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.bottom }],
    [{ type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.left }],
    [{ type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.top }],
    [{ type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.right }],
  ],
  [
    [
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.bottom },
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.top }
    ],
    [
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.left },
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.right }
    ],
    [
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.top },
      { type: LaserType.vertical, dimension: LaserDimension.medium, position: LaserPosition.bottom }
    ],
    [
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.right },
      { type: LaserType.horizontal, dimension: LaserDimension.medium, position: LaserPosition.left }
    ],
  ],
];

//const directions = ["top", "right", "bottom", "left"];

class Traveller {
  private grid: number[][];
  private row: number;
  private col: number;
  private direction: number;
  private gridSize: number;
  private distance: number = 1;
  private exitSide: number = -1;
  private exitIndex: number = -1;
  private entrySide: number;
  private entryIndex: number;
  private displayLaser: boolean;
  private laserElements: LaserProps[];

  constructor(grid: number[][], position: number, index: number, displayLaser: boolean) {
    this.grid = grid;
    this.gridSize = grid[0].length;
    this.entrySide = position;
    this.entryIndex = index;
    this.displayLaser = displayLaser;
    this.laserElements = [];

    switch (position) {
      case 0:
        this.row = 0;
        this.col = index;
        this.direction = 2;
        break;
      case 1:
        this.row = index;
        this.col = this.gridSize - 1;
        this.direction = 3;
        break;
      case 2:
        this.row = this.gridSize - 1;
        this.col = index;
        this.direction = 0;
        break;
      case 3:
      default:
        this.row = index;
        this.col = 0;
        this.direction = 1;
        break;
    }
  }

  public getLaserElements() {
    return this.laserElements;
  }

  public addLaserElement(nextPos: number[] | null) {
    if (this.displayLaser) {
      const eltType = this.grid[this.row][this.col];
      const elts = laserPropsMatrice[eltType][this.direction];

      if (eltType !== 7) {
        this.laserElements = [...this.laserElements, ...elts.map((elt) => ({ ...elt, row: this.row, col: this.col }))];
      } else {
        this.laserElements = [...this.laserElements, { ...elts[0], row: this.row, col: this.col }];

        if (nextPos) {
          this.laserElements = [...this.laserElements, { ...elts[1], row: nextPos[0], col: nextPos[1] }];
        }
      }
    }
  }

  public getExitValue() {
    if (this.exitSide === -1) {
      return `${this.distance}a`;
    }

    if (this.exitSide === this.entrySide && this.exitIndex === this.entryIndex) {
      return `${this.distance}r`;
    }

    return `${this.distance}s`;
  }

  searchPortal() {
    if (this.grid[this.row][this.col] === 7) {
      for (let r = 0; r < this.gridSize; r++) {
        for (let c = 0; c < this.gridSize; c++) {
          if ((r !== this.row || c !== this.col) && this.grid[r][c] === 7) {
            return [r, c];
          }
        }
      }
    }

    return null;
  }

  walk() {
    const eltType = this.grid[this.row][this.col];
    const newPortalPos = this.searchPortal();
    this.addLaserElement(newPortalPos);
    this.direction = transDirectionMatrice[eltType][this.direction];

    if (eltType === 7) {
      // portal, search the other portal
      if (newPortalPos) {
        [this.row, this.col] = newPortalPos;
        this.distance++;
      } else {
        this.direction = -1;
      }
    }
    if (this.direction >= 0) {
      this.row += incRow[this.direction];
      this.col += incCol[this.direction];
    }

    if (this.destinationReach()) {
      return false;
    }

    this.distance++;
    return true;
  }

  destinationReach() {
    if (this.direction === -1) {
      this.exitSide = -1;
      this.exitIndex = -1;
      return true;
    }

    if (this.row < 0) {
      this.exitSide = 0;
      this.exitIndex = this.col;
      return true;
    }

    if (this.row >= this.gridSize) {
      this.exitSide = 2;
      this.exitIndex = this.col;
      return true;
    }

    if (this.col < 0) {
      this.exitSide = 3;
      this.exitIndex = this.row;
      return true;
    }

    if (this.col >= this.gridSize) {
      this.exitSide = 1;
      this.exitIndex = this.row;
      return true;
    }

    return false;
  }

}
