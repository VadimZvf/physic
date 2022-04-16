precision highp float;
uniform float uTime;
uniform float uResolutionX;
uniform float uResolutionY;
uniform float uCursorX;
uniform float uCursorY;
uniform float[30] uPointsXPositions;
uniform float[30] uPointsYPositions;
varying vec2 vTextureCoord;

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

void main(void) {
    vec2 uv = vTextureCoord;
    float d = uResolutionY / uResolutionX;

    vec2 normalizedUv = vec2(uv.x / d, uv.y);
    vec2 cursorPosition = vec2(uCursorX / uResolutionX / d, uCursorY / uResolutionY);
    vec4 currentPointColor = vec4(0.0);

    float intensity = 1.0 / (10.0 * distance(normalizedUv, cursorPosition));

    currentPointColor += vec4(1.0, 0.2, 0.2, 0.0) * intensity;

    for(int i = 0; i < 30; ++i) {
        vec2 pointPosition = vec2(
            (uPointsXPositions[i] / uResolutionX) / d,
            uPointsYPositions[i] / uResolutionY
        );

        float distanceToPoint = distance(pointPosition, normalizedUv);
        currentPointColor += vec4(0.1, 0.5, 0.1, 0.0) * (1.0 / (distanceToPoint * 200.0));
    }

    gl_FragColor = currentPointColor;
}
