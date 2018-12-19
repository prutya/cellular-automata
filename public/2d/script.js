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
        if (field[rowIndex][cellIndex]) {
          ctx.rect(
            cellIndex * cellWidth,
            rowIndex  * cellHeight,
            cellWidth,
            cellHeight
          );
        }
      }
    }

    ctx.fill();
  };

  const WIDTH_MIN     = 1;
  const WIDTH_MAX     = 1001;
  const WIDTH_DEFAULT = 201;

  const HEIGHT_MIN     = 1
  const HEIGHT_MAX     = 1001;
  const HEIGHT_DEFAULT = 201;

  const RULE_MIN     = 0;
  const RULE_MAX     = 4294967296;
  const RULE_DEFAULT = 4290460072;

  const FPS_MIN     = 0.1;
  const FPS_MAX     = 120;
  const FPS_DEFAULT = 60;

  const ONE_SECOND = 1000;

  const TEXT_PAUSE = '❙❙';
  const TEXT_PLAY  = '▶';

  const canvas       = document.querySelector('#field');
  const form         = document.querySelector('#form');
  const rulePicker   = document.querySelector('#rule-picker');
  const widthPicker  = document.querySelector('#width-picker');
  const fpsPicker    = document.querySelector('#fps-picker');
  const pauseTrigger = document.querySelector('#pause-trigger');

  let field;
  let intervalId;
  let currentRule   = RULE_DEFAULT;
  let currentWidth  = WIDTH_DEFAULT;
  let currentHeight = HEIGHT_DEFAULT;
  let currentFps    = FPS_DEFAULT;
  let generationNum = 0;

  const renderNextGen = () => {
    generationNum++;
    field = calculateNextGenerationField(field, currentRule);
    renderField(field, canvas);
  }

  const stopClock = () => {
    if (!intervalId) { return; }

    clearInterval(intervalId);
    intervalId = null;
  }

  const startClock = () => {
    intervalId = setInterval(renderNextGen, ONE_SECOND / currentFps);
  }

  const resetSimulation = () => {
    stopClock();

    pauseTrigger.innerText = TEXT_PAUSE;

    generationNum = 0;
    field = createEmptyField(currentWidth, currentHeight);
    field[Math.floor(currentHeight / 2)][Math.floor(currentWidth / 2)] = true;

    renderField(field, canvas);

    startClock();
  };

  const resetForm = () => {
    rulePicker.value       = currentRule;
    widthPicker.value      = currentWidth;
    fpsPicker.value        = currentFps;
    pauseTrigger.innerText = intervalId ? TEXT_PAUSE : TEXT_PLAY;
  }

  pauseTrigger.addEventListener('click', (event) => {
    event.preventDefault();

    if (intervalId) {
      stopClock();
      event.target.innerText = TEXT_PLAY;
    } else {
      startClock();
      event.target.innerText = TEXT_PAUSE;
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const newRule = parseInt(rulePicker.value);

    if (newRule < RULE_MIN || newRule >= RULE_MAX ) {
      alert(`Rule number should be between ${RULE_MIN} and ${RULE_MAX}.`);
      resetForm();
      return;
    }

    const newWidth = parseInt(widthPicker.value);

    if (newWidth < WIDTH_MIN || newWidth >= WIDTH_MAX) {
      alert(`Width should be between ${WIDTH_MIN} and ${WIDTH_MAX}.`);
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

  resetSimulation();
  resetForm();
};

run();
