import vertShaderSrc from './simple.vert.js';
import fragShaderSrc from './simple.frag.js';
import Shader from './shader.js';

class Scene {
  constructor(gl) {
    this.data = []; // Array de dados a serem carregados no VBO

    this.delta = 0; 
    this.mat = mat4.create(); // Matriz de transformação
    this.matLoc = -1; // Localização da matriz de transformação no shader

    this.vertShd = null; // Shader de vértices
    this.fragShd = null; // Shader de fragmentos
    this.program = null; // Programa de shader

    this.vaoLoc = -1; // Localização do VAO

    this.init(gl); // Inicialização
  }

  init(gl) {
    this.vertShd = Shader.createShader(gl, gl.VERTEX_SHADER, vertShaderSrc); 
    // Criação do shader de vértices
    this.fragShd = Shader.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc); 
    // Criação do shader de fragmentos
    this.program = Shader.createProgram(gl, this.vertShd, this.fragShd); 
    // Criação do programa de shader

    this.createUniforms(gl); // Criação das variáveis uniformes
    this.createVAO(gl); // Criação do VAO
  }

  createUniforms(gl) {
    this.matLoc = gl.getUniformLocation(this.program, "transformationMatrix"); 
    // Localização da matriz de transformação no shader
  }

  loadModel() {
    this.data = [
      // posição (x,y)
      0.10, 0.80,
      0.10, 0.90,
      0.25, 0.80,
      0.25, 0.80,
      0.40, 0.90,
      0.40, 0.80,
      0.10, 0.50,
      0.40, 0.80,
      0.10, 0.80,
      0.10, 0.50,
      0.40, 0.50,
      0.40, 0.80,
      0.40, 0.10,
      0.80, 0.50,
      0.40, 0.50,
      0.40, 0.10,
      0.80, 0.10,
      0.80, 0.50,
      0.80, 0.10,
      0.90, 0.10,
      0.80, 0.30,
      // Cor (rgb)
      1.0, 0.0, 0.0, 
      1.0, 0.0, 0.0, 
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      0.0, 1.0, 1.0,
      0.0, 1.0, 1.0,
      0.0, 1.0, 1.0,
    ];
  }

  createVAO(gl) {
    this.loadModel(); // Carrega o modelo

    var coordsAttributeLocation = gl.getAttribLocation(this.program, "position"); 
    // Localização do atributo de posição no shader

    var colorsAttributeLocation = gl.getAttribLocation(this.program, "color"); 
    // Localização do atributo de cor no shader

    // Criação do VBO (Shader.createBuffer)
    const dataBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(this.data)); 


    // Criação do VAO
    // Q1) Escreva a implementação da função abaixo, que constroi um VAO contendo informações de posicão e
    // cores, e esteja de acordo com a estrutura do array "this.data"
    const vao = Shader.createVAO(gl, coordsAttributeLocation, colorsAttributeLocation, dataBuffer);

    this.vaoLoc = vao; // Atribuição do VAO
  }

  objectTransformation() {
    // Q2) Escreva matrizes de transformação que façam a coleção de triângulos dada em "this.data".
    // a) Estar centrada na posição (0,0).
    // b) Ter largura e altura igual a 1.8.
    const translation = [
      1, 0, 0, -0.5,
      0, 1, 0, -0.5,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]; // Matriz de translação

    const scale = [
      1.8, 0, 0, 0,
      0, 1.8, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]; // Matriz de escala

    this.mat = [
      translation[0] * scale[0], translation[1] * scale[4], translation[2] * scale[8], translation[3] * scale[12],
      translation[4] * scale[1], translation[5] * scale[5], translation[6] * scale[9], translation[7] * scale[13],
      translation[8] * scale[2], translation[9] * scale[6], translation[10] * scale[10], translation[11] * scale[14],
      translation[12] * scale[3], translation[13] * scale[7], translation[14] * scale[11], translation[15] * scale[15]
    ]; // Matriz de transformação
  }

  draw(gl) {  
    gl.useProgram(this.program);
    // Usa o shader program

    gl.bindVertexArray(this.vaoLoc);

    this.objectTransformation();
    gl.uniformMatrix4fv(this.matLoc, false, this.mat);

    // Q3) Implemente o comando dl.drawArrays adequado para o programa em questão
    gl.drawArrays(gl.TRIANGLES, 0, this.data.length / 5);
  }
}

class Main {
  constructor() {
    const canvas = document.querySelector("#glcanvas");
    this.gl = canvas.getContext("webgl2");

    var devicePixelRatio = window.devicePixelRatio || 1;
    this.gl.canvas.width = 1024 * devicePixelRatio; 
    this.gl.canvas.height = 768 * devicePixelRatio;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.scene = new Scene(this.gl);
  }

  draw() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.scene.draw(this.gl);

    requestAnimationFrame(this.draw.bind(this));
  }
}

window.onload = () => {
  const app = new Main();
  app.draw();
}

