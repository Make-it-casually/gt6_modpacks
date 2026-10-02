#version 120

varying vec2 vProxyUv;

void main() {
	gl_Position = ftransform();
	vProxyUv = gl_MultiTexCoord0.xy;
}
