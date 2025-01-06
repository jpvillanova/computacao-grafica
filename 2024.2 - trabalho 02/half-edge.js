export class Vertex {
  constructor(vid, x, y, z) {
    this.vid = vid; // vertex id

    this.position = [x, y, z, 1]; // x, y, z, w
    this.normal = [0.0, 0.0, 0.0, 0.0]; // nx, ny, nz, nw

    this.scalar = 0.0; // scalar

    this.he = null; // half-edge
  }
}

export class HalfEdge {
  constructor(vertex) {
    this.vertex = vertex; 

    this.next = null;  // next half-edge
    this.face = null; // face

    this.opposite = null; // opposite half-edge
  }
}

export class Face {
  constructor(baseHe) {
    this.baseHe = baseHe; // base half-edge
  }
}

export class HalfEdgeDS {
  constructor() {
    this.vertices = []; 
    this.halfEdges = [];  
    this.faces = [];
  }

  isReady() {
    return this.vertices.length > 0  && 
           this.halfEdges.length > 0 &&
           this.faces.length > 0; // verifica se a estrutura está pronta
  }

  build(coords, trigs) {
    // construção dos vértices
    for (let vid = 0; vid < coords.length; vid+=4) {
      const x = coords[vid]; 
      const y = coords[vid + 1]; 
      const z = coords[vid + 2];

      const v = new Vertex(vid / 4, x, y, z); // cria um novo vértice
      this.vertices.push(v); // adiciona o vértice na lista de vértices
    }

    // construção das faces & half-edges
    for (let tid = 0; tid < trigs.length; tid+=3) {
      const v0  = this.vertices[ trigs[tid + 0] ]; 
      const v1  = this.vertices[ trigs[tid + 1] ]; 
      const v2  = this.vertices[ trigs[tid + 2] ];

      const he0 = new HalfEdge(v0); 
      const he1 = new HalfEdge(v1); 
      const he2 = new HalfEdge(v2); 
      const face = new Face(he0); 
      this.faces.push(face); 

      // atribuição das faces das half-edges
      he0.face = face;
      he1.face = face;
      he2.face = face;

      // atribuição das next
      he0.next = he1;
      he1.next = he2;
      he2.next = he0;

      this.halfEdges.push(he0, he1, he2);
    }

    this.computeOpposites(); // computa os opostos
    this.computeVertexHe(); // computa os half-edges dos vértices

    this.computeNormals(); // computa as normais

    console.log(this); // imprime a estrutura
  }

  computeOpposites() { // computa os opostos
    const visited = {}; // dicionário de half-edges visitadas

    for (let hid = 0; hid < this.halfEdges.length; hid ++) {
      const a = this.halfEdges[hid].vertex.vid; 
      const b = this.halfEdges[hid].next.vertex.vid;

      const k = `k${Math.min(a,b)},${Math.max(a,b)}`; // chave

      if (visited[k] !== undefined) {
        const op = visited[k]; // half-edge oposta
        op.opposite = this.halfEdges[hid]; // atribui a half-edge oposta
        this.halfEdges[hid].opposite = op; // atribui a half-edge oposta

        delete visited[k]; // remove a half-edge oposta
      }
      else {
        visited[k] = this.halfEdges[hid]; // adiciona a half-edge
      }
    }
  }

  computeVertexHe() { // computa os half-edges dos vértices
    for (let hid = 0; hid < this.halfEdges.length; hid ++) {
      const v = this.halfEdges[hid].vertex; // vértice

      if (v.he === null) {
        v.he = this.halfEdges[hid]; // half-edge
      }
      else if(this.halfEdges[hid].opposite === null) {
        v.he = this.halfEdges[hid]; // half-edge
      }
    }
  }

  computeNormals() { // computa as normais
    for (let fId = 0; fId < this.faces.length; fId ++) {
      const he0 = this.faces[fId].baseHe; // half-edge
      const he1 = this.faces[fId].baseHe.next; // half-edge
      const he2 = this.faces[fId].baseHe.next.next; // half-edge

      const v0 = he0.vertex.position;  // vértice
      const v1 = he1.vertex.position; // vértice
      const v2 = he2.vertex.position; // vértice

      const vec1 = [v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]]; // v1-v0
      const vec2 = [v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]]; // v2-v0

