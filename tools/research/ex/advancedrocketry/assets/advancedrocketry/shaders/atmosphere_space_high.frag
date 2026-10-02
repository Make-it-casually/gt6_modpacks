#version 120
#define ATMOSPHERE_SAMPLE_COUNT 24

varying vec3 vAtmosphereEyePosition;
varying vec3 vAtmosphereCenterEye;
uniform vec3 uLightDirectionEye;
uniform float uKmPerViewUnit;

#include "atmosphere_common.glsl"

void main() {
	vec3 origin = -vAtmosphereCenterEye*uKmPerViewUnit;
	float rayLength = length(vAtmosphereEyePosition);
	float centerLength = length(vAtmosphereCenterEye);
	float lightLength = length(uLightDirectionEye);
	if(atmosphereInvalid(rayLength) || atmosphereInvalid(centerLength)
			|| atmosphereInvalid(lightLength)
			|| atmosphereInvalid(uKmPerViewUnit)
			|| rayLength < ATM_EPSILON
			|| lightLength < ATM_EPSILON
			|| uKmPerViewUnit < ATM_EPSILON) {
		gl_FragColor = vec4(0.0);
		return;
	}
	vec3 rayDirection = vAtmosphereEyePosition/rayLength;
	vec3 lightDirection = uLightDirectionEye/lightLength;
	gl_FragColor = atmosphereIntegrate(origin, rayDirection,
			lightDirection);
}
