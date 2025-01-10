export default class Light {
  constructor(posX, posY, posZ, amb_c_R, amb_c_G, amb_c_B) {
    this.pos = vec4.fromValues(posX, posY, posZ, 1.0); // light position

    this.amb_c = vec4.fromValues(amb_c_R, amb_c_G, amb_c_B, 1.0); // ambient color
    this.amb_k = 0.2;

    this.dif_c = vec4.fromValues(1.0, 1.0, 1.0, 1.0); // diffuse color
    this.dif_k = 0.6;

    this.esp_c = vec4.fromValues(1.0, 1.0, 1.0, 1.0); // specular color
    this.esp_k = 0.3; // specular coefficient
    this.esp_p = 5.0; // specular exponent
  }

  createUniforms(gl, program){ // cria os uniformes da luz
    const posLoc = gl.getUniformLocation(program, "light_pos");
    gl.uniform4fv(posLoc, this.pos); // envia a posição da luz para o shader

    const ambCLoc = gl.getUniformLocation(program, "light_amb_c"); 
    gl.uniform4fv(ambCLoc, this.amb_c); // envia a cor ambiente para o shader
    const ambKLoc = gl.getUniformLocation(program, "light_amb_k")
    gl.uniform1f(ambKLoc, this.amb_k); // envia o coeficiente ambiente para o shader

    const difCLoc = gl.getUniformLocation(program, "light_dif_c");
    gl.uniform4fv(difCLoc, this.dif_c); // envia a cor difusa para o shader
    const difKLoc = gl.getUniformLocation(program, "light_dif_k")
    gl.uniform1f(difKLoc, this.dif_k); // envia o coeficiente difuso para o shader

    const espCLoc = gl.getUniformLocation(program, "light_esp_c");
    gl.uniform4fv(espCLoc, this.pos); // envia a cor especular para o shader
    const espKLoc = gl.getUniformLocation(program, "light_esp_k")
    gl.uniform1f(espKLoc, this.esp_k); // envia o coeficiente especular para o shader
    const espPLoc = gl.getUniformLocation(program, "light_esp_p")
    gl.uniform1f(espPLoc, this.esp_p); // envia o expoente especular para o shader
  }

  updateLight() {
    this.pos = vec4.fromValues(2.0, 2.0, 2.0, 1.0); // light position
    this.amb_c = vec4.fromValues(1.0, 1.0, 1.0, 1.0); // ambient color
    this.amb_k = 0.2;
    this.dif_c = vec4.fromValues(1.0, 1.0, 1.0, 1.0); // diffuse color
    this.dif_k = 0.6;
    this.esp_c = vec4.fromValues(1.0, 1.0, 1.0, 1.0); // specular color
    this.esp_k = 0.3; // specular coefficient
    this.esp_p = 5.0; // specular exponent
  }
}

/*
Classe Light
Atributos
pos:

Posição da luz no espaço 3D com coordenadas homogêneas [x, y, z, w].
Exemplo: [2.0, 2.0, 2.0, 1.0] coloca a luz na posição (2, 2, 2).

amb_c e amb_k (Luz Ambiente):
amb_c: Cor ambiente da luz, especificada como [R, G, B, A].
Exemplo: [1.0, 1.0, 1.0, 1.0] representa luz branca.
amb_k: Intensidade (ou coeficiente) da luz ambiente.

dif_c e dif_k (Luz Difusa):
dif_c: Cor difusa da luz, que depende da posição da luz e da orientação da superfície.
dif_k: Coeficiente que controla a intensidade da luz difusa.

esp_c, esp_k e esp_p (Luz Especular):
esp_c: Cor especular da luz.
esp_k: Coeficiente especular, que controla a intensidade da reflexão especular.
esp_p: Expoente especular, que determina o brilho do reflexo (valores maiores resultam em reflexos mais concentrados).

Métodos
createUniforms(gl, program)
Configura os uniforms nos shaders, enviando as propriedades da luz para serem usadas durante a renderização.
Etapas:
Posição da luz:
Localiza o uniform light_pos no shader.
Envia o vetor pos para o shader com gl.uniform4fv.
Propriedades da luz ambiente:
Envia a cor (light_amb_c) e o coeficiente (light_amb_k) da luz ambiente.
Propriedades da luz difusa:
Envia a cor (light_dif_c) e o coeficiente (light_dif_k) da luz difusa.
Propriedades da luz especular:
Envia a cor (light_esp_c), o coeficiente (light_esp_k) e o expoente (light_esp_p) da luz especular.
Propósito:

Os shaders utilizam esses valores para calcular o impacto da luz na cena (por exemplo, sombreamento Phong ou Blinn-Phong).
updateLight()

Atualiza as propriedades da luz com valores padrão.
Embora a implementação atual apenas redefina os mesmos valores atribuídos no construtor, essa função pode ser modificada para permitir movimentar a luz ou alterar suas propriedades dinamicamente.
Integração com Shaders
Essa classe é projetada para interagir diretamente com shaders GLSL (vertex e fragment shaders).
Os uniformes definidos aqui (light_pos, light_amb_c, light_dif_c, etc.) correspondem aos uniformes esperados nos shaders, como visto nos arquivos de shader previamente analisados (phong.vert.js e phong2.frag.js).
 */