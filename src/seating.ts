export const ROWS = 8;
export const COLUMNS = 10;

export type SeatingMatrix = number[][];
export type AdjacentPair = [[number, number], [number, number]];

// Creates an 8 x 10 matrix filled with 0 (available seats).
export function createSeatingMatrix(rows: number, columns: number): SeatingMatrix {
  return Array.from({ length: rows }, () => Array(columns).fill(0));
}

// Converts matrix values into a readable table with row/column headers.
export function formatMatrixForDisplay(matrix: SeatingMatrix): string {
  const header = `    ${Array.from({ length: COLUMNS }, (_, i) => `${i + 1}`.padStart(2, " ")).join(" ")}`;
  const rows = matrix.map((row, rowIndex) => {
    const seats = row.map((seat) => (seat === 1 ? " X" : " L")).join(" ");
    return `R${String(rowIndex + 1).padStart(2, "0")} ${seats}`;
  });

  return [header, ...rows].join("\n");
}

function isWithinBounds(row: number, column: number): boolean {
  return row >= 0 && row < ROWS && column >= 0 && column < COLUMNS;
}

// Tries to reserve a seat and returns a clear success/failure message.
export function reserveSeat(matrix: SeatingMatrix, row: number, column: number): string {
  if (!isWithinBounds(row, column)) {
    return `Invalid position. Row must be 1-${ROWS} and column must be 1-${COLUMNS}.`;
  }

  if (matrix[row][column] === 1) {
    return `Seat R${row + 1}-C${column + 1} is already occupied.`;
  }

  matrix[row][column] = 1;
  return `Reservation confirmed for seat R${row + 1}-C${column + 1}.`;
}

// Counts occupied and available seats across the room.
export function countSeats(matrix: SeatingMatrix): [number, number] {
  let occupied = 0;
  let available = 0;

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      if (matrix[row][column] === 1) {
        occupied += 1;
      } else {
        available += 1;
      }
    }
  }

  return [occupied, available];
}

// Finds the first pair of horizontal adjacent available seats.
export function findAdjacentAvailableSeats(matrix: SeatingMatrix): AdjacentPair | null {
  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS - 1; column += 1) {
      if (matrix[row][column] === 0 && matrix[row][column + 1] === 0) {
        return [
          [row, column],
          [row, column + 1],
        ];
      }
    }
  }

  return null;
}

export function createScenarioMatrix(scenario: string): SeatingMatrix {
  const matrix = createSeatingMatrix(ROWS, COLUMNS);

  if (scenario === "partial") {
    const partialSeats: Array<[number, number]> = [
      [0, 1],
      [0, 2],
      [1, 4],
      [2, 8],
      [3, 3],
      [4, 5],
      [5, 0],
      [6, 9],
      [7, 6],
    ];
    partialSeats.forEach(([row, column]) => {
      matrix[row][column] = 1;
    });
  }

  if (scenario === "nearly") {
    for (let row = 0; row < ROWS; row += 1) {
      for (let column = 0; column < COLUMNS; column += 1) {
        matrix[row][column] = 1;
      }
    }

    // Leave only scattered singles available (no adjacent pair).
    const availableSingles: Array<[number, number]> = [
      [0, 0],
      [1, 2],
      [2, 4],
      [3, 6],
      [4, 8],
      [5, 1],
      [6, 3],
      [7, 5],
    ];

    availableSingles.forEach(([row, column]) => {
      matrix[row][column] = 0;
    });
  }

  if (scenario === "full") {
    for (let row = 0; row < ROWS; row += 1) {
      for (let column = 0; column < COLUMNS; column += 1) {
        matrix[row][column] = 1;
      }
    }
  }

  return matrix;
}
