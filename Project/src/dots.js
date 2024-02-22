// Create an object that will be exported to a ar scene. 
import * as THREE from 'three'

class Dots extends THREE.Group {
    constructor() {
        super();

        this.count = 400;
        this.radius = 1;

        for (let i = 0; i < this.count; i++) {

            const phi = Math.acos(-1 + (2 * i) / this.count);
            const theta = Math.sqrt(this.count * Math.PI) * phi;

            var x = this.radius * Math.sin(phi) * Math.cos(theta);
            var y = this.radius * Math.sin(phi) * Math.sin(theta);
            var z = this.radius * Math.cos(phi);

            x = Math.sin(x) * Math.random() * 2;
            y = Math.sin(y) * Math.random() * 2;
            z = Math.sin(z) * Math.random() * 2;

            var position = new THREE.Vector3(x, y, z);

            var distanceToCenter = position.length();

            const colorA = new THREE.Color("black");
            const colorB = new THREE.Color("red");

            const geometry = new THREE.SphereGeometry(1 / 40, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: colorB.lerp(colorA, distanceToCenter) });

            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(x, y, z);

            sphere.scale.set(Math.random() + .1, Math.random() + .1, Math.random() + .1)
            this.add(sphere);
        }
    }

    update() {
        this.children.forEach((dot) => {

            //dot.scale.set(Math.random(), Math.random(), Math.random());
        })
    }
}


export default Dots;