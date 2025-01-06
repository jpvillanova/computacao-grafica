import Camera from './camera.js';
import Light from './light.js';
import Mesh from './mesh.js';

class Scene {
  constructor(gl) {
    // Camera virtual
    this.cam1 = new Camera(gl, [50, 50, 50], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    this.cam2 = new Camera(gl, [100, 100, 100], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    // Luz
    
    this.light = new Light();

    // Mesh
    this.mesh = new Mesh( 1.0); // cria uma nova malha
    this.copy = new Mesh(-1.0); // cria uma nova malha
  }

  async init(gl) { // inicializa a cena
    await this.mesh.loadMeshV4(); // carrega a malha
    this.mesh.init(gl, this.light); // inicializa a malha

    await this.copy.loadMeshV4() // carrega a malha
    this.copy.init(gl, this.light); // inicializa a malha
  }

  draw(gl) {  // desenha a cena
    // orbita das cameras
    const time = performance.now() / 1000; // Tempo em segundos
    this.cam1.orbit(5.0, 0.5, time); // Raio de 5 unidades, velocidade de 0.5 rad/s
    this.cam2.orbit(5.0, 0.5, time); // Raio de 5 unidades, velocidade de 0.5 rad/s

    this.cam1.updateCam('perspectiva'); // atualiza a câmera 1
    this.cam2.updateCam('ortho'); // atualiza a câmera 2
    
    this.light.updateLight(); // atualiza a luz

    this.mesh.draw(gl, this.cam, this.light); // desenha a malha
    this.copy.draw(gl, this.cam, this.light); // desenha a malha
  }
}

class Main { 
  constructor() {
    const canvas = document.querySelector("#glcanvas"); // seleciona o canvas

    this.gl = canvas.getContext("webgl2"); // pega o contexto do canvas
    this.setViewport(); // seta o viewport

    this.scene = new Scene(this.gl); // cria uma nova cena
    this.scene.init(this.gl); // inicializa a cena
  }

  setViewport() { // seta o viewport
    var devicePixelRatio = window.devicePixelRatio || 1; // pega o device pixel ratio
    this.gl.canvas.width = 1024 * devicePixelRatio; // seta a largura do canvas
    this.gl.canvas.height = 768 * devicePixelRatio; // seta a altura do canvas

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height); // seta o viewport
  }

  draw() { // desenha a cena
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // seta a cor de fundo
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // limpa o canvas

    // só desenha se as malhas estiverem carregadas
    if (this.scene.mesh.isReady() && this.scene.copy.isReady() ) { 
      this.scene.draw(this.gl); // desenha a cena
    }

    requestAnimationFrame(this.draw.bind(this)); // chama o próximo frame
  }
}

window.onload = () => {
  const app = new Main(); // cria uma nova aplicação
  app.draw(); // desenha a aplicação
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