      const n = [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0]
      ]; // n = vec1 x vec2

      for (let cid = 0; cid < 3; cid++) {
        he0.vertex.normal[cid] += n[cid];
        he1.vertex.normal[cid] += n[cid];
        he2.vertex.normal[cid] += n[cid];
      } // acumula as normais
    }
  }

  getVBOs() { // retorna os VBOs
    const coords  = [];
    const scalars = [];
    const normals = [];
    const indices = [];

    for (let vId = 0; vId < this.vertices.length; vId++) {
      const v = this.vertices[vId]; // vértice

      coords.push(...v.position); // x, y, z, w
      scalars.push(vId / this.vertices.length); // scalar
      normals.push(...v.normal); // nx, ny, nz, nw
    }

    for (let hid = 0; hid < this.halfEdges.length; hid++) {
      indices.push(this.halfEdges[hid].vertex.vid); // vertex id
    }

    return [coords, scalars, normals, indices]; // retorna os VBOs
  }

  estrela(v) { // retorna a estrela de um vértice
    const estrela = [];

    let he = v.he; // half-edge
    do {
      estrela.push(he.vertex.vid); // vertex id
      he = he.opposite.next; // half-edge
    } while (he !== v.he);

    return estrela; // retorna a estrela
  }
}

/*
Classe Vertex
Representa um vértice da malha.
constructor(vid, x, y, z):
vid: Identificador único do vértice.
position: Posição no espaço 3D com coordenada homogênea [x, y, z, 1].
normal: Vetor normal do vértice (inicialmente nulo).
scalar: Valor escalar associado ao vértice (por exemplo, para texturização).
he: Referência a uma meia-aresta incidente no vértice (inicialmente null).

Classe HalfEdge
Representa uma meia-aresta conectando dois vértices.
constructor(vertex):
vertex: Vértice no final da meia-aresta.
next: Próxima meia-aresta (inicialmente null).
face: Face associada à meia-aresta (inicialmente null).
opposite: Meia-aresta oposta (inicialmente null).

Classe Face
Representa uma face da malha.
constructor(baseHe):
baseHe: Meia-aresta base que pertence à face.

Classe HalfEdgeDS
Gerencia a estrutura de dados de meia-arestas.
Atributos:
vertices: Lista de vértices.
halfEdges: Lista de meia-arestas.
faces: Lista de faces.

Métodos:
isReady():
Verifica se há vértices, meia-arestas e faces na estrutura.

build(coords, trigs):
coords: Lista de coordenadas [x, y, z, w] para os vértices.
trigs: Lista de índices de vértices que definem triângulos.
Constrói:
Vértices.
Meia-arestas conectadas para cada triângulo.
Faces associadas às meia-arestas.
Chama funções auxiliares:
computeOpposites: Associa meia-arestas opostas.
computeVertexHe: Define a meia-aresta incidente em cada vértice.
computeNormals: Calcula normais para vértices e faces.

computeOpposites():
Usa um dicionário para mapear pares de vértices (a, b) e associar meia-arestas opostas.

computeVertexHe():
Define a meia-aresta incidente em cada vértice (uma arbitrária ou a que não tem oposta, se disponível).

computeNormals():
Calcula as normais das faces usando o produto vetorial das arestas.
Acumula as normais nas normais dos vértices.

getVBOs():
Retorna buffers de vértices para renderização:
coords: Coordenadas dos vértices.
scalars: Valores escalares.
normals: Normais dos vértices.
indices: Índices dos vértices conectados por meia-arestas.

estrela(v):
Retorna a "estrela" do vértice v, ou seja, os vértices adjacentes conectados por meia-arestas.
Fluxo de Uso

Construção da Estrutura (build):
Recebe coordenadas e triângulos.
Cria vértices, meia-arestas e faces.
Calcula as relações entre meia-arestas e normais.
Manipulação e Acesso:

estrela(v): Útil para operações locais, como suavização ou análise.
getVBOs(): Fornece dados para renderização gráfica.
Essa estrutura é eficiente para malhas porque:

Suporta consultas rápidas sobre conectividade.
Permite cálculo eficiente de propriedades geométricas, como normais e vizinhança.
*/