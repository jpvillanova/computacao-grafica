export default class Camera {
  constructor(gl) {
    // Posição da camera
    this.eye = vec3.fromValues(1.0, 1.0, 1.0);
    this.at  = vec3.fromValues(0.0, 0.0, 0.0);
    this.up  = vec3.fromValues(0.0, 1.0, 0.0);

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

  updateCam() {
    this.updateViewMatrix(); // Atualiza a matriz view
    this.updateProjectionMatrix(); // Atualiza a matriz projection
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