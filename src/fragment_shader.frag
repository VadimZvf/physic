precision highp float;
uniform float uTime;
uniform float uResolutionX;
uniform float uResolutionY;
uniform float uCursorX;
uniform float uCursorY;
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
    vec2 cursorPosition = vec2(uCursorX / uResolutionX / d, 1.0 - uCursorY / uResolutionY);
    vec4 currentPointColor = vec4(0.0);

    float intensity = 1.0 / (10.0 * distance(normalizedUv, cursorPosition));

    vec2 light2 = vec2(sin(uTime / 100.0 + 3.0) *- 2.0, cos(uTime / 100.0 + 7.0) * 1.0) * 0.2 + vec2(0.5, 0.5);
    vec4 lightColor2 = vec4(0.3, 1.0, 0.3, 0.0);
    float cloudIntensity2 = (1.0 / (20.0 * distance(normalizedUv, light2)));

    float radius = sin(uTime / 10.0) * 0.5;
    float distanceToCenter = distance(normalizedUv, cursorPosition);
    float distanceToCircle = abs(distanceToCenter - radius);
    float ringIntensity = 1.0 / (distanceToCircle * 100.0);


    float blue = sin(uTime / 100.0) * 0.2;
    float green = sin(uTime / 40.0 + 0.6) * 0.2;
    float red = sin(uTime / 10.0 + 1.0) * 0.2;
    vec4 noiseColor = vec4(red, green, blue, 0.0) * noise(vec3(normalizedUv.x * 5.0, normalizedUv.y* 5.0, uTime / 100.0)) * 2.0;

    gl_FragColor = currentPointColor + vec4(1.0, 0.2, 0.2, 0.0) * intensity + lightColor2 * cloudIntensity2 + ringIntensity * vec4(0.2, 0.2, 1.0, 0.0) + noiseColor;
}
