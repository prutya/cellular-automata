const run = () => {
  const getBit = (number, index) => {
    const mask = 1 << index;
    const maskedNumber = number & mask;

    return maskedNumber > 0;
  };

  const bitArrayToNumber = (bits) => {
    let result = 0;

    for(let bitIndex = 0; bitIndex < bits.length; bitIndex++) {
      if (!bits[bitIndex]) { continue; }

      result += Math.pow(2, bitIndex);
    }

    return result;
  };

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

  const calculateNextGenerationField = (prevField, rule) => {
    const width  = prevField[0].length;
    const height = prevField.length;

    const field = createEmptyField(width, height);

    for (let rowIndex = 0; rowIndex < width; rowIndex++) {
      for (let cellIndex = 0; cellIndex < height; cellIndex++) {
        const northX = cellIndex;
        let northY = rowIndex - 1;
        if (northY < 0) { northY = height - 1; }

        let westX = cellIndex - 1;
        const westY = rowIndex;
        if (westX < 0) { westX = width - 1; }

        let eastX = cellIndex + 1;
        const eastY = rowIndex;
        if (eastX > width - 1) { eastX = 0; }

        const southX = cellIndex;
        let southY = rowIndex + 1;
        if (southY > height - 1) { southY = 0; }

        const westFilled  = prevField[westY][westX];
        const eastFilled  = prevField[eastY][eastX];
        const northFilled = prevField[northY][northX];
        const southFilled = prevField[southY][southX];
        const selfFilled  = prevField[rowIndex][cellIndex];

        const ruleIndex = bitArrayToNumber([
          northFilled,
          westFilled,
          selfFilled,
          eastFilled,
          southFilled
        ]);

        field[rowIndex][cellIndex] = getBit(rule, ruleIndex)
      }
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

  const canvas = document.querySelector('#field');

  const FIELD_WIDTH  = 201;
  const FIELD_HEIGHT = 201;
  const RULE         = 10078;

  let field = createEmptyField(FIELD_WIDTH, FIELD_HEIGHT);
  field[Math.floor(FIELD_HEIGHT / 2)][Math.floor(FIELD_WIDTH / 2)] = true;

  renderField(field, canvas);

  setInterval(() => {
    field = calculateNextGenerationField(field, RULE);
    renderField(field, canvas);
  }, 200);
};

run();
