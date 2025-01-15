import vertShaderSrc from './phong2.vert.js';
import fragShaderSrc from './phong2.frag.js';

import Shader from './shader.js';
import { HalfEdgeDS } from './half-edge.js';

export default class Mesh {
  constructor(delta) {
    // model data structure
    this.heds = new HalfEdgeDS(); 

    // Matriz de modelagem
    this.angle = 0; // ângulo de rotação
    this.delta = delta; // deslocamento
    this.model = mat4.create(); // Cria a matriz model

    // Shader program
    this.vertShd = null; // vertex shader
    this.fragShd = null; // fragment shader
    this.program = null; // shader program

    // Data location
    this.vaoLoc = -1; // vertex array object
    this.indicesLoc = -1; // indices

    this.uModelLoc = -1; // model matrix
    this.uViewLoc = -1; // view matrix
    this.uProjectionLoc = -1; // projection matrix

    // texture
    this.colorMap = []; // color map
    this.colorMapLoc = -1; // color map location

    this.texColorMap = -1; // texture color map
    this.uColorMap = -1; // uniform color map
  }

  isReady() { // verifica se a malha está pronta
    return this.heds.isReady(); // verifica se a estrutura está pronta
  }
  
  async loadMeshV4() {
    const resp = await fetch('bunny.obj');
    const text = await resp.text();
    console.log("Loaded OBJ file:", text.substring(0, 200)); // Show first 200 chars

    const lines = text.split('\n');
    const coords = [];
    const indices = [];
    const normals = [];

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);

