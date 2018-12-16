const run = () => {
  const getBit = (number, index) => {
    const mask = 1 << index;
    const maskedNumber = number & mask;

    return maskedNumber > 0 ? 1 : 0;
  };

  const directives = ['000', '001', '010', '011', '100', '101', '110', '111']

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
      ruleSet[ruleKey] = getBit(ruleIndex, directiveIndex);
    }

    ruleSets.push(ruleSet);
  }

  const generationsNumber   = 200;
  const cellsNumber         = 101;

  const generateField = (appliedRuleSetIndex) => {
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

  const renderField = (field) => `
    <div class="field">
      ${
        field.map(fieldLine =>
          fieldLine.map(fieldCell => `
            <div class="field__cell ${
              fieldCell === 1 ? 'field__cell--filled' : ''
            }"></div>
          `).join('')
        ).join('')
      }
    </div>
  `

  const fieldNode = document.getElementById('field');
  fieldNode.innerHTML = renderField(generateField(222));

  const renderTrigger = document.getElementById('render-trigger');
  const rulePicker    = document.getElementById('rule-picker');

  let currentRuleIndex = parseInt(rulePicker.value);

  renderTrigger.addEventListener('click', (event) => {
    const ruleIndex = parseInt(rulePicker.value);

    if (ruleIndex > rulesNumber - 1 || ruleIndex < 0) {
      alert(`Please use a number between 0 and ${rulesNumber - 1}`);
      rulePicker.value = currentRuleIndex;
      return;
    }

    currentRuleIndex = ruleIndex;
    fieldNode.innerHTML = renderField(generateField(ruleIndex));
  });
};

run();
