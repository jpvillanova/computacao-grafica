export default 
`#version 300 es
precision highp float;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

uniform sampler2D uColorMap;

in vec4 position;
in vec4 normal;
in float scalar;

out vec4 fPosition;
out vec4 fColor;
out vec4 fNormal;

void main() {
  mat4 modelView = u_view * u_model;

  // posição final do vertice
  gl_Position  = u_projection * modelView * position;

  fPosition = position;

  vec2 texCoords = vec2(scalar, 0);
  fColor = texture(uColorMap, texCoords);

  fNormal = normal;
}`

/* 
Uniformes:

Matrizes de modelo (u_model), visão (u_view) e projeção (u_projection).
Textura (uColorMap).
Entradas:

position: Posição do vértice.
normal: Vetor normal do vértice.
scalar: Valor escalar para mapeamento de textura.
Saídas:

fPosition: Posição do vértice.
fColor: Cor do vértice (obtida da textura).
fNormal: Normal transformada.
Corpo do shader:

Calcula a posição final do vértice (gl_Position).
Gera coordenadas para textura e recupera a cor correspondente.
Passa a normal transformada para o fragment shader.
 */