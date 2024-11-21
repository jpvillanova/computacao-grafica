const vertShaderSrc = `
#version 300 es
in vec4 position;
in vec4 color;
out vec4 vColor;
uniform mat4 transformationMatrix;

void main(void) {
  gl_Position = transformationMatrix * position;
  vColor = color;
}
`;

export default vertShaderSrc;
