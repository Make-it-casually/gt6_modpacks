#version 120

varying vec3 vAtmosphereRay;

void main() {
	gl_Position = gl_Vertex;
	vAtmosphereRay = gl_MultiTexCoord0.xyz;
}
