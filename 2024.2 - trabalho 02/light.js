export default class Light {
  constructor(position, color) {
    this.pos = position;
    this.amb_c = color;
    this.dif_c = color;
    this.esp_c = color;
    
    this.amb_k = 0.2;
    this.dif_k = 0.6;
    this.esp_k = 0.3;
    this.esp_p = 5.0;
  }

  createUniforms(gl, program, index) {
    const prefix = `lights[${index}]`;
  
    // Posição da luz
    gl.uniform4fv(gl.getUniformLocation(program, `${prefix}.position`), this.pos);
  
    // Cor e intensidade ambiente
    gl.uniform4fv(gl.getUniformLocation(program, `${prefix}.ambient_color`), this.amb_c);
    gl.uniform1f(gl.getUniformLocation(program, `${prefix}.ambient_k`), this.amb_k);
  
    // Cor e intensidade difusa
    gl.uniform4fv(gl.getUniformLocation(program, `${prefix}.diffuse_color`), this.dif_c);
    gl.uniform1f(gl.getUniformLocation(program, `${prefix}.diffuse_k`), this.dif_k);
  
    // Cor e intensidade especular
    gl.uniform4fv(gl.getUniformLocation(program, `${prefix}.specular_color`), this.esp_c);
    gl.uniform1f(gl.getUniformLocation(program, `${prefix}.specular_k`), this.esp_k);
    gl.uniform1f(gl.getUniformLocation(program, `${prefix}.specular_p`), this.esp_p);
  }  
}