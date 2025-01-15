export default 
`#version 300 es
precision highp float;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

in vec4 position;
in vec3 normal;
in vec2 texCoord;

out vec3 v_normal;
out vec2 v_texCoord;

void main() {
    gl_Position = u_projection * u_view * u_model * position;
    v_normal = mat3(transpose(inverse(u_model))) * normal; // Transform normal
    v_texCoord = texCoord;
}
`