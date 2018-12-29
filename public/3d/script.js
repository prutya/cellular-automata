// import { mat4 } from 'glMatrix';

const run = () => {
  const canvas = document.querySelector('#field');
  const gl     = canvas.getContext('webgl');

  if (!gl) {
    const alertBox = document.querySelector('#alert-webgl');
    alertBox.classList.remove('alert--hidden');
  }

  const vertexShaderText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;

    varying vec3 fragColor;

    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main() {
      fragColor = vertColor;
      gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    }
  `;

  const fragmentShaderText = `
    precision mediump float;

    varying vec3 fragColor;

    void main() {
      gl_FragColor = vec4(fragColor, 1.0);
    }
  `;

  const vertexShader   = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(
      'Error compiling vertex shader.',
      gl.getShaderInfoLog(vertexShader),
    );

    return;
  }

  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(
      'Error compiling fragment shader.',
      gl.getShaderInfoLog(fragmentShader),
    );

    return;
  }

  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Error linking program.', gl.getProgramInfoLog(program));
    return;
  }

  gl.validateProgram(program);

  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('Error validating program.', gl.getProgramInfoLog(program));
    return;
  }

  const boxVertices = [
     // Top
     -1.0,  1.0, -1.0,   1.0, 1.0, 0.0,
     -1.0,  1.0,  1.0,   1.0, 1.0, 0.0,
      1.0,  1.0,  1.0,   1.0, 1.0, 0.0,
      1.0,  1.0, -1.0,   1.0, 1.0, 0.0,

     // Left
     -1.0,  1.0,  1.0,   0.7, 0.0, 0.1,
     -1.0, -1.0,  1.0,   0.7, 0.0, 0.1,
     -1.0, -1.0, -1.0,   0.7, 0.0, 0.1,
     -1.0,  1.0, -1.0,   0.7, 0.0, 0.1,

     // Right
      1.0,  1.0,  1.0,   0.0, 0.5, 0.5,
      1.0, -1.0,  1.0,   0.0, 0.5, 0.5,
      1.0, -1.0, -1.0,   0.0, 0.5, 0.5,
      1.0,  1.0, -1.0,   0.0, 0.5, 0.5,

     // Front
      1.0,  1.0,  1.0,   0.0, 1.0, 0.7,
      1.0, -1.0,  1.0,   0.0, 1.0, 0.7,
     -1.0, -1.0,  1.0,   0.0, 1.0, 0.7,
     -1.0,  1.0,  1.0,   0.0, 1.0, 0.7,

     // Back
      1.0,  1.0, -1.0,   0.3, 0.2, 0.5,
      1.0, -1.0, -1.0,   0.3, 0.2, 0.5,
     -1.0, -1.0, -1.0,   0.3, 0.2, 0.5,
     -1.0,  1.0, -1.0,   0.3, 0.2, 0.5,

     // Bottom
     -1.0, -1.0, -1.0,   0.1, 0.5, 0.2,
     -1.0, -1.0,  1.0,   0.1, 0.5, 0.2,
      1.0, -1.0,  1.0,   0.1, 0.5, 0.2,
      1.0, -1.0, -1.0,   0.1, 0.5, 0.2,
  ];

  const boxIndices = [
    // Top
    0, 1, 2,
    0, 2, 3,

    // Left
    5, 4, 6,
    6, 4, 7,

    // Right
    8, 9, 10,
    8, 10, 11,

    // Front
    13, 12, 14,
    15, 14, 12,

    // Back
    16, 17, 18,
    16, 18, 19,

    // Bottom
    21, 20, 22,
    22, 20, 23,
  ];

  const boxVerticesBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVerticesBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

  const boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

  const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  const colorAttribLocation    = gl.getAttribLocation(program, 'vertColor');

  gl.vertexAttribPointer(
    positionAttribLocation,
    3, // Number of values
    gl.FLOAT, // Type
    gl.FALSE, // ?
    6 * Float32Array.BYTES_PER_ELEMENT, // Vertex size
    0 // Offset
  );

  gl.vertexAttribPointer(
    colorAttribLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  gl.useProgram(program);

  const matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
  const matViewUniformLocation  = gl.getUniformLocation(program, 'mView');
  const matProjUniformLocation  = gl.getUniformLocation(program, 'mProj');

  const matWorld = new Float32Array(16);
  const matView  = new Float32Array(16);
  const matProj  = new Float32Array(16);

  mat4.identity(matWorld);

  mat4.lookAt(
    matView,
    [0, 0, -5.5],
    [0, 0, 0],
    [0, 1, 0]
  );

  mat4.perspective(
    matProj,
    glMatrix.toRadian(45),
    canvas.width / canvas.height,
    0.1,
    1000.0
  );

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matWorld);
  gl.uniformMatrix4fv(matViewUniformLocation,  gl.FALSE, matView);
  gl.uniformMatrix4fv(matProjUniformLocation,  gl.FALSE, matProj);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  const matRotateX = new Float32Array(16);
  const matRotateY = new Float32Array(16);

  const identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  let angle;

  const loop = () => {
    angle = performance.now() / 1000 / 6 * 2 * Math.PI;

    mat4.rotate(matRotateX, identityMatrix, angle, [0, 1, 0]);
    mat4.rotate(matRotateY, identityMatrix, angle, [1, 0, 0]);
    mat4.mul(matWorld, matRotateX, matRotateY);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matWorld);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
};

run();
