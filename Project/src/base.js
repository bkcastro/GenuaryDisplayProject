import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { Axes } from './tools';
import Dots from './dots';

class Base extends THREE.Group {

    constructor() {
        super();

        const cylinderGeo = new THREE.CylinderGeometry(.6, .5, .1, 32);
        const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xb5b5b5, wireframe: false });
        const base = new THREE.Mesh(cylinderGeo, cylinderMaterial);

        this.add(base);

        this.group = new THREE.Group();

        this.group.position.set(0, 1, 0);
        this.group.add(Axes(.3, .3));
        this.add(this.group);

        this.content = new Dots();
        this.content.scale.set(1 / 3, 1 / 3, 1 / 3);
        this.group.add(this.content);

        this.createText();
    }

    createText() {
        // Load the font
        const loader = new FontLoader();
        loader.load('fonts/helvetiker_regular.typeface.json', (font) => {
            const textGeometry = new TextGeometry('Genuary 2024', {
                font: font,
                size: 0.1,
                height: 0.05,
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);

            // Position the text on the base
            textMesh.position.set(0, 0.5, 0);


            //this.add(textMesh);
        });
    }

    update() {
        this.content.rotateY(.001);
    }
}

export default Base;