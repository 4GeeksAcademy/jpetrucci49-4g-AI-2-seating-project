import "./style.css";

const ROWS = 8;
const COLUMNS = 10;

type SeatingMatrix = number[][];
type AdjacentPair = [[number, number], [number, number]];

// Creates an 8 x 10 matrix filled with 0 (available seats).
function createSeatingMatrix(rows: number, columns: number): SeatingMatrix {
  return Array.from({ length: rows }, () => Array(columns).fill(0));
}

// Converts matrix values into a readable table with row/column headers.
function formatMatrixForDisplay(matrix: SeatingMatrix): string {
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
function reserveSeat(matrix: SeatingMatrix, row: number, column: number): string {
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
function countSeats(matrix: SeatingMatrix): [number, number] {
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
function findAdjacentAvailableSeats(matrix: SeatingMatrix): AdjacentPair | null {
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

function createScenarioMatrix(scenario: string): SeatingMatrix {
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

function createSeatMapHtml(matrix: SeatingMatrix): string {
  const columnLabels = Array.from({ length: COLUMNS }, (_, index) => `<span class="font-semibold text-slate-600">${index + 1}</span>`).join("");

  const rowBlocks = matrix
    .map((row, rowIndex) => {
      const seats = row
        .map((seat, columnIndex) => {
          const occupied = seat === 1;
          return `<button data-row="${rowIndex}" data-col="${columnIndex}" class="seat ${occupied ? "seat-occupied" : "seat-available"}" ${occupied ? "disabled" : ""}>${columnIndex + 1}</button>`;
        })
        .join("");

      return `<div class="row-wrap"><span class="row-label">R${rowIndex + 1}</span><div class="seat-row">${seats}</div></div>`;
    })
    .join("");

  return `<div class="seat-layout"><div class="row-wrap"><span class="row-label">#</span><div class="seat-row col-head">${columnLabels}</div></div>${rowBlocks}</div>`;
}

let seatingMatrix = createSeatingMatrix(ROWS, COLUMNS);

const seatMap = document.querySelector<HTMLDivElement>("#seat-map");
const matrixOutput = document.querySelector<HTMLPreElement>("#matrix-output");
const messages = document.querySelector<HTMLDivElement>("#messages");
const reserveForm = document.querySelector<HTMLFormElement>("#reserve-form");
const rowInput = document.querySelector<HTMLInputElement>("#row-input");
const colInput = document.querySelector<HTMLInputElement>("#col-input");
const adjacentButton = document.querySelector<HTMLButtonElement>("#adjacent-btn");
const scenarioButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".scenario-btn"));

function pushMessage(message: string): void {
  if (!messages) {
    return;
  }

  const item = document.createElement("p");
  item.className = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2";
  item.textContent = message;
  messages.prepend(item);
}

function render(): void {
  if (seatMap) {
    seatMap.innerHTML = createSeatMapHtml(seatingMatrix);
  }

  if (matrixOutput) {
    matrixOutput.textContent = formatMatrixForDisplay(seatingMatrix);
  }

  const [occupied, available] = countSeats(seatingMatrix);
  pushMessage(`Occupied: ${occupied} | Available: ${available}`);

  console.clear();
  console.log("Current seating matrix:");
  console.log(formatMatrixForDisplay(seatingMatrix));
}

function loadScenario(name: string): void {
  seatingMatrix = createScenarioMatrix(name);
  pushMessage(`Scenario loaded: ${name}.`);
  render();
}

if (reserveForm && rowInput && colInput) {
  reserveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const row = Number.parseInt(rowInput.value, 10) - 1;
    const column = Number.parseInt(colInput.value, 10) - 1;
    const message = reserveSeat(seatingMatrix, row, column);
    pushMessage(message);
    render();
    reserveForm.reset();
  });
}

if (seatMap) {
  seatMap.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const row = Number.parseInt(target.dataset.row ?? "-1", 10);
    const column = Number.parseInt(target.dataset.col ?? "-1", 10);
    const message = reserveSeat(seatingMatrix, row, column);
    pushMessage(message);
    render();
  });
}

if (adjacentButton) {
  adjacentButton.addEventListener("click", () => {
    const pair = findAdjacentAvailableSeats(seatingMatrix);
    if (!pair) {
      pushMessage("No adjacent available seats were found.");
      return;
    }

    const [[row1, col1], [row2, col2]] = pair;
    pushMessage(
      `Adjacent seats found: R${row1 + 1}-C${col1 + 1} and R${row2 + 1}-C${col2 + 1}.`,
    );
  });
}

scenarioButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const scenario = button.dataset.scenario ?? "empty";
    loadScenario(scenario);
  });
});

pushMessage("Scenario loaded: empty room.");
render();

export {};
