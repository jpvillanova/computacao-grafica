import Camera from './camera.js';
import Light from './light.js';
import Mesh from './mesh.js';

class Scene {
  constructor(gl) {
    // Inicializa a câmera
    this.cam = new Camera(gl);

    // Configurações de luz
    this.light = new Light();

    // Objetos da cena
    this.mesh = new Mesh(1.0);
    this.copy = new Mesh(-1.0);
  }

  async init(gl) {
    await this.mesh.loadMeshV4();
    this.mesh.init(gl, this.light);

    await this.copy.loadMeshV4();
    this.copy.init(gl, this.light);
  }

  draw(gl) {
    this.cam.updateCam(); // Atualiza a câmera ativa
    this.light.updateLight();

    // Renderiza os objetos
    this.mesh.draw(gl, this.cam, this.light);
    this.copy.draw(gl, this.cam, this.light);
  }

  toggleCamera() {
    // Alterna entre perspectiva e ortogonal
    this.cam.setType(this.cam.type === 'perspective' ? 'orthographic' : 'perspective');
    console.log(`Câmera alterada para: ${this.cam.type}`);
  }
}
class Main {
  constructor() {
    const canvas = document.querySelector("#glcanvas");

    this.gl = canvas.getContext("webgl2");
    this.setViewport();

    this.scene = new Scene(this.gl);
    this.scene.init(this.gl).then(() => {
      this.setupUI();
      this.draw();
    });
  }

  setViewport() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    this.gl.canvas.width = 1024 * devicePixelRatio;
    this.gl.canvas.height = 768 * devicePixelRatio;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }

  setupUI() {
    const toggleCameraButton = document.getElementById('toggleCamera');
    toggleCameraButton.addEventListener('click', () => {
      this.scene.toggleCamera();
    });
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
};