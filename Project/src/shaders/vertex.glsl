uniform float uSize;
uniform float uTime; 
uniform vec3 uTran;
uniform mat4 uYaw; 

attribute float aScale;
attribute vec3 aRandom;

varying vec3 vColor; 
varying vec2 vUv;

void main()
{
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Spin 
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.02;
    angle += angleOffset;

    // modelPosition.x = cos(angle) * distanceToCenter; 
    // modelPosition.z = cos(angle) / distanceToCenter;
    // modelPosition.y = cos(angle) / distanceToCenter;

    modelPosition.x = cos(angle) * distanceToCenter; 
    modelPosition.y = sin(angle) * distanceToCenter;
    modelPosition.z = tan(angle) * distanceToCenter;

    modelPosition.x += aRandom.x;
    modelPosition.y += aRandom.y; 
    modelPosition.z += aRandom.z * uTime * 1.0;

    modelPosition = uYaw * modelPosition;
    modelPosition.xyz += uTran;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    /**
        * Size
        */

    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / -viewPosition.z);

    vColor = color;
}