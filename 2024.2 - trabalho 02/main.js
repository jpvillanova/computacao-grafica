import Camera from './camera.js';
import Light from './light.js';
import Mesh from './mesh.js';

class Scene {
  constructor(gl) {
    this.cam = new Camera(gl);

    // Create two lights with different positions and colors
    this.lights = [
      new Light(
        vec4.fromValues(-100.0, 100.0, 0.0, 1.0),  // White light position
        vec4.fromValues(1.0, 1.0, 1.0, 1.0)        // White color
      ),
      new Light(
        vec4.fromValues(100.0, 100.0, 0.0, 1.0),   // Yellow light position
        vec4.fromValues(1.0, 1.0, 0.0, 1.0)        // Yellow color
      )
    ];

    this.mesh = new Mesh(1.0);
    this.copy = new Mesh(-1.0);
  }

  async init(gl) {
    await this.mesh.loadMeshV4();
    this.mesh.init(gl, this.lights);

    await this.copy.loadMeshV4();
    this.copy.init(gl, this.lights);
  }

  draw(gl) {
    this.cam.updateCam();

    this.mesh.init(gl, this.lights); // Inicializa a malha
    
    this.mesh.draw(gl, this.cam, this.lights);
    this.copy.draw(gl, this.cam, this.lights);
  }

  toggleCamera() {
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