import {
    Scene,
    OrthographicCamera,
    WebGLRenderer,
    PlaneGeometry,
    ShaderMaterial,
    Mesh,
    Texture,
    RepeatWrapping,
} from 'three';
import vertexShader from './vertex_shader.frag';
import fragmentShader from './fragment_shader.frag';
import './index.css';

function init() {
    const canvas = document.getElementById('canvas');

    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error('Cannot find canvas');
    }

    const scene = new Scene();
    const camera = new OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        1,
        1000
    );
    camera.position.z = 10;

    const renderer = new WebGLRenderer({
        canvas,
    });

    const glitchTexture = new Texture();
    glitchTexture.wrapS = RepeatWrapping;
    glitchTexture.wrapT = RepeatWrapping;

    const cursorPosition = {
        x: 0,
        y: 0,
    };

    const geometry = new PlaneGeometry(
        window.innerWidth - 10,
        window.innerHeight - 10
    );
    const material = new ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uResolutionX: { value: window.innerWidth },
            uResolutionY: { value: window.innerHeight },
            uCursorX: { value: cursorPosition.x },
            uCursorY: { value: cursorPosition.y },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
    const screen = new Mesh(geometry, material);
    screen.position.x = 0;
    screen.position.y = 0;
    screen.position.z = 0;

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.uResolutionX.value = window.innerWidth;
        material.uniforms.uResolutionY.value = window.innerHeight;
        geometry.parameters.width = window.innerWidth - 10;
        geometry.parameters.height = window.innerHeight - 10;
        camera.left = window.innerWidth / -2;
        camera.right = window.innerWidth / 2;
        camera.top = window.innerHeight / 2;
        camera.bottom = window.innerHeight / -2;
    }

    resize();

    window.addEventListener('resize', resize);

    scene.add(screen);

    function render() {
        material.uniforms.uTime.value += 1;
        material.uniforms.uCursorX.value =
            material.uniforms.uCursorX.value +
            (cursorPosition.x - material.uniforms.uCursorX.value) * 0.05;
        material.uniforms.uCursorY.value =
            material.uniforms.uCursorY.value +
            (cursorPosition.y - material.uniforms.uCursorY.value) * 0.05;

        renderer.render(scene, camera);

        window.requestAnimationFrame(render);
    }

    window.requestAnimationFrame(render);

    function mousemove(event: MouseEvent) {
        cursorPosition.x = event.clientX;
        cursorPosition.y = event.clientY;
    }

    function touchmove(event: TouchEvent) {
        cursorPosition.x = event.touches[0].clientX;
        cursorPosition.y = event.touches[0].clientY;
    }

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('touchstart', touchmove);
    window.addEventListener('touchmove', touchmove);
}

init();
