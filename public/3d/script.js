// import t from 't';

const app = () => {
  const getRandomInt = (max) =>
    Math.floor(Math.random() * Math.floor(max));

  const numberToBitArray = (number, bitsCount = 32) => {
    const result = (new Array(bitsCount)).fill(false);

    for (let bitIndex = 0; bitIndex < result.length; bitIndex++) {
      result[bitIndex] = ((number >> bitIndex) & 1) > 0;
    }

    return result;
  };

  const bitArrayToNumber = (bits) => {
    let result = 0;

    for(let bitIndex = 0; bitIndex < bits.length; bitIndex++) {
      if (!bits[bitIndex]) { continue; }

      result += Math.pow(2, bitIndex);
    }

    return result;
  };

  const createEmptyField = (width, height, depth, filler = false) => {
    const field = new Array(depth);

    for (let planeIndex = 0; planeIndex < field.length; planeIndex++) {
      const plane = new Array(height);

      for (let rowIndex = 0; rowIndex < plane.length; rowIndex++) {
        const row = new Array(width);

        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
          row[cellIndex] = filler;
        }

        plane[rowIndex] = row;
      }

      field[planeIndex] = plane;
    }

    return field;
  };

  const calculateNextGenerationField = (prevField, rule) => {
    const depth  = prevField.length;
    const height = prevField[0].length;
    const width  = prevField[0][0].length;

    const field = createEmptyField(width, height, depth);

    for (let planeIndex = 0; planeIndex < depth; planeIndex++) {
      for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        for (let cellIndex = 0; cellIndex < width; cellIndex++) {
          const northX = cellIndex;
          let northY = rowIndex - 1;
          const northZ = planeIndex;
          if (northY < 0) { northY = height - 1; }

          let westX = cellIndex - 1;
          const westY = rowIndex;
          const westZ = planeIndex;
          if (westX < 0) { westX = width - 1; }

          let eastX = cellIndex + 1;
          const eastY = rowIndex;
          const eastZ = planeIndex;
          if (eastX > width - 1) { eastX = 0; }

          const southX = cellIndex;
          let southY = rowIndex + 1;
          const southZ = planeIndex;
          if (southY > height - 1) { southY = 0; }

          const frontX = cellIndex;
          const frontY = rowIndex;
          let frontZ = planeIndex + 1;
          if (frontZ > depth - 1) { frontZ = 0; }

          const backX = cellIndex;
          const backY = rowIndex;
          let backZ = planeIndex - 1;
          if(backZ < 0) { backZ = depth - 1; }

          const westFilled  = prevField[westZ][westY][westX];
          const eastFilled  = prevField[eastZ][eastY][eastX];
          const northFilled = prevField[northZ][northY][northX];
          const southFilled = prevField[southZ][southY][southX];
          const frontFilled = prevField[frontZ][frontY][frontX];
          const backFilled  = prevField[backZ][backY][backX];
          const selfFilled  = prevField[planeIndex][rowIndex][cellIndex];

          const ruleIndex = bitArrayToNumber([
            frontFilled,
            northFilled,
            westFilled,
            selfFilled,
            eastFilled,
            southFilled,
            backFilled
          ]);

          field[planeIndex][rowIndex][cellIndex] = rule[ruleIndex];
        }
      }
    }

    return field;
  };

  const FIELD_DEPTH  = 17;
  const FIELD_HEIGHT = FIELD_DEPTH;
  const FIELD_WIDTH  = FIELD_HEIGHT;

  let field = createEmptyField(FIELD_DEPTH, FIELD_HEIGHT, FIELD_WIDTH);
  let cubes = createEmptyField(FIELD_DEPTH, FIELD_HEIGHT, FIELD_WIDTH);

  const dotZ = Math.floor(FIELD_DEPTH / 2);
  const dotY = Math.floor(FIELD_HEIGHT / 2);
  const dotX = Math.floor(FIELD_WIDTH / 2);

  field[dotZ][dotX][dotY] = true;

  const currentRulePart1 = getRandomInt(4294967295);
  const currentRulePart2 = getRandomInt(4294967295);
  const currentRulePart3 = getRandomInt(4294967295);
  const currentRulePart4 = getRandomInt(4294967295);

  console.log(currentRulePart1);
  console.log(currentRulePart2);
  console.log(currentRulePart3);
  console.log(currentRulePart4);

  const currentRule = [
    ...numberToBitArray(currentRulePart1, 32),
    ...numberToBitArray(currentRulePart2, 32),
    ...numberToBitArray(currentRulePart3, 32),
    ...numberToBitArray(currentRulePart4, 32),
  ];

  const fieldSize = 5.0;
  const fieldMargin = 0.05;
  const fieldInnerSize = fieldSize - fieldMargin * 2;
  const cubeMargin = 0.1;
  const cubeSize = fieldInnerSize / field.length;
  const cubeInnerSize = cubeSize - cubeMargin * 2;
  const cubeDelta = -(fieldInnerSize / 2) + cubeSize / 2;

  const t = THREE;

  const scene = new t.Scene();

  // NOTE: Init background
  scene.background = new t.Color(0x000000);

  // NOTE: Init camera
  const camera = new t.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  camera.position.z = 8.5;

  // NOTE: Init camera controls
  const controls = new THREE.OrbitControls(camera);

  // NOTE: Init lighting
  const ambient = new t.AmbientLight(0x8b8b8b);

  const light = new t.DirectionalLight(0xffffff);
  light.position = camera.position;

  scene.add(light);
  scene.add(ambient);

  // NOTE: Init canvas
  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // NOTE: Init renderer
  const renderer = new t.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.context.disable(renderer.context.DEPTH_TEST);

  // NOTE: Init field
  const fieldDisplay = new t.Mesh(
    new t.BoxGeometry(fieldSize, fieldSize, fieldSize),
    new t.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    }),
  );

  const cubeGeometry = new t.BoxGeometry(cubeInnerSize, cubeInnerSize, cubeInnerSize);
  const cubeMaterialTransparent = new t.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.75,
  });
  const cubeMaterialOpaque = new t.MeshLambertMaterial({
    color: 0xe41654,
    transparent: true,
    opacity: 0.75,
  })

  for (let i = 0; i < FIELD_DEPTH; i++) {
    for (let j = 0; j < FIELD_HEIGHT; j++) {
      for (let k = 0; k < FIELD_WIDTH; k++) {
        const cube = new t.Mesh(
          cubeGeometry,
          field[i][j][k] ? cubeMaterialOpaque : cubeMaterialTransparent
        );

        cube.position.x = i * cubeSize + cubeDelta;
        cube.position.y = j * cubeSize + cubeDelta;
        cube.position.z = k * cubeSize + cubeDelta;

        cubes[i][j][k] = cube;
        fieldDisplay.add(cube);
      }
    }
  }

  scene.add(fieldDisplay);

  const frameRate = 30;
  const currentFrame = 0;

  const animate = () => {
    requestAnimationFrame(animate);

    field = calculateNextGenerationField(field, currentRule);

    for (let i = 0; i < FIELD_DEPTH; i++) {
      for (let j = 0; j < FIELD_HEIGHT; j++) {
        for (let k = 0; k < FIELD_WIDTH; k++) {
          cubes[i][j][k].material = field[i][j][k]
            ? cubeMaterialOpaque
            : cubeMaterialTransparent;
        }
      }
    }

    controls.update();
    renderer.render(scene, camera);
  }

  controls.update();
  renderer.render(scene, camera);
  animate();
};

app();
