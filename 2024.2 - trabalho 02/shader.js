export default class Shader {
  static createShader(gl, type, source) {
    var shader = gl.createShader(type); // cria o shader
    gl.shaderSource(shader, source); // adiciona o código fonte
    gl.compileShader(shader); // compila o shader
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var info = gl.getShaderInfoLog(shader); // pega o log de erro
      console.log('Could not compile WebGL program:' + info); // imprime o erro
    }

    return shader; // retorna o shader

  }

  static createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram(); // cria o programa

    gl.attachShader(program, vertexShader); // adiciona o vertex shader
    gl.attachShader(program, fragmentShader); // adiciona o fragment shader
    gl.linkProgram(program); // linka o programa
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      var info = gl.getProgramInfoLog(program); // pega o log de erro
      console.log('Could not compile WebGL program:' + info); // imprime o erro
    }

    return program; // retorna o programa
  }

  static isArrayBuffer(value) { // verifica se é um array buffer
    return value && value.buffer instanceof ArrayBuffer && value.byteLength !== undefined;
  }

  static createBuffer(gl, type, data) { // cria um buffer
    if (data.length == 0) // se o tamanho for 0
      return null;

    if (!Shader.isArrayBuffer(data)) { // se não for um array buffer
      console.warn('Data is not an instance of ArrayBuffer');
      return null;
    }

    var buffer = gl.createBuffer(); // cria o buffer
    gl.bindBuffer(type, buffer); // binda o buffer
    gl.bufferData(type, data, gl.STATIC_DRAW); // adiciona os dados

    return buffer; // retorna o buffer
  }

  static createVAO(gl, posAttribLoc, posBuffer, colorAttribLoc = null, colorBuffer = null, normAttribLoc = null, normBuffer = null) {
    var vao = gl.createVertexArray(); // cria o vertex array object

    gl.bindVertexArray(vao); // binda o vertex array object

    if (posAttribLoc != null && posAttribLoc != undefined) {
      gl.enableVertexAttribArray(posAttribLoc); // habilita o atributo
      var size = 4; // tamanho
      var type = gl.FLOAT; // tipo
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer); // binda o buffer
      gl.vertexAttribPointer(posAttribLoc, size, type, false, 0, 0); // adiciona o atributo
    }

    if (colorAttribLoc != null && colorAttribLoc != undefined) {
      gl.enableVertexAttribArray(colorAttribLoc); // habilita o atributo
      size = 1; // tamanho
      type = gl.FLOAT; // tipo
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); // binda o buffer
      gl.vertexAttribPointer(colorAttribLoc, size, type, false, 0, 0); // adiciona o atributo
    }

    if (normAttribLoc != null && normAttribLoc != undefined) {
      gl.enableVertexAttribArray(normAttribLoc); // habilita o atributo
      size = 4; // tamanho
      type = gl.FLOAT; // tipo
      gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer); // binda o buffer
      gl.vertexAttribPointer(normAttribLoc, size, type, false, 0, 0); // adiciona o atributo
    }

    return vao; // retorna o vertex array object
  }
}



/* 
Métodos

createShader(gl, type, source)
Propósito: Cria e compila um shader (vertex ou fragment) a partir do código-fonte GLSL fornecido.
Parâmetros:
gl: Contexto WebGL2.
type: Tipo do shader (gl.VERTEX_SHADER ou gl.FRAGMENT_SHADER).
source: Código-fonte GLSL do shader.
Funcionamento:
Cria o shader com gl.createShader.
Define o código-fonte com gl.shaderSource.
Compila o shader com gl.compileShader.
Verifica se a compilação foi bem-sucedida usando gl.getShaderParameter.
Em caso de erro, imprime o log de erro com gl.getShaderInfoLog.
Retorno: Retorna o objeto do shader compilado.

createProgram(gl, vertexShader, fragmentShader)
Propósito: Cria um programa shader combinando vertex e fragment shaders.
Parâmetros:
gl: Contexto WebGL2.
vertexShader: Shader de vértices previamente compilado.
fragmentShader: Shader de fragmentos previamente compilado.
Funcionamento:
Cria o programa com gl.createProgram.
Anexa os shaders ao programa com gl.attachShader.
Faz o link do programa com gl.linkProgram.
Verifica se o link foi bem-sucedido usando gl.getProgramParameter.
Em caso de erro, imprime o log de erro com gl.getProgramInfoLog.
Retorno: Retorna o programa shader pronto para uso.

isArrayBuffer(value)
Propósito: Verifica se o valor fornecido é uma instância válida de ArrayBuffer.
Parâmetro:
value: Dados a serem verificados.
Funcionamento:
Retorna true se o valor for um ArrayBuffer válido; caso contrário, retorna false.

createBuffer(gl, type, data)
Propósito: Cria e inicializa um buffer de dados em WebGL.
Parâmetros:
gl: Contexto WebGL2.
type: Tipo do buffer (gl.ARRAY_BUFFER ou gl.ELEMENT_ARRAY_BUFFER).
data: Dados a serem armazenados no buffer.
Funcionamento:
Verifica se os dados têm tamanho válido e são um ArrayBuffer usando isArrayBuffer.
Cria o buffer com gl.createBuffer.
Associa o buffer ao tipo especificado com gl.bindBuffer.
Preenche o buffer com os dados usando gl.bufferData.
Retorno: Retorna o objeto do buffer ou null se ocorrer erro.

createVAO(gl, posAttribLoc, posBuffer, colorAttribLoc = null, colorBuffer = null, normAttribLoc = null, normBuffer = null)
Propósito: Cria um Vertex Array Object (VAO), associando atributos de vértices a buffers.
Parâmetros:
gl: Contexto WebGL2.
posAttribLoc: Localização do atributo de posição.
posBuffer: Buffer de posições.
colorAttribLoc: Localização do atributo de cor (opcional).
colorBuffer: Buffer de cores (opcional).
normAttribLoc: Localização do atributo de normais (opcional).
normBuffer: Buffer de normais (opcional).
Funcionamento:
Cria o VAO com gl.createVertexArray.
Associa o VAO com gl.bindVertexArray.
Para cada atributo fornecido (posAttribLoc, colorAttribLoc, normAttribLoc):
Habilita o atributo com gl.enableVertexAttribArray.
Associa o buffer correspondente com gl.bindBuffer.
Define a estrutura dos dados do atributo com gl.vertexAttribPointer.
Retorno: Retorna o VAO configurado
 */