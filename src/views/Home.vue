<template>
  <div
    class="pt-4"
    style="padding: 20px 20px 20px"
  >

    <div class="game-status" :style="store.myTurn ? 'color:#4CBB17' : 'black'">
      {{ store.gameStatus }}
    </div>
    <div class="player-name" v-if="store.clientId" style="margin-left: 180px;">
      Pelaaja {{ store.clientId }}
    </div>
    <v-row
      justify="space-evenly"
      class="ma-0"
    >
      <!-- <v-col
        cols="4"
      >
        <v-card
          class="default-ships-container"
          elevation="10"
        >
          <div
            v-for="(ship) in ships"
            :key="ship.id"
            class="ship"
            @click="startShipDrag(ship)"
            :class="{ 'dragging': !ship.dragging }"
            :style="{ left: mouseX + 'px', top: mouseY + 'px' }"
          >
            <div
              v-for="(slot, index) in ship.size"
              :key="index"
              class="ship-slot"
            >

            </div>
          </div>
        </v-card>
      </v-col> -->

      <div
        class="d-flex justify-center"
      >
        <v-card
          elevation="10"
          class="starting-board"
        >
          <div
            v-for="cell in cells"
            :key="cell.id"
            class="cell"
            :class="{ 'cell-ship': cell.ship, 'cell-hit': cell.isHit, 'cell-miss': cell.isMiss, 'hide': !showCells }"
          >
          </div>
        </v-card>
      </div>

      <div
      >
      <v-card
        elevation="10"
        class="opponent-board"
      >
        <div
          v-for="cell in opponentCells"
          :key="cell.id"
          class="cell"
          :class="{ 'cell-ship': cell.ship, 'cell-hit': cell.isHit, 'cell-miss': cell.isMiss, 'shootable': store.myTurn }"
          @click="shoot(cell)"
        >
        </div>

      </v-card>

      </div>
    </v-row>

    <div class="actions">
      <v-btn
        v-if="!store.ready"
        @click="placeAllRandomly()"
      >
        Päivitä
      </v-btn>

      <v-btn
      @click="toggleCellVisibility()"
      >
      {{ showCells ? 'Piilota' : 'Näytä' }}
    </v-btn>
    <v-btn
      v-if="!store.ready && placed"
      @click="ready()"
    >
      Valmis
    </v-btn>
    </div>
  </div>

  <v-dialog
    v-model="store.gameEnded"
    width="500px"
    persistent
  >
    <v-card
      width="500"
      height="200"
    >
    <div class="final-status">
      {{ store.gameStatus }}
    </div>

  </v-card>

  </v-dialog>
</template>

<script setup>

import { ref } from 'vue';
import _cells from '@/cells';
import { useAppStore } from '@/store/app';

const store = useAppStore();
store.cells = ref(JSON.parse(JSON.stringify(_cells)));
store.opponentCells = ref(JSON.parse(JSON.stringify(_cells)));

const placed = ref(false);
const cells = ref(store.cells);
const opponentCells = ref(store.opponentCells);
const myTurn = ref(true);
const showCells = ref(true);
const ships = [
  { id: 1, size: 5, positions: [] },
  { id: 2, size: 4, positions: [] },
  { id: 3, size: 3, positions: [] },
  { id: 4, size: 3, positions: [] },
  { id: 5, size: 2, positions: [] },
];

const mouseX = ref(0);
const mouseY = ref(0);

function placeShip(ship, startCell, direction, cells) {
  const { row, col } = startCell;
  const { size } = ship;
  const shipCells = [];

  // Check if the ship can be placed in the selected direction
  if (
    (direction === "horizontal" && col + size > 10) ||
    (direction === "vertical" && row + size > 10)
  ) {
    return false;
  }

  // Check if the selected cells are empty
  for (let i = 0; i < size; i++) {
    const cell = cells.find(
      (c) =>
        (direction === "horizontal" && c.row === row && c.col === col + i) ||
        (direction === "vertical" && c.row === row + i && c.col === col)
    );

    if (!cell || cell.ship) {
      return false;
    }

    shipCells.push(cell);
  }

  // If all checks pass, place the ship
  ship.positions = shipCells;
  shipCells.forEach((cell) => (cell.ship = true));
  return true;
}

function placeRandomly(ship) {
  const availableCells = cells.value.filter((cell) => !cell.ship);
  const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';

  if (orientation === 'horizontal') {
    const validCells = availableCells.filter((cell) => cell.col + ship.size <= 10);
    if (validCells.length === 0) return false;
    let randomCell = validCells[Math.floor(Math.random() * validCells.length)];
    for (let i = 0; i < ship.size; i++) {
      randomCell.ship = true;
      ship.positions.push(randomCell);
      randomCell = cells.value.find((cell) => cell.row === randomCell.row && cell.col === randomCell.col + 1);
    }
  } else {
    const validCells = availableCells.filter((cell) => cell.row + ship.size <= 10);
    if (validCells.length === 0) return false;
    let randomCell = validCells[Math.floor(Math.random() * validCells.length)];
    for (let i = 0; i < ship.size; i++) {
      randomCell.ship = true;
      ship.positions.push(randomCell);
      randomCell = cells.value.find((cell) => cell.row === randomCell.row + 1 && cell.col === randomCell.col);
    }
  }
  return true;
}

function placeAllRandomly() {
  placed.value = true;
  cells.value = JSON.parse(JSON.stringify(_cells));
  ships.forEach((ship) => {
    while (!placeRandomly(ship)) {
      ship.positions = [];
    }
  });
  store.cells = cells.value;
  store.updateCells();
}

// placeAllRandomly();

function shoot(cell) {
  if (store.myTurn && !cell.isHit && !cell.isMiss) {
    store.shoot(cell);
  }
}

function ready() {
  store.readyUp();
}

function toggleCellVisibility() {
  showCells.value = !showCells.value;
}

</script>

<style scoped>

.default-ships-container {
  /* height: 80vh; */
  display: flex;
  flex-wrap: wrap;
  /* justify-content: center; */
  gap: 20px;
  padding: 20px;
}

.ship {
  /* width: 150px; */
  /* height: 150px; */
  /* background-color: rgb(1, 10, 18); */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* gap: 10px; */
  flex-direction: column;
  padding: 20px;
}

.ship:hover {
  background-color: #ccc;
}

.ship-slot {
  width: 80px;
  height: 80px;
  background-color: black;
  border: 1px solid #ccc;
}

.starting-board, .opponent-board {
  height: 700px;
  width: 700px;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-gap: 2px;
}

.cell {
  width: 100%;
  padding-top: 100%; /* Creates a square cell */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  /* cursor: pointer; */
  user-select: none;
  background-color: #2196F3;
  position: relative;
}

.opponent-board .cell.shootable {
  cursor: pointer;
}

.opponent-board .cell:hover {
  background-color: #128df3;
}
.cell-ship {
  background-color: black;
}

.cell-hit:before, .cell-miss:before {
  content: "";
  position: absolute;
  background-color: red;
  border-radius: 50%;
  height: 60%;
  width: 60%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cell-hit, .cell-miss {
  cursor: default !important;
}

.cell-hit {
  background-color: black !important;
}

.ship.dragging {
  position: absolute;
}

.game-status {
  display: flex;
  justify-content: center;
  /* align-items: center; */
  height: 60px;
  font-size: 30px;
  font-weight: 500;
}

.final-status {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.cell.hide {
  background-color: #2196F3 !important;
}
.actions {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
</style>


