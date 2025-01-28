import vertShaderSrc from './phong2.vert.js';
import fragShaderSrc from './phong2.frag.js';

import Shader from './shader.js';
import { HalfEdgeDS } from './half-edge.js';

export default class Mesh {
  constructor(delta) {
    // model data structure
    this.heds = new HalfEdgeDS(); 

    // Matriz de modelagem
    this.angle = 0;
    this.delta = delta;
    this.model = mat4.create();

    // Shader program
    this.vertShd = null;
    this.fragShd = null;
    this.program = null;

    // Data location
    this.vaoLoc = null;
    this.indicesLoc = null;

    // Uniform locations
    this.uModelLoc = null;
    this.uViewLoc = null;
    this.uProjectionLoc = null;
    this.uViewPosLoc = null;

    // texture
    this.colorMap = [];
    this.colorMapLoc = null;
    this.texColorMap = null;
    this.uColorMap = null;
  }

  isReady() { // verifica se a malha está pronta
    return this.heds.isReady(); // verifica se a estrutura está pronta
  }
  
  async loadMeshV4() {
    const resp = await fetch('bunny.obj');
    const text = await resp.text();
    console.log("Loaded OBJ file:", text.substring(0, 200)); // Mostra os primeiros 200 caracteres
  
    const lines = text.split('\n');
    const coords = [];
    const indices = [];
  
    // Para calcular o centro e a altura
    let minY = Infinity;
    let maxY = -Infinity;
    let centroid = [0, 0, 0];
  
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
  
      if (parts[0] === 'v') {
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);
  
        // Atualiza o cálculo do centroide e dos limites verticais
        centroid[0] += x;
        centroid[1] += y;
        centroid[2] += z;
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
  
        coords.push(x, y, z, 1.0);
      } else if (parts[0] === 'f') {
        parts.slice(1).forEach((face) => {
          const vertexIndex = face.split('/')[0];
          indices.push(parseInt(vertexIndex) - 1);
        });
      }
    }
  
    // Calcula o centroide
    centroid = centroid.map((c) => c / (coords.length / 4));
  
    // Calcula a altura do modelo
    const currentHeight = maxY - minY;
  
    // Fator de escala para ajustar a altura para 50
    const scale = 50 / currentHeight;
  
    // Centraliza e escala os vértices
    for (let i = 0; i < coords.length; i += 4) {
      coords[i] = (coords[i] - centroid[0]) * scale; // X
      coords[i + 1] = (coords[i + 1] - centroid[1]) * scale; // Y
      coords[i + 2] = (coords[i + 2] - centroid[2]) * scale; // Z
    }
  
    // Define os dados na estrutura da malha
    this.heds.build(coords, indices);
  }  
  
  createShader(gl) {
    console.log("Creating shaders...");
    try {
      this.vertShd = Shader.createShader(gl, gl.VERTEX_SHADER, vertShaderSrc);
      console.log("Vertex shader created");
      
      this.fragShd = Shader.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);
      console.log("Fragment shader created");
      
      this.program = Shader.createProgram(gl, this.vertShd, this.fragShd);
      console.log("Shader program created:", this.program);
      
      if (!this.program) {
        throw new Error("Failed to create shader program");
      }
    } catch (error) {
      console.error("Error creating shaders:", error);
      throw error;
    }
  }

  createUniforms(gl) {
    console.log("Creating uniforms...");
  
    if (!this.program) {
      console.error("Shader program not initialized");
      return;
    }
  
    gl.useProgram(this.program);
  
    // Matriz de transformação
    this.uModelLoc = gl.getUniformLocation(this.program, "u_model");
    this.uViewLoc = gl.getUniformLocation(this.program, "u_view");
    this.uProjectionLoc = gl.getUniformLocation(this.program, "u_projection");
  
    // Posição da câmera
    this.uViewPosLoc = gl.getUniformLocation(this.program, "viewPos");
  
    // Textura
    this.uColorMap = gl.getUniformLocation(this.program, "uColorMap");
    gl.uniform1i(this.uColorMap, 0); // Vincula ao unit 0
  }  

  createVAO(gl) {
    console.log("Creating VAO...");
    if (!this.program) {
      console.error("Shader program not initialized");
      return;
    }

    const vbos = this.heds.getVBOs();
    console.log("VBOs created:", vbos);

    // Create and bind VAO first
    this.vaoLoc = gl.createVertexArray();
    gl.bindVertexArray(this.vaoLoc);

    // Position attribute
    const coordsAttributeLocation = gl.getAttribLocation(this.program, "position");
    const coordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbos[0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(coordsAttributeLocation);
    gl.vertexAttribPointer(coordsAttributeLocation, 4, gl.FLOAT, false, 0, 0);

    // Normal attribute
    const normalAttributeLocation = gl.getAttribLocation(this.program, "normal");
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbos[2]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    // Create and bind element buffer
    this.indicesLoc = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesLoc);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(vbos[3]), gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    console.log("VAO created successfully");
  }

  async init(gl, lights) {
    console.log("Initializing mesh...");
    try {
      await this.loadMeshV4();
      this.createShader(gl); // Criação do programa
      this.createUniforms(gl); // Configura uniforms
      this.createVAO(gl); // Configura buffers e VAO
  
      // Configura as luzes no shader
      if (lights) {
        lights.forEach((light, index) => {
          light.createUniforms(gl, this.program, index);
        });
      }
  
      console.log("Mesh initialization completed successfully");
    } catch (error) {
      console.error("Error during mesh initialization:", error);
      throw error;
    }
  }  

  draw(gl, cam, lights) {
    if (!this.program) {
      console.error("Shader program not initialized");
      return;
    }

    if (!this.uModelLoc || !this.uViewLoc || !this.uProjectionLoc) {
      console.error("Uniform locations not properly initialized", {
        uModelLoc: this.uModelLoc,
        uViewLoc: this.uViewLoc,
        uProjectionLoc: this.uProjectionLoc
      });
      return;
    }

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vaoLoc);

    // Configurações de renderização
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Atualiza a matriz modelo
    this.updateModelMatrix();

    // Envia as matrizes para o shader
    gl.uniformMatrix4fv(this.uModelLoc, false, this.model);
    gl.uniformMatrix4fv(this.uViewLoc, false, cam.getView());
    gl.uniformMatrix4fv(this.uProjectionLoc, false, cam.getProj());

    // Atualiza a posição da câmera
    if (this.uViewPosLoc) {
      const eye = cam.eye;
      gl.uniform3f(this.uViewPosLoc, eye[0], eye[1], eye[2]);
    }

    // Atualiza as luzes
    if (lights) {
      lights.forEach((light, index) => {
        light.createUniforms(gl, this.program, index);
      });
    }

    // Desenha
    gl.drawElements(gl.TRIANGLES, this.heds.faces.length * 3, gl.UNSIGNED_INT, 0);

    // Limpa estado
    gl.disable(gl.CULL_FACE);
    gl.bindVertexArray(null);
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

  draw(gl, cam, lights) {
    if (!this.program) {
      console.error("Shader program not initialized");
      return;
    }
  
    // Habilitar face culling (evita renderizar faces traseiras)
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  
    // Atualiza as transformações da matriz de modelo
    this.updateModelMatrix();
  
    const model = this.model; // matriz model
    const view = cam.getView(); // matriz view
    const proj = cam.getProj(); // matriz projection
  
    gl.useProgram(this.program); // Ativa o shader program
  
    // Envia as matrizes para o shader
    gl.uniformMatrix4fv(this.uModelLoc, false, model);
    gl.uniformMatrix4fv(this.uViewLoc, false, view);
    gl.uniformMatrix4fv(this.uProjectionLoc, false, proj);
  
    // Envia a posição da câmera
    if (this.uViewPosLoc) {
      const eye = cam.getEye();
      gl.uniform3f(this.uViewPosLoc, eye[0], eye[1], eye[2]);
    }
  
    // Atualiza as luzes no shader
    if (lights && Array.isArray(lights)) {
      lights.forEach((light, index) => {
        light.createUniforms(gl, this.program, index);
      });
    }
  
    // Ativa e configura a textura
    gl.activeTexture(gl.TEXTURE0); // Unidade de textura 0
    gl.bindTexture(gl.TEXTURE_2D, this.texColorMap); // Vincula a textura
    gl.uniform1i(this.uColorMap, 0); // Vincula ao uniform no shader
  
    // Desenha os elementos
    gl.bindVertexArray(this.vaoLoc); // Vincula o VAO
    gl.drawElements(gl.TRIANGLES, this.heds.faces.length * 3, gl.UNSIGNED_INT, 0);
  
    // Limpa o estado
    gl.bindVertexArray(null);
    gl.useProgram(null);
    gl.disable(gl.CULL_FACE); // Desabilita o face culling
  }  
}