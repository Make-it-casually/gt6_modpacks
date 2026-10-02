#version 120

varying vec3 vAtmosphereEyePosition;
varying vec3 vAtmosphereCenterEye;

void main() {
	vAtmosphereEyePosition =
			(gl_ModelViewMatrix*gl_Vertex).xyz;
	vAtmosphereCenterEye =
			(gl_ModelViewMatrix*vec4(0.0, 0.0, 0.0, 1.0)).xyz;
	gl_Position = ftransform();
}
