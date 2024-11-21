import vertShaderSrc from './simple.vert.js';
import fragShaderSrc from './simple.frag.js';
import Shader from './shader.js';
import { mat4 } from 'gl-matrix';

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
    this.fragShd = Shader.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc); 
    this.program = Shader.createProgram(gl, this.vertShd, this.fragShd);
    this.createUniforms(gl);
    this.createVAO(gl);
  }

  createUniforms(gl) {
    this.matLoc = gl.getUniformLocation(this.program, "transformationMatrix");
  }

  loadModel() {
    this.data = [
      // posição (x,y)
      0.10, 0.80,
      0.10, 0.90,
      0.25, 0.80,
      // Cor (rgb)
      1.0, 0.0, 0.0, // vermelho
      1.0, 0.0, 0.0, 
      1.0, 0.0, 0.0,
      /* Ainda não entendi como usar isso
      // Adicione mais dados conforme necessário
      0.0, 0.0, 1.0, // azul
      0.0, 0.0, 1.0, 
      0.0, 0.0, 1.0, 
      1.0, 0.0, 1.0, // magenta
      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      0.0, 1.0, 1.0, // ciano
      0.0, 1.0, 1.0,
      0.0, 1.0, 1.0,
      */
    ];
  }

  createVAO(gl) {
    this.loadModel(); // Carrega o modelo

    var coordsAttributeLocation = gl.getAttribLocation(this.program, "position"); // Localização do atributo de posição
    var colorsAttributeLocation = gl.getAttribLocation(this.program, "color"); // Localização do atributo de cor

    const dataBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(this.data)); // Cria um buffer de dados
    //Q1
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao); 

    gl.enableVertexAttribArray(coordsAttributeLocation); // Habilita o atributo de posição
    gl.vertexAttribPointer(coordsAttributeLocation, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0); // Define o atributo de posição

    gl.enableVertexAttribArray(colorsAttributeLocation); // Habilita o atributo de cor
    gl.vertexAttribPointer(colorsAttributeLocation, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT); // Define o atributo de cor

    gl.bindVertexArray(null); // Desabilita o VAO
    this.vaoLoc = vao; // Atribui o VAO ao objeto
  }

  draw(gl) {
    gl.useProgram(this.program); // Usa o programa de shader
    gl.bindVertexArray(this.vaoLoc); // Usa o VAO
    this.objectTransformation(); // Aplica a transformação
    gl.uniformMatrix4fv(this.matLoc, false, this.mat); // Define a matriz de transformação
    //Q3
    gl.drawArrays(gl.TRIANGLES, 0, this.data.length / 5); // Desenha o modelo
  }

  objectTransformation() {
    //Q2
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

    this.mat = mat4.create(); // Matriz de transformação
    mat4.multiply(this.mat, translation, scale); // Multiplica as matrizes de translação e escala
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

