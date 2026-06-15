import { COLUMNS, type SeatingMatrix } from "./seating";

function createSeatMapHtml(matrix: SeatingMatrix): string {
  const columnLabels = Array.from(
    { length: COLUMNS },
    (_, index) => `<span class="text-center text-xs font-semibold text-slate-600">${index + 1}</span>`,
  ).join("");

  const rowBlocks = matrix
    .map((row, rowIndex) => {
      const seats = row
        .map((seat, columnIndex) => {
          const occupied = seat === 1;
          const seatStateClasses = occupied
            ? "cursor-not-allowed border-rose-300 bg-rose-100 text-rose-700"
            : "border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200";

          return `<button data-row="${rowIndex}" data-col="${columnIndex}" class="rounded-lg border px-2 py-1 text-xs font-semibold transition ${seatStateClasses}" ${occupied ? "disabled" : ""}>${columnIndex + 1}</button>`;
        })
        .join("");

      return `<div class="flex items-center gap-2"><span class="w-10 text-xs font-semibold text-slate-600">R${rowIndex + 1}</span><div class="grid grow grid-cols-10 gap-2">${seats}</div></div>`;
    })
    .join("");

  return `<div class="min-w-[680px] space-y-2"><div class="flex items-center gap-2"><span class="w-10 text-xs font-semibold text-slate-600">#</span><div class="grid grow grid-cols-10 gap-2">${columnLabels}</div></div>${rowBlocks}</div>`;
}

export function renderSeatMap(container: HTMLDivElement | null, matrix: SeatingMatrix): void {
  if (!container) {
    return;
  }

  container.innerHTML = createSeatMapHtml(matrix);
}

export function renderMatrixOutput(
  matrixOutput: HTMLPreElement | null,
  formattedMatrix: string,
): void {
  if (!matrixOutput) {
    return;
  }

  matrixOutput.textContent = formattedMatrix;
}

export function pushMessage(container: HTMLDivElement | null, message: string): void {
  if (!container) {
    return;
  }

  const item = document.createElement("p");
  item.className = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2";
  item.textContent = message;
  container.prepend(item);
}

export function setRenderStatus(status: HTMLDivElement | null, isRendering: boolean): void {
  if (!status) {
    return;
  }

  status.classList.toggle("hidden", !isRendering);
  status.classList.toggle("flex", isRendering);
}
