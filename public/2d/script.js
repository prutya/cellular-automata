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

  const FIELD_WIDTH_DEFAULT = 201;
  const FIELD_WIDTH_MAX     = 1000;

  const FIELD_HEIGHT_DEFAULT = 201;
  const FIELD_HEIGHT_MAX     = 1000;

  const RULE_MAX     = 4294967296;
  const RULE_DEFAULT = 459188;

  // NOTE: 60 Frames per second
  const FPS_DEFAULT = 60;
  const FPS_MIN     = 0.1;
  const FPS_MAX     = 120;

  const ONE_SECOND = 1000;

  const canvas      = document.querySelector('#field');
  const form        = document.querySelector('#form');
  const rulePicker  = document.querySelector('#rule-picker');
  const widthPicker = document.querySelector('#width-picker');
  const fpsPicker   = document.querySelector('#fps-picker');

  let field;
  let intervalId;
  let currentRule   = RULE_DEFAULT;
  let currentWidth  = FIELD_WIDTH_DEFAULT;
  let currentHeight = FIELD_HEIGHT_DEFAULT;
  let currentFps    = FPS_DEFAULT;

  const resetSimulation = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    field = createEmptyField(currentWidth, currentHeight);
    field[Math.floor(currentHeight / 2)][Math.floor(currentWidth / 2)] = true;

    renderField(field, canvas);

    intervalId = setInterval(() => {
      field = calculateNextGenerationField(field, currentRule);
      renderField(field, canvas);
    }, ONE_SECOND / currentFps);
  };

  const resetForm = () => {
    rulePicker.value  = currentRule;
    widthPicker.value = currentWidth;
    fpsPicker.value = currentFps;
  }

  resetForm();
  resetSimulation();

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const newRule = parseInt(rulePicker.value);

    if (newRule < 0 || newRule >= RULE_MAX ) {
      alert(`Rule number should be between 0 and ${RULE_MAX}.`);
      resetForm();
      return;
    }

    const newWidth = parseInt(widthPicker.value);

    if (newWidth < 1 || newWidth >= FIELD_WIDTH_MAX) {
      alert(`Width should be between 1 and ${FIELD_WIDTH_MAX}.`);
      resetForm();
      return;
    }

    const newFps = parseFloat(fpsPicker.value);

    if (newFps < FPS_MIN || newFps > FPS_MAX) {
      alert(`FPS should be between ${FPS_MIN} and ${FPS_MAX}`);
      resetForm();
      return;
    }

    currentRule = newRule;
    currentWidth = newWidth;
    currentHeight = currentWidth;
    currentFps = newFps;

    resetSimulation();
  });
};

run();
