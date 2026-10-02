#version 120

uniform sampler2D uSceneColor;
uniform sampler2D uShadowBoundary;
uniform vec4 uViewport;
uniform vec2 uCenter;
uniform float uShadowRadius;
uniform float uProxyRadius;
uniform float uMass;
uniform float uSpin;
uniform vec2 uProjectedSpinAxis;
uniform float uInclination;
uniform float uDiskInner;
uniform float uDiskOuter;
uniform float uAccretionRate;
uniform float uWorldTime;
uniform float uBodyPhase;
uniform float uAlpha;
uniform float uSteps;

varying vec2 vProxyUv;

const float TWO_PI = 6.28318530717958647692;
const float SQRT_27 = 5.196152422706632;
const float SHADOW_RADIUS_MIN = 0.45;
const float SHADOW_RADIUS_MAX = 1.55;
const float ANIMATION_PERIOD_TICKS = 4096.0;

float saturate(float value) {
	return clamp(value, 0.0, 1.0);
}

float safeAngle(vec2 point) {
	vec2 safePoint = dot(point, point) < 0.00000001
			? vec2(0.0001, 0.0) : point;
	return atan(safePoint.y, safePoint.x);
}

vec2 safeNormalize(vec2 value) {
	float lengthSquared = dot(value, value);
	return lengthSquared < 0.000000000001
			? vec2(1.0, 0.0)
			: value*inversesqrt(lengthSquared);
}

float shadowBoundary(vec2 p) {
	vec2 axis = safeNormalize(uProjectedSpinAxis);
	vec2 majorAxis = vec2(-axis.y, axis.x);
	vec2 curvePoint = vec2(dot(p, majorAxis), dot(p, axis));
	float angle = safeAngle(curvePoint)/TWO_PI + 0.5;
	float encoded = texture2D(uShadowBoundary,
			vec2(fract(angle + 0.001953125), 0.5)).r;
	return mix(SHADOW_RADIUS_MIN, SHADOW_RADIUS_MAX, encoded);
}

float annulus(float radius, float innerRadius, float outerRadius,
		float softness) {
	float span = max(outerRadius - innerRadius, 0.0004);
	float footprint = 1.25*(abs(dFdx(radius)) + abs(dFdy(radius)));
	float width = min(max(softness, footprint), span*0.35);
	return smoothstep(innerRadius - width, innerRadius + width, radius)
			*(1.0 - smoothstep(outerRadius - width,
			outerRadius + width, radius));
}

float filteredSpiral(vec2 diskPoint, float radius, float arms,
		float winding, float turnsPerCycle, float timeCycle,
		float phaseOffset) {
	float radiusSquared = max(dot(diskPoint, diskPoint), 0.00001);
	vec2 pointDx = dFdx(diskPoint);
	vec2 pointDy = dFdy(diskPoint);
	float angleDx = (diskPoint.x*pointDx.y
			- diskPoint.y*pointDx.x)/radiusSquared;
	float angleDy = (diskPoint.x*pointDy.y
			- diskPoint.y*pointDy.x)/radiusSquared;
	float logRadiusDx = dFdx(radius)/max(radius, 0.0001);
	float logRadiusDy = dFdy(radius)/max(radius, 0.0001);
	float phaseDx = arms*angleDx + winding*logRadiusDx;
	float phaseDy = arms*angleDy + winding*logRadiusDy;
	float footprint = abs(phaseDx) + abs(phaseDy);
	float visibility = 1.0 - smoothstep(0.65, 2.35, footprint);
	float phase = arms*safeAngle(diskPoint)
			+ winding*log(max(radius/uDiskInner, 0.0001))
			- turnsPerCycle*timeCycle + phaseOffset;
	return sin(phase)*visibility;
}

