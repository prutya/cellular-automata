// import t from 't';

// NOTE: Shorthand alias for Three.js
const t = THREE;

const run = () => {
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

  const setCenterCell = (field, value = true) => {
    const z = Math.floor(field.length / 2);
    const y = Math.floor(field[0].length / 2);
    const x = Math.floor(field[0][0].length / 2);

    field[z][y][x] = value;

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

  // NOTE: Object model sizes
  const FIELD_SIZE   = 17
  const FIELD_DEPTH  = FIELD_SIZE;
  const FIELD_HEIGHT = FIELD_SIZE;
  const FIELD_WIDTH  = FIELD_SIZE;

  // NOTE: Render shading
  const R_BG_COLOR            = 0x000000;
  const R_LIGHT_AMBIENT_COLOR = 0x8b8b8b;
  const R_LIGHT_DIRECT_COLOR  = 0xffffff;

  // NOTE: Render sizes
  const R_FIELD_SIZE       = 5.0;
  const R_FIELD_MARGIN     = 0.05;
  const R_FIELD_SIZE_INNER = R_FIELD_SIZE - 2 * R_FIELD_MARGIN;
  const R_CUBE_SIZE        = R_FIELD_SIZE_INNER / FIELD_SIZE;
  const R_CUBE_MARGIN      = 0.05;
  const R_CUBE_SIZE_INNER  = R_CUBE_SIZE - 2 * R_CUBE_MARGIN;
  const R_CUBE_OFFSET      = -(R_FIELD_SIZE_INNER / 2) + R_CUBE_SIZE / 2

  // NOTE: Render objects params
  const R_FIELD_GEOMETRY = new t.BoxGeometry(
    R_FIELD_SIZE,
    R_FIELD_SIZE,
    R_FIELD_SIZE,
  );
  const R_FIELD_MATERIAL = new t.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
  });
  const R_CUBE_GEOMETRY = new t.BoxGeometry(
    R_CUBE_SIZE_INNER,
    R_CUBE_SIZE_INNER,
    R_CUBE_SIZE_INNER,
  );
  const R_CUBE_MATERIAL_BLANK = new t.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.75,
  });
  const R_CUBE_MATERIAL_FILLED = new t.MeshLambertMaterial({
    color: 0xe41654,
    transparent: true,
    opacity: 0.75,
  })

  const RULE_DEFAULT = [
    ...numberToBitArray(621375902),
    ...numberToBitArray(2960227347),
    ...numberToBitArray(4095321793),
    ...numberToBitArray(2586228668),
  ];

  // NOTE: Init canvas
  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // NOTE: Init the simulation
  let currentRule = RULE_DEFAULT;
  let field       = createEmptyField(FIELD_DEPTH, FIELD_HEIGHT, FIELD_WIDTH);
  let cubes       = createEmptyField(FIELD_DEPTH, FIELD_HEIGHT, FIELD_WIDTH);

  setCenterCell(field, true);

  const scene = new t.Scene();

  // NOTE: Init background
  scene.background = new t.Color(R_BG_COLOR);

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
  const ambient = new t.AmbientLight(R_LIGHT_AMBIENT_COLOR);

  const light = new t.DirectionalLight(R_LIGHT_DIRECT_COLOR);
  light.position = camera.position;

  scene.add(light);
  scene.add(ambient);

  // NOTE: Init renderer
  const renderer = new t.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.context.disable(renderer.context.DEPTH_TEST);

  // NOTE: Init field
  const fieldDisplay = new t.Mesh(R_FIELD_GEOMETRY, R_FIELD_MATERIAL);

  for (let i = 0; i < FIELD_DEPTH; i++) {
    for (let j = 0; j < FIELD_HEIGHT; j++) {
      for (let k = 0; k < FIELD_WIDTH; k++) {
        const cube = new t.Mesh(
          R_CUBE_GEOMETRY,
          field[i][j][k] ? R_CUBE_MATERIAL_FILLED : R_CUBE_MATERIAL_BLANK
        );

        cube.position.x = i * R_CUBE_SIZE + R_CUBE_OFFSET;
        cube.position.y = j * R_CUBE_SIZE + R_CUBE_OFFSET;
        cube.position.z = k * R_CUBE_SIZE + R_CUBE_OFFSET;

        cubes[i][j][k] = cube;
        fieldDisplay.add(cube);
      }
    }
  }

  scene.add(fieldDisplay);

  const animate = () => {
    requestAnimationFrame(animate);

    field = calculateNextGenerationField(field, currentRule);

    for (let i = 0; i < FIELD_DEPTH; i++) {
      for (let j = 0; j < FIELD_HEIGHT; j++) {
        for (let k = 0; k < FIELD_WIDTH; k++) {
          cubes[i][j][k].material = field[i][j][k]
            ? R_CUBE_MATERIAL_FILLED
            : R_CUBE_MATERIAL_BLANK;
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

run();
