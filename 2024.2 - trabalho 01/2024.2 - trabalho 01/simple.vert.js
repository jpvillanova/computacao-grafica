const vertexShaderSource = `
  attribute vec2 position;
  attribute vec3 color;
  varying vec3 vColor;

  uniform mat4 transformationMatrix;

  void main(void) {
    gl_Position = transformationMatrix * vec4(position, 0.0, 1.0);
    vColor = color;
  }
`;

export default vertexShaderSource;
