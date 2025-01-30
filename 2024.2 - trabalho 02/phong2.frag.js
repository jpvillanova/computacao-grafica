export default
`#version 300 es
precision highp float;

struct Light {
    vec4 position;       // Light position in world space
    vec4 ambient_color;  // Ambient light color
    float ambient_k;     // Ambient intensity factor
    vec4 diffuse_color;  // Diffuse light color
    float diffuse_k;     // Diffuse intensity factor
    vec4 specular_color; // Specular light color
    float specular_k;    // Specular intensity factor
    float specular_p;    // Specular shininess factor
};

uniform Light lights[2];     // Array of lights
uniform sampler2D uColorMap; // Texture map
uniform vec3 viewPos;        // Camera position in world space

// Fog parameters (optional for depth visualization)
uniform vec3 fogColor;       // Fog color
uniform float fogNear;       // Start of fog effect
uniform float fogFar;        // End of fog effect

in vec3 v_normal;      // Normal vector in world space
in vec3 v_fragPos;     // Fragment position in world space
in vec2 v_texCoord;    // Texture coordinates

// Changing colour parameters
uniform vec3 rangeCenter;     // The center of the range
uniform float rangeRadius;    // The radius of the range

out vec4 fragColor;    // Output fragment color

vec3 calculatePhong(Light light, vec3 normal, vec3 fragPos, vec3 viewDir, vec3 baseColor) {
    // Ambient component
    vec3 ambient = light.ambient_k * light.ambient_color.rgb;

    // Diffuse component
    vec3 lightDir = normalize(light.position.xyz - fragPos);
    float diff = max(dot(normal, lightDir), 0.5);
    vec3 diffuse = light.diffuse_k * diff * light.diffuse_color.rgb;

    // Specular component
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.5), light.specular_p);
    vec3 specular = light.specular_k * spec * light.specular_color.rgb;

    return ambient + diffuse + specular;
}

void main() {
    vec3 norm = normalize(v_normal);               // Normalize the interpolated normal
    vec3 viewDir = normalize(viewPos - v_fragPos); // Direction from fragment to camera
    vec3 baseColor = texture(uColorMap, v_texCoord).rgb; // Base color from texture

    // Combine Phong lighting from both lights
    vec3 result = vec3(0.0);
    for (int i = 0; i < 2; i++) {
        result += calculatePhong(lights[i], norm, v_fragPos, viewDir, baseColor);
    }

    // Optional: Fog effect for depth visualization
    float distance = length(viewPos - v_fragPos);
    float fogFactor = clamp((fogFar - distance) / (fogFar - fogNear), 0.5, 1.0);
    vec3 colorWithFog = mix(fogColor, result, fogFactor);

    fragColor = vec4(colorWithFog, 1.0); // Final output color
}
`;
