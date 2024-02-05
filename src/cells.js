const cells = [];
for (let row = 0; row < 10; row++) {
  for (let col = 0; col < 10; col++) {
    cells.push({
      id: `${row}-${col}`, // Unique identifier for each cell
      row: row,           // Row number
      col: col,           // Column number
      ship: false,        // Does the cell contain a ship?
      isHit: false,       // Has the cell been hit by a shot?
      isMiss: false,      // Is the shot a miss (i.e., no ship in this cell)?
    });
  }
}

export default cells;
