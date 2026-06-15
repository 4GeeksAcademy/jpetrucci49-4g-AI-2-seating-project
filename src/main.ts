import {
  COLUMNS,
  ROWS,
  countSeats,
  createScenarioMatrix,
  createSeatingMatrix,
  findAdjacentAvailableSeats,
  formatMatrixForDisplay,
  reserveSeat,
} from "./seating";
import { pushMessage, renderMatrixOutput, renderSeatMap, setRenderStatus } from "./ui";

let seatingMatrix = createSeatingMatrix(ROWS, COLUMNS);

const seatMap = document.querySelector<HTMLDivElement>("#seat-map");
const matrixOutput = document.querySelector<HTMLPreElement>("#matrix-output");
const messages = document.querySelector<HTMLDivElement>("#messages");
const renderStatus = document.querySelector<HTMLDivElement>("#render-status");
const reserveForm = document.querySelector<HTMLFormElement>("#reserve-form");
const rowInput = document.querySelector<HTMLInputElement>("#row-input");
const colInput = document.querySelector<HTMLInputElement>("#col-input");
const adjacentButton = document.querySelector<HTMLButtonElement>("#adjacent-btn");
const scenarioButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".scenario-btn"));

function render(): void {
  renderSeatMap(seatMap, seatingMatrix);
  renderMatrixOutput(matrixOutput, formatMatrixForDisplay(seatingMatrix));

  const [occupied, available] = countSeats(seatingMatrix);
  pushMessage(messages, `Occupied: ${occupied} | Available: ${available}`);

  console.clear();
  console.log("Current seating matrix:");
  console.log(formatMatrixForDisplay(seatingMatrix));
}

function renderWithLoading(): void {
  setRenderStatus(renderStatus, true);
  requestAnimationFrame(() => {
    render();
    setRenderStatus(renderStatus, false);
  });
}

function loadScenario(name: string): void {
  seatingMatrix = createScenarioMatrix(name);
  pushMessage(messages, `Scenario loaded: ${name}.`);
  renderWithLoading();
}

if (reserveForm && rowInput && colInput) {
  reserveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const row = Number.parseInt(rowInput.value, 10) - 1;
    const column = Number.parseInt(colInput.value, 10) - 1;
    const message = reserveSeat(seatingMatrix, row, column);
    pushMessage(messages, message);
    renderWithLoading();
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
    pushMessage(messages, message);
    renderWithLoading();
  });
}

if (adjacentButton) {
  adjacentButton.addEventListener("click", () => {
    const pair = findAdjacentAvailableSeats(seatingMatrix);
    if (!pair) {
      pushMessage(messages, "No adjacent available seats were found.");
      return;
    }

    const [[row1, col1], [row2, col2]] = pair;
    pushMessage(
      messages,
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

pushMessage(messages, "Scenario loaded: empty room.");
renderWithLoading();

export {};