      if (parts[0] === 'v') {
        // Vertex coordinates
        coords.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3]),
          1.0 
        );
      } else if (parts[0] === 'vn') {
        // Vertex normals
        normals.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3]),
          0.0
        );
      } else if (parts[0] === 'f') {
        // Face indices
        parts.slice(1).forEach((face) => {
          const vertexIndex = face.split('/')[0];
          indices.push(parseInt(vertexIndex) - 1);
        });
      }
    }
  
    // Set the data in your mesh structure
    this.heds.build(coords, indices);
  }  
  
  createShader(gl) { // cria o shader
    this.vertShd = Shader.createShader(gl, gl.VERTEX_SHADER, vertShaderSrc); // cria o vertex shader
    this.fragShd = Shader.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc); // cria o fragment shader
    this.program = Shader.createProgram(gl, this.vertShd, this.fragShd); // cria o shader program

    gl.useProgram(this.program); // usa o shader program
  }

  createUniforms(gl) { // cria os uniformes
    this.uModelLoc = gl.getUniformLocation(this.program, "u_model"); // model matrix
    this.uViewLoc = gl.getUniformLocation(this.program, "u_view"); // view matrix
    this.uProjectionLoc = gl.getUniformLocation(this.program, "u_projection"); // projection matrix
  }

  createVAO(gl) { // cria o vertex array object
    const vbos = this.heds.getVBOs(); // pega os VBOs
    console.log(vbos); // imprime os VBOs

    var coordsAttributeLocation = gl.getAttribLocation(this.program, "position"); // pega a posição
    const coordsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[0])); // cria o buffer

    var scalarsAttributeLocation = gl.getAttribLocation(this.program, "scalar"); // pega o escalar
    const scalarsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[1])); // cria o buffer

    var normalsAttributeLocation = gl.getAttribLocation(this.program, "normal"); // pega a normal
    const normalsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[2])); // cria o buffer

    // Create a vertex array object (attribute state)
    this.vaoLoc = Shader.createVAO(gl,
      coordsAttributeLocation, coordsBuffer, 
      scalarsAttributeLocation, scalarsBuffer, 
      normalsAttributeLocation, normalsBuffer);

    this.indicesLoc = Shader.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(vbos[3])); // cria o buffer
  }

  createTex(gl) { // cria a textura
    this.uColorMap = gl.getUniformLocation(this.program, 'uColorMap'); // pega a textura

    this.texColorMap = gl.createTexture(); // cria a textura
    gl.bindTexture(gl.TEXTURE_2D, this.texColorMap); // bind the texture so we can work with it

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // seta o wrap s
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // seta o wrap t
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // seta o filtro min
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // seta o filtro mag
  
    // Upload the image into the texture.
    const texData = [
      213,62,79,255,
      244,109,67,255,
      253,174,97,255,
      254,224,139,255,
      230,245,152,255,
      171,221,164,255,
      102,194,165,255,
      50,136,189,255
    ].map(d => d / 255);

    console.log("=====>", texData); // imprime a textura

    const size = [8, 1]; // tamanho da textura
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, size[0], size[1], 0, gl.RGBA, gl.FLOAT, new Float32Array(texData)); // cria a textura

    // set which texture units to render with.
    gl.activeTexture(gl.TEXTURE0); // seta a textura
    gl.uniform1i(this.uColorMap, gl.TEXTURE0); // seta a textura
  }

  init(gl, light) { // inicializa a malha
    this.createShader(gl); // cria o shader
    this.createUniforms(gl); // cria os uniformes
    this.createVAO(gl); // cria o vertex array object
    this.createTex(gl); // cria a textura

    light.createUniforms(gl, this.program); // cria os uniformes da luz
  }

  updateModelMatrix() { // atualiza a matriz model
    this.angle += 0.005; // incrementa o ângulo

    mat4.identity( this.model ); // Zera a matriz model
    mat4.translate(this.model, this.model, [this.delta, 0, 0]); 
    // [1 0 0 delta, 0 1 0 0, 0 0 1 0, 0 0 0 1] * this.mat 

    mat4.rotateY(this.model, this.model, this.angle);
    // [ cos(this.angle) 0 -sin(this.angle) 0, 
    //         0         1        0         0, 
    //   sin(this.angle) 0  cos(this.angle) 0, 
    //         0         0        0         1]
    // * this.mat 

    mat4.translate(this.model, this.model, [-0.25, -0.25, -0.25]);
    // [1 0 0 -0.5, 0 1 0 -0.5, 0 0 1 -0.5, 0 0 0 1] * this.mat 

    mat4.scale(this.model, this.model, [5, 5, 5]);
    // [5 0 0 0, 0 5 0 0, 0 0 5 0, 0 0 0 1] * this.mat 
  }

  draw(gl, cam, light) {
    // faces orientadas no sentido anti-horário
    gl.frontFace(gl.CCW);

    // face culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // updates the model transformations
    this.updateModelMatrix();

    const model = this.model; // model matrix
    const view = cam.getView(); // view matrix
    const proj = cam.getProj(); // projection matrix

    gl.useProgram(this.program); // usa o shader program
    gl.uniformMatrix4fv(this.uModelLoc, false, model); // envia a matriz model para o shader
    gl.uniformMatrix4fv(this.uViewLoc, false, view); // envia a matriz view para o shader
    gl.uniformMatrix4fv(this.uProjectionLoc, false, proj); // envia a matriz projection para o shader

    gl.drawElements(gl.TRIANGLES, this.heds.faces.length * 3, gl.UNSIGNED_INT, 0); // desenha os elementos

    gl.disable(gl.CULL_FACE); // desabilita o cull face
  }
}

/* 
Construtor (constructor):

Define:
Estrutura de dados heds (Half-Edge Data Structure) para modelagem de malhas.
Matriz model para transformação do modelo.
Shaders (vertShd e fragShd) e programa GLSL (program).
Variáveis relacionadas à textura e buffers.
isReady:

Verifica se a estrutura da malha está pronta.
loadMeshV4:

Lê dados de um arquivo .obj, extrai vértices e índices e os constrói na estrutura heds.
createShader:

Compila e cria o programa de shaders para o modelo.
createUniforms:

Configura os locais dos uniformes usados nos shaders (matrizes de transformação).
createVAO:

Configura buffers de vértices (vbos), normais e índices para renderização.
createTex:

Cria uma textura baseada em dados RGBA definidos e a carrega no GPU.
init:

Inicializa os shaders, uniformes, buffers e textura.
updateModelMatrix:

Atualiza a matriz de transformação do modelo aplicando translações, rotações e escalas.
draw:

Configura as propriedades de renderização (como culling).
Atualiza a matriz do modelo e renderiza o objeto com drawElements.
 */