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

const PADDING = 10;
const POINTS_COUNT = 30;
const MIN_FORCE_DISTANCE = 200;
const FORCE_COEFFICIENT = 0.5;

type Point = {
    x: number;
    y: number;
};

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

    const cursorPosition: Point = {
        x: 0,
        y: 0,
    };

    let width = window.innerWidth;
    let height = window.innerHeight;
    const pointsPositions: Point[] = [];
    for (let index = 0; index < POINTS_COUNT; index++) {
        pointsPositions.push({
            x: Math.random() * width,
            y: Math.random() * height,
        });
    }
    const pointsXPositions = new Float32Array(pointsPositions.map((i) => i.x));
    const pointsYPositions = new Float32Array(pointsPositions.map((i) => i.y));

    const geometry = new PlaneGeometry(
        window.innerWidth - PADDING,
        window.innerHeight - PADDING
    );
    const material = new ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uResolutionX: { value: window.innerWidth },
            uResolutionY: { value: window.innerHeight },
            uCursorX: { value: cursorPosition.x },
            uCursorY: { value: cursorPosition.y },
            uPointsXPositions: { value: pointsXPositions },
            uPointsYPositions: { value: pointsYPositions },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
    const screen = new Mesh(geometry, material);
    screen.position.x = 0;
    screen.position.y = 0;
    screen.position.z = 0;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        renderer.setSize(width, height);
        material.uniforms.uResolutionX.value = width;
        material.uniforms.uResolutionY.value = height;
        geometry.parameters.width = width - PADDING;
        geometry.parameters.height = height - PADDING;
        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
    }

    resize();

    window.addEventListener('resize', resize);

    scene.add(screen);

    function render(time: number) {
        material.uniforms.uTime.value = time / 20;
        material.uniforms.uCursorX.value =
            material.uniforms.uCursorX.value +
            (cursorPosition.x - material.uniforms.uCursorX.value) * 0.05;
        material.uniforms.uCursorY.value =
            material.uniforms.uCursorY.value +
            (cursorPosition.y - material.uniforms.uCursorY.value) * 0.05;

        for (let i = 0; i < POINTS_COUNT; i++) {
            const currentPoint = pointsPositions[i];
            const forceVector: Point = { x: 0, y: 0 };

            for (let j = 0; j < POINTS_COUNT; j++) {
                if (i === j) {
                    continue;
                }

                const curForce = getAttractPointForceVector(
                    currentPoint,
                    pointsPositions[j]
                );

                forceVector.x += curForce.x;
                forceVector.y += curForce.y;
            }

            const borderForce = getBorderForceVector(
                currentPoint,
                width,
                height
            );
            forceVector.x += borderForce.x;
            forceVector.y += borderForce.y;

            const cursorForce = getAttractPointForceVector(
                currentPoint,
                cursorPosition
            );
            forceVector.x += cursorForce.x * 5;
            forceVector.y += cursorForce.y * 5;

            currentPoint.x += forceVector.x;
            currentPoint.y += forceVector.y;
        }

        for (let index = 0; index < pointsPositions.length; index++) {
            const element = pointsPositions[index];
            pointsXPositions[index] = element.x;
            pointsYPositions[index] = element.y;
        }

        material.uniforms.uPointsXPositions.value = pointsXPositions;
        material.uniforms.uPointsYPositions.value = pointsYPositions;

        renderer.render(scene, camera);
        window.requestAnimationFrame(render);
    }

    window.requestAnimationFrame(render);

    function mousemove(event: MouseEvent) {
        cursorPosition.x = event.clientX;
        cursorPosition.y = window.innerHeight - event.clientY;
    }

    function touchmove(event: TouchEvent) {
        cursorPosition.x = event.touches[0].clientX;
        cursorPosition.y = window.innerHeight - event.touches[0].clientY;
    }

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('touchstart', touchmove);
    window.addEventListener('touchmove', touchmove);
}

init();

function getDistance(a: Point, b: Point): number {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

function getAttractPointForceVector(a: Point, b: Point): Point {
    const distance = getDistance(a, b);

    if (distance >= MIN_FORCE_DISTANCE) {
        return { x: 0, y: 0 };
    }

    return {
        x: ((b.x - a.x) / distance) * FORCE_COEFFICIENT,
        y: ((b.y - a.y) / distance) * FORCE_COEFFICIENT,
    };
}

function getPushPointForceVector(a: Point, b: Point): Point {
    const distance = getDistance(a, b);

    if (distance > MIN_FORCE_DISTANCE) {
        return { x: 0, y: 0 };
    }

    if (distance === 0) {
        return { x: 1, y: 1 };
    }

    return {
        x: ((a.x - b.x) / distance) * FORCE_COEFFICIENT,
        y: ((a.y - b.y) / distance) * FORCE_COEFFICIENT,
    };
}

function getBorderForceVector(a: Point, width: number, height: number): Point {
    const top: Point = getPushPointForceVector(a, {
        x: a.x,
        y: 0,
    });
    const right: Point = getPushPointForceVector(a, {
        x: width,
        y: a.y,
    });

    const bottom: Point = getPushPointForceVector(a, {
        x: a.x,
        y: height,
    });

    const left: Point = getPushPointForceVector(a, {
        x: 0,
        y: a.y,
    });

    return {
        x: (top.x + right.x + bottom.x + left.x) * 5,
        y: (top.y + right.y + bottom.y + left.y) * 5,
    };
}
