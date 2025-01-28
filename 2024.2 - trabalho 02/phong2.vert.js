export default 
`#version 300 es
precision highp float;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

in vec4 position;   // Vertex position
in vec3 normal;     // Vertex normal
in vec2 texCoord;   // Texture coordinates

out vec3 v_normal;      // Transformed normal
out vec3 v_fragPos;     // Fragment position in world space
out vec2 v_texCoord;    // Pass through texture coordinates

void main() {
    // Transform vertex position to world space
    v_fragPos = vec3(u_model * position);
    
    // Calculate the final vertex position in clip space
    gl_Position = u_projection * u_view * u_model * position;
    
    // Transform and normalize the normal vector
    v_normal = normalize(mat3(transpose(inverse(u_model))) * normal);
    
    // Pass the texture coordinates to the fragment shader
    v_texCoord = texCoord;
}
`;
