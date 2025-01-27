export default
`#version 300 es
precision highp float;

struct Light {
    vec4 position;
    vec4 ambient_color;
    float ambient_k;
    vec4 diffuse_color;
    float diffuse_k;
    vec4 specular_color;
    float specular_k;
    float specular_p;
};

uniform Light lights[2];
uniform sampler2D uColorMap;
uniform vec3 viewPos;

in vec3 v_normal;
in vec3 v_fragPos;
in vec2 v_texCoord;

out vec4 fragColor;

vec3 calculatePhong(Light light, vec3 normal, vec3 fragPos, vec3 viewDir, vec3 baseColor) {
    // Ambient
    vec3 ambient = light.ambient_k * light.ambient_color.rgb;
    
    // Diffuse
    vec3 lightDir = normalize(light.position.xyz - fragPos);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = light.diffuse_k * diff * light.diffuse_color.rgb;
    
    // Specular
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), light.specular_p);
    vec3 specular = light.specular_k * spec * light.specular_color.rgb;
    
    return (ambient + diffuse + specular) * baseColor;
}

void main() {
    vec3 norm = normalize(v_normal);
    vec3 viewDir = normalize(viewPos - v_fragPos);
    vec3 baseColor = texture(uColorMap, v_texCoord).rgb;
    
    // Calculate lighting from both lights
    vec3 result = vec3(0.0);
    for(int i = 0; i < 2; i++) {
        result += calculatePhong(lights[i], norm, v_fragPos, viewDir, baseColor);
    }
    
    fragColor = vec4(result, 1.0);
}
`