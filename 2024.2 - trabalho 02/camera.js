export default class Camera {
  constructor(gl, type = 'perspective') {
    // Configurações da câmera perspectiva
    this.cameraPerspective = {
      eye: vec3.fromValues(0.0, 0.0, 200.0), // Posição inicial
      fovy: Math.PI / 2, // Campo de visão
      aspect: gl.canvas.width / gl.canvas.height, // Razão de aspecto
      near: 0.1, // Plano de corte próximo
      far: 1000.0, // Plano de corte distante
      orbitAngle: 0, // Ângulo para movimento orbital
    };

    // Configurações da câmera ortogonal
    this.cameraOrthographic = {
      eye: vec3.fromValues(50.0, 50.0, 50.0), // Posição fixa
      left: -100, // Limite esquerdo
      right: 100, // Limite direito
      top: 100, // Limite superior
      bottom: -100, // Limite inferior
      near: 0.1, // Plano de corte próximo
      far: 1000.0, // Plano de corte distante
    };

    // Parâmetros comuns
    this.at = vec3.fromValues(0.0, 0.0, 0.0); // Origem
    this.up = vec3.fromValues(0.0, 1.0, 0.0); // Direção "para cima"

    // Matrizes
    this.view = mat4.create(); // Matriz de visualização
    this.proj = mat4.create(); // Matriz de projeção

    // Tipo inicial de câmera
    this.type = type;
  }

  getView() {
    return this.view;
  }

  getProj() {
    return this.proj;
  }

  getEye() {
    if (this.type === 'perspective') {
      return this.cameraPerspective.eye;
    } else {
      return this.cameraOrthographic.eye;
    }
  }

  updateViewMatrix() {
    mat4.identity(this.view);

    if (this.type === 'perspective') {
      const params = this.cameraPerspective;

      // Atualiza a posição orbital
      const radius = vec3.length(params.eye);
      const x = radius * Math.cos(params.orbitAngle);
      const z = radius * Math.sin(params.orbitAngle);
      params.eye[0] = x;
      params.eye[2] = z;

      mat4.lookAt(this.view, params.eye, this.at, this.up);
      params.orbitAngle += 0.01; // Incrementa o ângulo para o movimento orbital
    } else if (this.type === 'orthographic') {
      const params = this.cameraOrthographic;
      mat4.lookAt(this.view, params.eye, this.at, this.up);
    }
  }

  updateProjectionMatrix() {
    mat4.identity(this.proj);

    if (this.type === 'perspective') {
      const params = this.cameraPerspective;
      mat4.perspective(this.proj, params.fovy, params.aspect, params.near, params.far);
    } else if (this.type === 'orthographic') {
      const params = this.cameraOrthographic;
      mat4.ortho(
        this.proj,
        params.left,
        params.right,
        params.bottom,
        params.top,
        params.near,
        params.far
      );
    }
  }

  updateCam() {
    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }

  setType(type) {
    this.type = type;
  }
}