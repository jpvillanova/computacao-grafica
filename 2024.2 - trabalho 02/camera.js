export default class Camera {
  
  // usei o construtor para inserir as coordenadas da câmera
  constructor(gl, eye1, eye2, eye3, at1, at2, at3, up1, up2, up3) {  
    // Posição da camera
    this.eye = vec3.fromValues(eye1, eye2, eye3); 
    this.at  = vec3.fromValues(at1, at2, at3); // Para onde a câmera está olhando
    this.up  = vec3.fromValues(up1, up2, up3); // Direção "para cima" da câmera

    // Parâmetros da projeção
    this.fovy = Math.PI / 2; // 90 graus
    this.aspect = gl.canvas.width / gl.canvas.height; // 1.3333

    this.left = -2.5; // -1.0
    this.right = 2.5; // 1.0
    this.top = 2.5; // 1.0
    this.bottom = -2.5; // -1.0

    this.near = 0; // 0.1
    this.far = 5; // 100.0

    // Matrizes View e Projection
    this.view = mat4.create(); // Cria a matriz view
    this.proj = mat4.create(); // Cria a matriz projection
  }

  getView() {
    return this.view; // Retorna a matriz view
  }

  getProj() {
    return this.proj; // Retorna a matriz projection
  }

  updateViewMatrix() {
    mat4.identity( this.view ); // Zera a matriz view
    mat4.lookAt(this.view, this.eye, this.at, this.up); // Atualiza a matriz view
  }

  updateProjectionMatrix(type = '') {
    mat4.identity( this.proj ); // Zera a matriz projection

    if (type === 'ortho') {
      mat4.ortho(this.proj, this.left * 1024/768, this.right * 1024/768, this.bottom , this.top, this.near, this.far); // Atualiza a matriz projection
    } else {
      mat4.perspective(this.proj, this.fovy, this.aspect, this.near, this.far); // Atualiza a matriz projection
    }
  }

  orbit(radius, speed, time) {
    const angle = speed * time; // Calcula o ângulo de rotação baseado no tempo
    const x = radius * Math.cos(angle); // Posição X
    const z = radius * Math.sin(angle); // Posição Z
    this.eye = vec3.fromValues(x, this.eye[1], z); // Atualiza a posição mantendo Y constante
    this.updateViewMatrix(); // Atualiza a matriz de visão
  }
  

  updateCam(type = '') {
    this.updateViewMatrix(); // Atualiza a matriz view
    this.updateProjectionMatrix(type); // Atualiza a matriz projection
  }
}

/*
Construtor (constructor):

Inicializa a câmera com:
eye: Posição da câmera.
at: Para onde a câmera está olhando.
up: Direção "para cima" da câmera.
Parâmetros de projeção, como fovy (campo de visão), aspect (razão de aspecto), near e far (distâncias de corte).
Matrizes de view (vista) e proj (projeção) inicializadas.

getView e getProj:
Retornam, respectivamente, a matriz de visualização e a matriz de projeção.

updateViewMatrix:
Atualiza a matriz view para refletir a posição da câmera (eye), o alvo (at) e a direção "para cima" (up).

updateProjectionMatrix:
Atualiza a matriz proj dependendo do tipo:
ortho: Cria uma projeção ortográfica.
Padrão: Cria uma projeção perspectiva.

updateCam:
Atualiza ambas as matrizes view e proj. 
*/