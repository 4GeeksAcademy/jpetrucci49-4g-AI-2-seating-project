import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

import {
  COLUMNS,
  ROWS,
  countSeats,
  createScenarioMatrix,
  createSeatingMatrix,
  findAdjacentAvailableSeats,
  formatMatrixForDisplay,
  reserveSeat,
  type SeatingMatrix,
} from "./seating";

// Prints the current room state with row and column labels.
function displayRoomState(matrix: SeatingMatrix): void {
  console.log("Current screening room:");
  console.log(formatMatrixForDisplay(matrix));
}

// Prints how many seats are occupied and how many are available.
function displaySeatCounts(matrix: SeatingMatrix): void {
  const [occupied, available] = countSeats(matrix);
  console.log(`Occupied seats: ${occupied}`);
  console.log(`Available seats: ${available}`);
}

// Prints the first adjacent pair of available seats or a clear fallback message.
function displayAdjacentPair(matrix: SeatingMatrix): void {
  const pair = findAdjacentAvailableSeats(matrix);

  if (!pair) {
    console.log("No adjacent available seats were found.");
    return;
  }

  const [[row1, col1], [row2, col2]] = pair;
  console.log(
    `Adjacent seats found: R${row1 + 1}-C${col1 + 1} and R${row2 + 1}-C${col2 + 1}.`,
  );
}

// Prints a divider to make terminal output easier to scan.
function displayDivider(): void {
  console.log("\n----------------------------------------\n");
}

// Loads one of the required test scenarios using only the seating matrix.
function loadScenario(name: string): SeatingMatrix {
  if (name === "empty") {
    return createSeatingMatrix(ROWS, COLUMNS);
  }

  return createScenarioMatrix(name);
}

// Runs the assignment's required scenarios and prints their results.
function runScenarioDemonstration(): void {
  const scenarios: Array<[string, string]> = [
    ["empty", "Empty Room"],
    ["partial", "Partially Filled Room"],
    ["nearly", "Nearly Full Room"],
    ["full", "Full Room"],
  ];

  console.log("Scenario test run:");

  scenarios.forEach(([scenarioKey, scenarioLabel]) => {
    const matrix = loadScenario(scenarioKey);
    displayDivider();
    console.log(scenarioLabel);
    displayRoomState(matrix);
    displaySeatCounts(matrix);
    displayAdjacentPair(matrix);
  });

  displayDivider();
}

// Prompts until the user provides a whole number within the allowed range.
async function promptForNumber(
  reader: ReturnType<typeof createInterface>,
  message: string,
  min: number,
  max: number,
): Promise<number> {
  while (true) {
    const answer = await reader.question(message);
    const value = Number.parseInt(answer.trim(), 10);

    if (Number.isInteger(value) && value >= min && value <= max) {
      return value;
    }

    console.log(`Please enter a whole number between ${min} and ${max}.`);
  }
}

// Prompts until the user provides one of the supported scenario names.
async function promptForScenario(reader: ReturnType<typeof createInterface>): Promise<string> {
  while (true) {
    const answer = (await reader.question("Choose a scenario (empty, partial, nearly, full): "))
      .trim()
      .toLowerCase();

    if (answer === "empty" || answer === "partial" || answer === "nearly" || answer === "full") {
      return answer;
    }

    console.log("Please type one of these values: empty, partial, nearly, full.");
  }
}

// Prints the available terminal actions.
function displayMenu(): void {
  console.log("Seat Manager Menu");
  console.log("1. Display current room");
  console.log("2. Reserve a seat");
  console.log("3. Count occupied and available seats");
  console.log("4. Find the first adjacent available pair");
  console.log("5. Load a scenario");
  console.log("6. Run the required scenario tests again");
  console.log("0. Exit");
}

// Starts the interactive command line session for the seating manager.
async function startCommandLineSession(): Promise<void> {
  const reader = createInterface({ input, output });
  let currentScenario = "empty";
  let seatingMatrix = loadScenario(currentScenario);

  console.log("Cinema Seating System");
  console.log(`Rows: ${ROWS} | Columns: ${COLUMNS}`);
  displayDivider();
  runScenarioDemonstration();
  console.log("Interactive mode started with the empty room scenario.");
  displayRoomState(seatingMatrix);

  try {
    while (true) {
      displayDivider();
      displayMenu();
      const choice = (await reader.question("Select an option: ")).trim();

      if (choice === "0") {
        console.log("Exiting seat manager.");
        break;
      }

      if (choice === "1") {
        displayRoomState(seatingMatrix);
        continue;
      }

      if (choice === "2") {
        const row = await promptForNumber(reader, `Row (1-${ROWS}): `, 1, ROWS);
        const column = await promptForNumber(reader, `Column (1-${COLUMNS}): `, 1, COLUMNS);
        console.log(reserveSeat(seatingMatrix, row - 1, column - 1));
        displayRoomState(seatingMatrix);
        continue;
      }

      if (choice === "3") {
        displaySeatCounts(seatingMatrix);
        continue;
      }

      if (choice === "4") {
        displayAdjacentPair(seatingMatrix);
        continue;
      }

      if (choice === "5") {
        currentScenario = await promptForScenario(reader);
        seatingMatrix = loadScenario(currentScenario);
        console.log(`Scenario loaded: ${currentScenario}.`);
        displayRoomState(seatingMatrix);
        continue;
      }

      if (choice === "6") {
        runScenarioDemonstration();
        console.log(`Returned to the current scenario: ${currentScenario}.`);
        displayRoomState(seatingMatrix);
        continue;
      }

      console.log("Unknown option. Choose 0, 1, 2, 3, 4, 5, or 6.");
    }
  } finally {
    reader.close();
  }
}

void startCommandLineSession();