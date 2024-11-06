export default class Shader {
  static createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var info = gl.getShaderInfoLog(shader);
      console.log('Could not compile WebGL program:' + info);
    }

    return shader;
  }

  static createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      var info = gl.getProgramInfoLog(program);
      console.log('Could not compile WebGL program:' + info);
    }

    return program;
  }

  static isArrayBuffer(value) {
    return value && value.buffer instanceof ArrayBuffer && value.byteLength !== undefined;
  }

  static createBuffer(gl, type, data) {
    if (data.length == 0)
      return null;

    if (!Shader.isArrayBuffer(data)) {
      console.warn('Data is not an instance of ArrayBuffer');
      return null;
    }

    var buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, data, gl.STATIC_DRAW);

    return buffer;
  }

  static createVAO(gl, posAttribLoc, colorAttribLoc, dataBuffer = null) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    if (dataBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);

      
      const stride = 5 * Float32Array.BYTES_PER_ELEMENT;
      gl.enableVertexAttribArray(posAttribLoc);
      gl.vertexAttribPointer(posAttribLoc, 2, gl.FLOAT, false, stride, 0);

      gl.enableVertexAttribArray(colorAttribLoc);
      gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
    }

    gl.bindVertexArray(null);
    return vao;
  }
}