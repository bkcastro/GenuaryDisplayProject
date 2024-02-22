import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { Axes } from './tools';
import Base from './base';

const clock = new THREE.Clock();

let container;
let camera, scene, renderer;
let controller1, controller2;

let raycaster;

const intersected = [];
const tempMatrix = new THREE.Matrix4();

let controls, group, base, floor, marker, temp;
var user = { isSelecting: false };

let INTERSECTION;

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080);

    scene.add(Axes(.4, .4));

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 3, 3);

    controls = new OrbitControls(camera, container);
    controls.update();

    scene.add(new THREE.HemisphereLight(0xbcbcbc, 0xa5a5a5, 3));

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0, 6, 0);
    light.castShadow = true;
    scene.add(light);

    const aLight = new THREE.AmbientLight(new THREE.Color(0xffffff), 100);
    scene.add(aLight);

    marker = new THREE.Mesh(
        new THREE.CircleGeometry(0.25, 32).rotateX(- Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0xbcbcbc })
    );

    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 5, 2, 2).rotateX(- Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0xbcbcbc, transparent: true, opacity: 0.25 })
    );

    scene.add(floor);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    renderer.sortObjects = false;
    container.appendChild(renderer.domElement);

    document.body.appendChild(XRButton.createButton(renderer, { 'optionalFeatures': ['depth-sensing'] }));

    // Controllers 

    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    scene.add(controller2);

    const geometryLine = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)]);

    const line = new THREE.Line(geometryLine);
    line.name = 'line';
    line.scale.z = 5;

    controller1.add(line.clone());
    controller2.add(line.clone());

    raycaster = new THREE.Raycaster();

    group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.CylinderGeometry(.6, .5, .1, 32);
    const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        roughness: 0.7,
        metalness: 0.0
    });

    // Init base 
    base = new Base();

    scene.add(base);

    window.addEventListener('resize', onWindowResize);
}

function onSelectStart(event) {

    user.isSelecting = true;

    // const controller = event.target;

    // const intersections = getIntersections(controller);

    // if (intersections.length > 0) {
    //     // Only handle one object at a time
    //     const intersection = intersections[0];

    //     const object = intersection.object;
    //     object.material.emissive.b = 1;
    //     controller.attach(object);

    //     controller.userData.selected = object;

    // }

    // controller.userData.targetRayMode = event.data.targetRayMode;
}

function onSelectEnd(event) {

    this.userData.isSelecting = false;

    if (INTERSECTION) {
        //console.log(INTERSECTION);
        base.position.set(INTERSECTION.x, 0, INTERSECTION.z);
    }

    // const controller = event.target;

    // if (controller.userData.selected !== undefined) {

    //     const object = controller.userData.selected;
    //     object.material.color = new THREE.Color("red");
    //     group.attach(object);

    //     controller.userData.selected = undefined;

    // }

}

function getIntersections(controller) {

    controller.updateMatrixWorld();

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

    return raycaster.intersectObjects(group.children, false);

}

function cleanIntersected() {

    while (intersected.length) {

        const object = intersected.pop();
        object.material.emissive.r = 0;

    }

}

function intersectObjects(controller) {

    // Do not highlight in mobile-ar

    if (controller.userData.targetRayMode === 'screen') return;

    // Do not highlight when already selected

    if (controller.userData.selected !== undefined) return;

    const line = controller.getObjectByName('line');
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {

        const intersection = intersections[0];

        const object = intersection.object;
        object.material.emissive.r = 1;
        intersected.push(object);

        line.scale.z = intersection.distance;

    } else {

        line.scale.z = 5;

    }

}

function animate() {

    renderer.setAnimationLoop(render);

}

function render() {

    INTERSECTION = undefined;

    if (user.isSelecting === true) {

        tempMatrix.identity().extractRotation(controller1.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(controller1.matrixWorld);
        raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

        const intersects = raycaster.intersectObjects([floor]);

        if (intersects.length > 0) {

            INTERSECTION = intersects[0].point;

        }
    }

    // cleanIntersected();

    // intersectObjects(controller1);
    // intersectObjects(controller2);

    base.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

