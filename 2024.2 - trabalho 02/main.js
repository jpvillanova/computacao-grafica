import Camera from './camera.js';
import Light from './light.js';
import Mesh from './mesh.js';

class Scene {
  constructor(gl) {
    // Camera virtual
    this.cam = new Camera(gl);

    // Luz
    this.light = new Light();

    // Mesh
    this.mesh = new Mesh( 1.0);
    this.copy = new Mesh(-1.0);
  }

  async init(gl) {
    await this.mesh.loadMeshV4();
    this.mesh.init(gl, this.light);

    await this.copy.loadMeshV4()
    this.copy.init(gl, this.light);
  }

  draw(gl) {  
    this.cam.updateCam();
    this.light.updateLight();

    this.mesh.draw(gl, this.cam, this.light);
    this.copy.draw(gl, this.cam, this.light);
  }
}

class Main {
  constructor() {
    const canvas = document.querySelector("#glcanvas");

    this.gl = canvas.getContext("webgl2");
    this.setViewport();

    this.scene = new Scene(this.gl);
    this.scene.init(this.gl).then(() => {
      this.draw();
    });
  }

  setViewport() {
    var devicePixelRatio = window.devicePixelRatio || 1;
    this.gl.canvas.width = 1024 * devicePixelRatio;
    this.gl.canvas.height = 768 * devicePixelRatio;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
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

/* 
Classe Scene
Responsável por gerenciar os componentes da cena (câmera, luz e malhas) e sua renderização.

Atributos
cam:
Instância da classe Camera, responsável por definir e atualizar a visão e projeção da cena.

light:
Instância da classe Light, que gerencia as propriedades da luz.

mesh e copy:
Instâncias da classe Mesh, representando as malhas a serem renderizadas na cena.
A diferença entre elas é o deslocamento (delta) aplicado durante a inicialização.


Métodos
constructor(gl):
Inicializa os componentes principais: câmera, luz e duas malhas (mesh e copy).

init(gl):
Carrega as malhas com loadMeshV4 (assincronamente).
Inicializa as malhas (init), incluindo a configuração dos shaders, buffers e texturas.

draw(gl):
Atualiza os estados da câmera e da luz.
Renderiza as duas malhas (mesh e copy), chamando seus métodos draw.

Classe Main
Gerencia a aplicação principal, incluindo o contexto WebGL2 e o loop de renderização.

Atributos
gl:
Contexto WebGL2 associado ao elemento <canvas>.

scene:
Instância da classe Scene, que encapsula os objetos da cena e os métodos para renderizá-los.

Métodos

constructor():
Obtém o contexto WebGL2 do elemento <canvas>.
Configura o viewport (área de renderização).
Inicializa a cena.

setViewport():
Ajusta o tamanho do canvas e define o viewport, levando em consideração o devicePixelRatio para dispositivos de alta densidade de pixels.

draw():
Limpa o buffer de cor e profundidade.
Verifica se as malhas foram carregadas e, caso positivo, desenha a cena.
Usa requestAnimationFrame para criar um loop de animação, garantindo que a cena seja continuamente atualizada e renderizada.

Fluxo da Aplicação

Carregamento da Página (window.onload):
Cria uma instância de Main, que inicializa a cena e prepara o loop de renderização.

Inicialização da Cena:
Configura a câmera, luz e malhas.
Carrega as malhas e prepara seus shaders, buffers e texturas.

Renderização Contínua (draw):
Atualiza a câmera e luz.
Renderiza as malhas.
Reitera o processo no próximo frame.
Principais Conceitos

Câmera (Camera):
Define a posição, direção e projeção da visualização.

Luz (Light):
Gerencia os parâmetros de iluminação (ambiental, difusa e especular) para efeitos realistas.

Malhas (Mesh):
Representam objetos renderizáveis, com geometria definida e configurada via buffers WebGL.

WebGL Context:
Gerenciado em Main, fornece acesso às APIs gráficas de baixo nível.

Shaders e Buffers:
Configurados nas classes Mesh e Light, interagem diretamente com o pipeline gráfico.
 */