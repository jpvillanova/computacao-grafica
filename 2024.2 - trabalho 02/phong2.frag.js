export default
`#version 300 es
precision highp float;

uniform sampler2D uColorMap;

in vec3 v_normal;
in vec2 v_texCoord;

out vec4 fragColor;

void main() {
    vec3 lightDir = normalize(vec3(0.0, 1.0, 1.0));
    vec3 norm = normalize(v_normal);

    float diff = max(dot(norm, lightDir), 0.0);
    vec4 texColor = texture(uColorMap, v_texCoord);

    fragColor = vec4(diff * texColor.rgb, 1.0);
}
`
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