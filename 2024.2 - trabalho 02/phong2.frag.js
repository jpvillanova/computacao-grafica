export default
`#version 300 es
precision highp float;

uniform vec4 light_pos;

uniform vec4 light_amb_c;
uniform float light_amb_k;

uniform vec4 light_dif_c;
uniform float light_dif_k;

uniform vec4 light_esp_c;
uniform float light_esp_k;
uniform float light_esp_p;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

uniform sampler2D uColorMap;

in vec4 fPosition;
in vec4 fNormal;
in float fScalar;

out vec4 minhaColor;

void main()
{
  mat4 modelView = u_view * u_model;

  // posição do vértice no sistema da câmera
  vec4 viewPosition = modelView * fPosition;

  // posição final do vertice  
  // normal do vértice no sistema da câmera
  vec4 viewNormal = transpose(inverse(modelView)) * fNormal;
  viewNormal = normalize(viewNormal);

  // posição da luz no sistema da câmera
  vec4 viewLightPos = u_view * light_pos;

  // direção da luz
  vec4 lightDir = normalize(viewLightPos - viewPosition);

  // direção da camera (camera está na origem)
  vec4 cameraDir = normalize(-viewPosition);

  // fator da componente difusa
  float fatorDif = max(0.0, dot(lightDir, viewNormal));

  // fator da componente especular
  vec4 halfVec = normalize(lightDir + cameraDir);
  float fatorEsp = pow(max(0.0, dot(halfVec, viewNormal)), light_esp_p);

  // acesso a textura
  vec2 texCoords = vec2(fScalar, 0);
  vec4 fColor = texture(uColorMap, texCoords);

  // cor final do vértice
  minhaColor = 0.45 * fColor + 0.55 * (light_amb_k * light_amb_c + fatorDif * light_dif_k * light_dif_c + fatorEsp * light_esp_k * light_esp_c);
}`
/*
Uniformes:

Parâmetros da luz (posição, cor, intensidade).
Matrizes e textura.
Entradas:

fPosition: Posição do vértice.
fNormal: Normal do vértice.
fScalar: Coordenada de textura.
Saída:

minhaColor: Cor calculada do fragmento.
Corpo do shader:

Calcula:
Direção e normal da luz no espaço da câmera.
Componentes de iluminação (difusa e especular).
Recupera cor da textura usando fScalar.
Combina os efeitos de iluminação com a cor da textura para determinar a cor final.
 */