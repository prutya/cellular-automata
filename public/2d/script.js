const run = () => {
  const createEmptyField = (width, height) => {
    const field = new Array(height);

    for (let rowIndex = 0; rowIndex < field.length; rowIndex++) {
      const row = new Array(width);

      for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
        row[cellIndex] = false;
      }

      field[rowIndex] = row;
    }

    return field;
  };

  const renderField = (field, canvas) => {
    const ctx = canvas.getContext('2d');

    canvas.height = canvas.width;

    // NOTE: Calculate cell size depending on canvas size
    const cellWidth  = canvas.width  / field[0].length;
    const cellHeight = canvas.height / field.length;

    // NOTE: Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#c9c9c9';

    ctx.beginPath();

    for (let rowIndex = 0; rowIndex < field.length; rowIndex++) {
      for (let cellIndex = 0; cellIndex < field[rowIndex].length; cellIndex++) {
        const x = cellIndex * cellWidth;
        const y = rowIndex  * cellHeight;

        if (field[rowIndex][cellIndex]) {
          ctx.rect(x, y, cellWidth, cellHeight);
        }
      }
    }

    ctx.fill();
  };

  const FIELD_WIDTH  = 400;
  const FIELD_HEIGHT = 400;

  renderField(
    createEmptyField(FIELD_WIDTH, FIELD_HEIGHT),
    document.querySelector('#field')
  );
};

run();
