const run = () => {
  const INITIAL_RULE_SET     = 30;
  const INITIAL_CELLS_NUMBER = 201;
  const INITIAL_GEN_NUMBER   = 200;

  const isBitSet = (number, index) => {
    const mask = 1 << index;
    const maskedNumber = number & mask;

    return maskedNumber > 0;
  };

  const directives = [
    '000', '001', '010', '011',
    '100', '101', '110', '111'
  ]

  const ruleSets = [];
  const rulesNumber = Math.pow(2, directives.length);

  for (
    let ruleIndex = 0;
    ruleIndex < rulesNumber;
    ruleIndex++
  ) {
    const ruleSet = {};

    for(
      let directiveIndex = 0;
      directiveIndex < directives.length;
      directiveIndex++
    ) {
      const ruleKey = directives[directiveIndex];
      ruleSet[ruleKey] = isBitSet(ruleIndex, directiveIndex);
    }

    ruleSets.push(ruleSet);
  }

  const generateField = (
    appliedRuleSetIndex,
    cellsNumber,
    generationsNumber
  ) => {
    // NOTE: Create initial field with center cell filled
    const firstGenLine = new Array(cellsNumber).fill(0);
    firstGenLine[Math.floor(cellsNumber / 2)] = 1;
    const field = [firstGenLine];

    for (let genNumber = 1; genNumber < generationsNumber; genNumber++) {
      const previousGenNumber = genNumber - 1;
      const currentGenLine    = [];

      for (let cellIndex = 0; cellIndex < cellsNumber; cellIndex++) {
        const centerFilled = field[previousGenNumber][cellIndex];

        let leftFilled;
        let rightFilled;

        if (cellIndex === 0) {
          leftFilled = field[previousGenNumber][cellsNumber - 1];
        } else {
          leftFilled = field[previousGenNumber][cellIndex - 1];
        }

        if (cellIndex === cellsNumber - 1) {
          rightFilled = field[previousGenNumber][0];
        } else {
          rightFilled = field[previousGenNumber][cellIndex + 1];
        }

        const rule   = `${leftFilled}${centerFilled}${rightFilled}`;
        const result = ruleSets[appliedRuleSetIndex][rule];

        currentGenLine.push(result);
      }

      field.push(currentGenLine);
    }

    return field;
  }

  const form        = document.querySelector('#form');
  const rulePicker  = document.querySelector('#rule-picker');
  const cellsPicker = document.querySelector('#cells-picker');
  const genPicker   = document.querySelector('#gen-picker');
  const canvas      = document.querySelector('#field');

  let currentRuleIndex   = INITIAL_RULE_SET;
  let currentCellsNumber = INITIAL_CELLS_NUMBER;
  let currentGenNumber   = INITIAL_GEN_NUMBER;

  const renderField = (field) => {
    const ctx = canvas.getContext('2d');

    // NOTE: Calculating cell width according to canvas width to fit them all
    const cellWidth  = canvas.width / currentCellsNumber;
    const cellHeight = cellWidth;

    // NOTE: Setting canvas heigth according to generations number
    canvas.height = cellHeight * currentGenNumber;

    // NOTE: Clearing canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#c9c9c9';
    ctx.beginPath();

    field.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        const x = cellIndex * cellWidth;
        const y = rowIndex  * cellHeight;

        if (cell) { ctx.rect(x, y, cellWidth, cellHeight); }
      });
    });

    ctx.fill();
  }

  const resetPickers = () => {
    rulePicker.value  = currentRuleIndex;
    cellsPicker.value = currentCellsNumber;
    genPicker.value   = currentGenNumber;
  };

  const render = () => {
    const field = generateField(
      currentRuleIndex,
      currentCellsNumber,
      currentGenNumber
    );

    renderField(field);
  }

  resetPickers();
  render();

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const ruleIndex   = parseInt(rulePicker.value);
    const cellsNumber = parseInt(cellsPicker.value);
    const genNumber   = parseInt(genPicker.value);

    if (ruleIndex > rulesNumber - 1 || ruleIndex < 0) {
      alert(`Rule number should be between 0 and ${rulesNumber - 1}`);
      resetPickers();
      return;
    }

    if (cellsNumber < 1) {
      alert('Cells number should be greater than zero');
      resetPickers();
      return;
    }

    if (genNumber < 1) {
      alert('Generations number should be greater than zero');
      resetPickers();
      return;
    }

    currentRuleIndex   = ruleIndex;
    currentCellsNumber = cellsNumber;
    currentGenNumber   = genNumber;

    render();
  });
};

run();