float diskStructure(vec2 diskPoint, float radius,
		float radialFraction, float timeCycle) {
	float bodyPhase = uBodyPhase*TWO_PI;
	float innerWave = filteredSpiral(diskPoint, radius, 3.0, 4.5,
			28.0, timeCycle, bodyPhase*3.0 + 0.70);
	float outerWave = filteredSpiral(diskPoint, radius, 7.0, -5.5,
			14.0, timeCycle, bodyPhase*7.0 + 2.10);
	float innerWeight = 1.0 - smoothstep(0.18, 0.68, radialFraction);
	float outerWeight = smoothstep(0.25, 0.88, radialFraction);
	float strands = 0.78
			+ (0.17 + 0.05*innerWeight)*innerWave
			+ (0.075 + 0.035*outerWeight)*outerWave
			+ 0.035*innerWave*outerWave;
	return clamp(strands, 0.55, 1.14);
}

float sampleDiskVolume(vec2 projectedPoint, float flattening,
		float sinInclination, float softness, out vec2 diskPoint,
		out float sampledRadius, out float surfaceLight) {
	float radialHint = clamp(length(projectedPoint)*SQRT_27,
			uDiskInner, uDiskOuter);
	float radialFraction = saturate((radialHint - uDiskInner)
			/max(uDiskOuter - uDiskInner, 0.0001));
	float aspect = mix(0.025, 0.070, sqrt(radialFraction));
	float projectedHeight = radialHint/SQRT_27
			*aspect*sinInclination;
	float volumeBlend = smoothstep(0.12, 0.55, sinInclination);

	vec2 middlePoint = vec2(projectedPoint.x,
			projectedPoint.y/flattening);
	vec2 upperPoint = vec2(projectedPoint.x,
			(projectedPoint.y - projectedHeight)/flattening);
	vec2 lowerPoint = vec2(projectedPoint.x,
			(projectedPoint.y + projectedHeight)/flattening);
	float middleRadius = length(middlePoint)*SQRT_27;
	float upperRadius = length(upperPoint)*SQRT_27;
	float lowerRadius = length(lowerPoint)*SQRT_27;
	float middleMask = annulus(middleRadius,
			uDiskInner, uDiskOuter, softness);
	float upperMask = annulus(upperRadius,
			uDiskInner, uDiskOuter, softness)*0.52*volumeBlend;
	float lowerMask = annulus(lowerRadius,
			uDiskInner, uDiskOuter, softness)*0.52*volumeBlend;

	float weight = middleMask + upperMask + lowerMask;
	sampledRadius = (middleRadius*middleMask + upperRadius*upperMask
			+ lowerRadius*lowerMask)/max(weight, 0.0001);
	float thickFlattening = min(1.0,
			flattening + aspect*sinInclination);
	diskPoint = vec2(projectedPoint.x,
			projectedPoint.y/max(thickFlattening, 0.060));
	float surfaceFraction = (upperMask + lowerMask)/max(weight, 0.0001);
	surfaceLight = mix(0.90, 1.06, saturate(surfaceFraction));
	return 1.0 - (1.0 - middleMask)
			*(1.0 - upperMask)*(1.0 - lowerMask);
}

vec3 diskRadiance(vec2 diskPoint, float radius, float mask,
		float imageParity, float timeCycle, float surfaceLight) {

	float safeRadius = max(radius, uDiskInner + 0.0001);
	float angle = safeAngle(diskPoint);
	float radialFraction = saturate((safeRadius - uDiskInner)
			/max(uDiskOuter - uDiskInner, 0.0001));
	float zeroTorque = max(0.0,
			1.0 - sqrt(uDiskInner/safeRadius));
	float temperature = pow(max(zeroTorque
			/(safeRadius*safeRadius*safeRadius), 0.0), 0.25);
	float heat = saturate(temperature
			*pow(max(uDiskInner, 1.0), 0.75)*2.65);

	float beta = min(0.85, inversesqrt(max(safeRadius, 1.0)));
	float gamma = inversesqrt(max(0.001, 1.0 - beta*beta));
	float betaLos = clamp(beta*sin(uInclination)*cos(angle)
			*imageParity, -0.849, 0.849);
	float doppler = clamp(1.0/(gamma*(1.0 - betaLos)),
			0.25, 4.0);
	float beaming = clamp(doppler*doppler*doppler, 0.24, 4.2);

	float outerFade = 1.0
			- smoothstep(0.68, 1.0, radialFraction);
	float rawEmission = mask*uAccretionRate
			*(0.24 + 0.92*heat)*outerFade*beaming;
	float detail = diskStructure(diskPoint, safeRadius,
			radialFraction, timeCycle);
	float emission = min((1.0 - exp(-rawEmission*1.28))
			*detail*surfaceLight, 1.18);

	vec3 amber = vec3(1.0, 0.30, 0.055);
	vec3 gold = vec3(1.0, 0.70, 0.28);
	vec3 hot = vec3(1.0, 0.96, 0.82);
	vec3 color = mix(amber, gold, smoothstep(0.05, 0.50, heat));
	color = mix(color, hot, smoothstep(0.38, 1.0, heat));
	float approaching = saturate(doppler - 1.0);
	float receding = saturate(1.0 - doppler);
	color = mix(color, vec3(0.92, 0.97, 1.0),
			approaching*0.16);
	color = mix(color, vec3(1.0, 0.42, 0.10),
			receding*0.14);
	return color*emission;
}

