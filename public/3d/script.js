// import t from 't';

const app = () => {
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
  const ambient = new t.AmbientLight(0x555555);

  const light = new t.DirectionalLight(0xffffff);
  light.position = camera.position;

  scene.add(light);
  scene.add(ambient);

  // NOTE: Init renderer
  const renderer = new t.WebGLRenderer({ alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.context.disable(renderer.context.DEPTH_TEST);

  // NOTE: Init cells
  const cells = [
    [
      [true, false, true, false],
      [true, false, true, false],
      [true, false, true, false],
      [true, false, true, false],
    ],
    [
      [false, false, true, true],
      [false, false, true, true],
      [false, false, true, true],
      [false, false, true, true],
    ],
    [
      [false, false, true, true],
      [false, false, true, true],
      [false, false, true, true],
      [false, false, true, true],
    ],
    [
      [false, true, true, false],
      [false, true, true, false],
      [false, true, true, false],
      [false, true, true, false],
    ],
  ];

  const fieldSize = 4.2;
  const fieldMargin = 0.1;
  const fieldInnerSize = fieldSize - fieldMargin * 2;
  const cubeMargin = 0.1;
  const cubeSize = fieldInnerSize / cells.length;
  const cubeInnerSize = cubeSize - cubeMargin * 2;
  const cubeDelta = -(fieldInnerSize / 2) + cubeSize / 2;

  // NOTE: Init field
  const field = new t.Mesh(
    new t.BoxGeometry(fieldSize, fieldSize, fieldSize),
    new t.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    }),
  );

  // NOTE: Init cell cubes
  const cubes = [];
  const cubeGeometry = new t.BoxGeometry(cubeInnerSize, cubeInnerSize, cubeInnerSize);
  const cubeMaterialTransparent = new t.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
  });
  const cubeMaterialOpaque = new t.MeshLambertMaterial({
    color: 0xe41654,
    transparent: true,
    opacity: 0.5,
  })

  for (let i = 0; i < cells.length; i++) {
    for(let j = 0; j < cells[0].length; j++) {
      for(let k = 0; k < cells[0][0].length; k++) {
        const cube = new t.Mesh(
          cubeGeometry,
          cells[i][j][k] ? cubeMaterialOpaque : cubeMaterialTransparent
        );

        cube.position.x = i * cubeSize + cubeDelta;
        cube.position.y = j * cubeSize + cubeDelta;
        cube.position.z = k * cubeSize + cubeDelta;

        field.add(cube);
        cubes.push(cube);
      }
    }
  }

  scene.add(field);

  // NOTE: Insert canvas
  document.body.appendChild(renderer.domElement);

  // NOTE: Animation loop
  const animate = () => {
  	requestAnimationFrame(animate);

    controls.update();
  	renderer.render(scene, camera);
  };

  controls.update();
  animate();
};

app();
