#version 120
#define ATMOSPHERE_SAMPLE_COUNT 8

varying vec3 vAtmosphereRay;
uniform vec3 uCameraPosition;
uniform vec3 uLightDirection;

#include "atmosphere_common.glsl"

void main() {
	float rayLength = length(vAtmosphereRay);
	float lightLength = length(uLightDirection);
	float cameraRadius = length(uCameraPosition);
	if(atmosphereInvalid(rayLength) || atmosphereInvalid(lightLength)
			|| atmosphereInvalid(cameraRadius)
			|| rayLength < ATM_EPSILON
			|| lightLength < ATM_EPSILON
			|| cameraRadius < ATM_EPSILON) {
		gl_FragColor = vec4(0.0);
		return;
	}
	vec3 rayDirection = vAtmosphereRay/rayLength;
	vec3 lightDirection = uLightDirection/lightLength;
	gl_FragColor = atmosphereIntegrate(uCameraPosition, rayDirection,
			lightDirection);
}
