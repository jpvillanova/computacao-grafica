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
    // Clear any existing data
    this.vertices = [];
    this.halfEdges = [];
    this.faces = [];
  
    // Build vertices - Notice the coords loop must be fixed to match vertex count
    const vertexCount = coords.length / 4; // Since each vertex has 4 components (x,y,z,w)
    for (let i = 0; i < vertexCount; i++) {
      const baseIndex = i * 4;
      const x = coords[baseIndex];
      const y = coords[baseIndex + 1];
      const z = coords[baseIndex + 2];
  
      const v = new Vertex(i, x, y, z); // Create vertex with correct ID
      this.vertices.push(v);
    }
  
    // Build faces & half-edges
    for (let i = 0; i < trigs.length; i += 3) {
      // Verify indices are within bounds
      if (trigs[i] >= this.vertices.length || 
          trigs[i + 1] >= this.vertices.length || 
          trigs[i + 2] >= this.vertices.length) {
        console.error('Invalid vertex index in triangles array');
        continue;
      }
  
      // Get vertices for this triangle
      const v0 = this.vertices[trigs[i]];
      const v1 = this.vertices[trigs[i + 1]];
      const v2 = this.vertices[trigs[i + 2]];
  
      // Create half-edges
      const he0 = new HalfEdge(v0);
      const he1 = new HalfEdge(v1);
      const he2 = new HalfEdge(v2);
  
      // Create face
      const face = new Face(he0);
      this.faces.push(face);
  
      // Set face for half-edges
      he0.face = face;
      he1.face = face;
      he2.face = face;
  
      // Set next pointers
      he0.next = he1;
      he1.next = he2;
      he2.next = he0;
  
      // Add half-edges to array
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

  computeVertexHe() {
    for (let hid = 0; hid < this.halfEdges.length; hid++) {
      const v = this.halfEdges[hid].vertex; // Current vertex
  
      // Assign the half-edge only if it's the first or if it is a border edge
      if (v.he === null || this.halfEdges[hid].opposite === null) {
        v.he = this.halfEdges[hid];
      }
    }
  }
  

  computeNormals() {
    for (let fId = 0; fId < this.faces.length; fId++) {
      const he0 = this.faces[fId].baseHe;
      const he1 = he0.next;
      const he2 = he1.next;
  
      if (!he0 || !he1 || !he2) continue; // Skip incomplete faces
  
      const v0 = he0.vertex.position;
      const v1 = he1.vertex.position;
      const v2 = he2.vertex.position;
  
      const vec1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
      const vec2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
  
      const n = [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0],
      ];
  
      for (let cid = 0; cid < 3; cid++) {
        he0.vertex.normal[cid] += n[cid];
        he1.vertex.normal[cid] += n[cid];
        he2.vertex.normal[cid] += n[cid];
      }
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

  estrela(v) {
    const estrela = [];
  
    let he = v.he; // Start half-edge
    do {
      estrela.push(he.vertex.vid); // Add vertex ID
      
      // Move to the next half-edge
      he = he.opposite ? he.opposite.next : null;
  
    } while (he && he !== v.he); // Stop at the starting edge or on border
  
    return estrela;
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