vec3 compositeEmission(vec3 background, vec3 light) {
	vec3 base = clamp(background, vec3(0.0), vec3(1.0));
	return vec3(1.0) - (vec3(1.0) - base)
			*exp(-max(light, vec3(0.0)));
}

void main() {
	vec2 viewportSize = max(uViewport.zw, vec2(1.0));
	vec2 originalUv = clamp((gl_FragCoord.xy - uViewport.xy)
			/viewportSize, vec2(0.0), vec2(1.0));
	vec2 p = (gl_FragCoord.xy - uCenter)/max(uShadowRadius, 0.5);
	float radial = length(p);
	float proxyLimit = uProxyRadius/max(uShadowRadius, 0.5);
	if(radial > proxyLimit)
		discard;

	vec2 spinAxis = safeNormalize(uProjectedSpinAxis);
	vec2 majorAxis = vec2(-spinAxis.y, spinAxis.x);
	vec2 q = vec2(dot(p, majorAxis), dot(p, spinAxis));
	float boundary = shadowBoundary(p);
	float edgeWidth = max(1.15/max(uShadowRadius, 1.0), 0.0045);
	float shadow = 1.0 - smoothstep(boundary - edgeWidth,
			boundary + edgeWidth, radial);

	/*
	 * Weak-field background deflection.  It remains bounded and fades out
	 * before the proxy edge so an off-screen sample cannot smear a viewport
	 * border across the disk.
	 */
	vec2 radialDirection = radial > 0.0001
			? p/radial : vec2(1.0, 0.0);
	vec2 tangentDirection = vec2(-radialDirection.y, radialDirection.x);
	float impact = max(radial, boundary + 0.035);
	float inverseImpact = 1.0/impact;
	float side = sign(dot(p, majorAxis));
	float radialDeflection = min(0.36,
			0.120*inverseImpact + 0.040*inverseImpact*inverseImpact);
	float frameDragging = clamp(side*0.042*uSpin
			*inverseImpact*inverseImpact, -0.10, 0.10);
	float lensWindow = 1.0 - smoothstep(boundary + 1.65,
			max(boundary + 1.75, proxyLimit), radial);
	vec2 sampleOffset = (radialDirection*radialDeflection
			+ tangentDirection*frameDragging)*lensWindow
			*uShadowRadius/viewportSize;
	vec2 requestedUv = originalUv + sampleOffset;
	float sampleValid = step(0.0, requestedUv.x)
			*step(requestedUv.x, 1.0)
			*step(0.0, requestedUv.y)
			*step(requestedUv.y, 1.0);
	vec3 originalColor = texture2D(uSceneColor, originalUv).rgb;
	vec3 lensedColor = texture2D(uSceneColor,
			clamp(requestedUv, vec2(0.001), vec2(0.999))).rgb;
	vec3 color = mix(originalColor, lensedColor,
			lensWindow*sampleValid);

	float cosInclination = cos(uInclination);
	float sinInclination = abs(sin(uInclination));
	float viewSign = cosInclination >= 0.0 ? 1.0 : -1.0;
	float flattening = max(0.070, abs(cosInclination));
	float pixelSoftness = SQRT_27*1.55/max(uShadowRadius, 1.0);
	float diskSoftness = min(max(0.055, pixelSoftness),
			max(0.0004, (uDiskOuter - uDiskInner)*0.45));
	float timeCycle = TWO_PI*fract(
			uWorldTime/ANIMATION_PERIOD_TICKS);
	float inclinationBlend = smoothstep(0.08, 0.30, sinInclination);

	/*
	 * Inverse point-lens mapping.  Evaluating the inclined source disk in
	 * this coordinate system naturally produces the primary far-side image
	 * and the parity-flipped arc near the critical curve.
	 */
	float r2 = max(dot(q, q), 0.0025);
	float einsteinRadius = (1.10 + 0.20*sinInclination)
			*(0.85 + 0.15*boundary);
	float lensScale = 1.0
			- einsteinRadius*einsteinRadius/r2;
	vec2 source = q*lensScale;
	source += vec2(-q.y, q.x)
			*(0.030*uSpin/(r2 + 0.20));
	vec2 sourceDiskPoint;
	float sourceDiskRadius;
	float farSurfaceLight;
	float sourceDiskVolume = sampleDiskVolume(source, flattening,
			sinInclination, diskSoftness, sourceDiskPoint,
			sourceDiskRadius, farSurfaceLight);
	float farGate = smoothstep(-0.12, 0.075,
			source.y*viewSign);
	float arcLift = mix(0.62, 1.0,
			smoothstep(0.025, 0.45, abs(q.y)));
	float lensedDiskMask = sourceDiskVolume
			*farGate*arcLift*inclinationBlend;
	float imageParity = lensScale < 0.0 ? -1.0 : 1.0;
	vec3 farDisk = diskRadiance(sourceDiskPoint,
			sourceDiskRadius, lensedDiskMask, imageParity, timeCycle,
			farSurfaceLight);
	color = compositeEmission(color, farDisk);

	/* Apparent shadow occludes the far side and the captured background. */
	color = mix(color, vec3(0.0), shadow);

	/*
	 * The direct near side is evaluated after the far image, but captured
	 * rays remain black so the apparent shadow stays closed.
	 */
	vec2 directDiskPoint;
	float directDiskRadius;
	float nearSurfaceLight;
	float directDiskVolume = sampleDiskVolume(q, flattening,
			sinInclination, diskSoftness, directDiskPoint,
			directDiskRadius, nearSurfaceLight);
	float splitNearGate = smoothstep(-0.12, 0.075,
			-q.y*viewSign);
	float nearGate = mix(1.0 - shadow, splitNearGate,
			inclinationBlend);
	float directMask = directDiskVolume*nearGate*(1.0 - shadow);
	vec3 nearDisk = diskRadiance(directDiskPoint,
			directDiskRadius, directMask, 1.0, timeCycle,
			nearSurfaceLight);
	color = compositeEmission(color, nearDisk);

	float criticalBand = (1.0 - smoothstep(edgeWidth*0.65,
			edgeWidth*2.4, abs(radial - boundary)))
			*sqrt(max(uAccretionRate, 0.0))*(1.0 - shadow);
	float ringVariation = 0.58 + 0.42*saturate(
			length(farDisk)*0.40);
	float ringDoppler = 0.72 + 0.28*saturate(
			0.5 + 0.5*dot(safeNormalize(p), majorAxis));
	color = compositeEmission(color, vec3(1.0, 0.88, 0.68)
			*criticalBand*ringVariation*ringDoppler);

	float proxyFeather = max(0.08,
			3.0/max(uShadowRadius, 1.0));
	float proxyFade = 1.0 - smoothstep(
			proxyLimit - proxyFeather, proxyLimit, radial);
	color = mix(originalColor, color,
			saturate(uAlpha)*proxyFade);
	gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
