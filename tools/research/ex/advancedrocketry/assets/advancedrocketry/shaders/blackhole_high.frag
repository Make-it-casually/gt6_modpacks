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
const int MAX_STEPS = 32;

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
	float visibility = 1.0 - smoothstep(0.60, 2.40, footprint);
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
	float middleWave = filteredSpiral(diskPoint, radius, 7.0, -5.5,
			14.0, timeCycle, bodyPhase*7.0 + 2.10);
	float outerWave = filteredSpiral(diskPoint, radius, 13.0, 8.0,
			7.0, timeCycle, bodyPhase*13.0 + 4.30);
	float innerWeight = 1.0 - smoothstep(0.18, 0.68, radialFraction);
	float outerWeight = smoothstep(0.25, 0.88, radialFraction);
	float strands = 0.76
			+ (0.17 + 0.05*innerWeight)*innerWave
			+ 0.085*middleWave
			+ (0.045 + 0.025*outerWeight)*outerWave
			+ 0.035*innerWave*middleWave;
	return clamp(strands, 0.52, 1.16);
}

float sampleDiskVolume(vec2 projectedPoint, float flattening,
		float sinInclination, float softness, out vec2 diskPoint,
		out float sampledRadius, out float surfaceLight) {
	float radialHint = clamp(length(projectedPoint)*SQRT_27,
			uDiskInner, uDiskOuter);
	float radialFraction = saturate((radialHint - uDiskInner)
			/max(uDiskOuter - uDiskInner, 0.0001));
	float aspect = mix(0.025, 0.075, sqrt(radialFraction));
	float projectedHeight = radialHint/SQRT_27
			*aspect*sinInclination;
	float volumeBlend = smoothstep(0.10, 0.52, sinInclination);

	vec2 middlePoint = vec2(projectedPoint.x,
			projectedPoint.y/flattening);
	vec2 upperHalfPoint = vec2(projectedPoint.x,
			(projectedPoint.y - projectedHeight*0.5)/flattening);
	vec2 lowerHalfPoint = vec2(projectedPoint.x,
			(projectedPoint.y + projectedHeight*0.5)/flattening);
	vec2 upperPoint = vec2(projectedPoint.x,
			(projectedPoint.y - projectedHeight)/flattening);
	vec2 lowerPoint = vec2(projectedPoint.x,
			(projectedPoint.y + projectedHeight)/flattening);
	float middleRadius = length(middlePoint)*SQRT_27;
	float upperHalfRadius = length(upperHalfPoint)*SQRT_27;
	float lowerHalfRadius = length(lowerHalfPoint)*SQRT_27;
	float upperRadius = length(upperPoint)*SQRT_27;
	float lowerRadius = length(lowerPoint)*SQRT_27;
	float middleMask = annulus(middleRadius,
			uDiskInner, uDiskOuter, softness);
	float upperHalfMask = annulus(upperHalfRadius,
			uDiskInner, uDiskOuter, softness)*0.48*volumeBlend;
	float lowerHalfMask = annulus(lowerHalfRadius,
			uDiskInner, uDiskOuter, softness)*0.48*volumeBlend;
	float upperMask = annulus(upperRadius,
			uDiskInner, uDiskOuter, softness)*0.22*volumeBlend;
	float lowerMask = annulus(lowerRadius,
			uDiskInner, uDiskOuter, softness)*0.22*volumeBlend;

	float weight = middleMask + upperHalfMask + lowerHalfMask
			+ upperMask + lowerMask;
	sampledRadius = (middleRadius*middleMask
			+ upperHalfRadius*upperHalfMask
			+ lowerHalfRadius*lowerHalfMask
			+ upperRadius*upperMask + lowerRadius*lowerMask)
			/max(weight, 0.0001);
	float thickFlattening = min(1.0,
			flattening + aspect*sinInclination);
	diskPoint = vec2(projectedPoint.x,
			projectedPoint.y/max(thickFlattening, 0.060));
	float surfaceFraction = (upperHalfMask + lowerHalfMask
			+ upperMask + lowerMask)/max(weight, 0.0001);
	surfaceLight = mix(0.88, 1.08, saturate(surfaceFraction));
	return 1.0 - (1.0 - middleMask)
			*(1.0 - upperHalfMask)*(1.0 - lowerHalfMask)
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
			*pow(max(uDiskInner, 1.0), 0.75)*2.75);

	float beta = min(0.85, inversesqrt(max(safeRadius, 1.0)));
	float gamma = inversesqrt(max(0.001, 1.0 - beta*beta));
	float betaLos = clamp(beta*sin(uInclination)*cos(angle)
			*imageParity, -0.849, 0.849);
	float doppler = clamp(1.0/(gamma*(1.0 - betaLos)),
			0.25, 4.0);
	float beaming = clamp(doppler*doppler*doppler, 0.22, 4.6);

	float outerFade = 1.0
			- smoothstep(0.70, 1.0, radialFraction);
	float rawEmission = mask*uAccretionRate
			*(0.22 + 0.98*heat)*outerFade*beaming;
	float detail = diskStructure(diskPoint, safeRadius,
			radialFraction, timeCycle);
	float emission = min((1.0 - exp(-rawEmission*1.32))
			*detail*surfaceLight, 1.20);

	vec3 amber = vec3(1.0, 0.28, 0.045);
	vec3 gold = vec3(1.0, 0.72, 0.30);
	vec3 hot = vec3(1.0, 0.97, 0.85);
	vec3 color = mix(amber, gold, smoothstep(0.04, 0.48, heat));
	color = mix(color, hot, smoothstep(0.34, 1.0, heat));
	float approaching = saturate(doppler - 1.0);
	float receding = saturate(1.0 - doppler);
	color = mix(color, vec3(0.91, 0.97, 1.0),
			approaching*0.18);
	color = mix(color, vec3(1.0, 0.40, 0.085),
			receding*0.15);
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
	float edgeWidth = max(1.0/max(uShadowRadius, 1.0), 0.0035);
	float shadow = 1.0 - smoothstep(boundary - edgeWidth,
			boundary + edgeWidth, radial);

	/*
	 * Bounded iterative deflection for the captured celestial background.
	 * The compile-time upper limit keeps GLSL 1.20 drivers happy; the
	 * uniform early exit makes the configured step count a real cost limit.
	 */
	vec2 ray = p;
	for(int stepIndex = 0; stepIndex < MAX_STEPS; ++stepIndex) {
		if(float(stepIndex) >= uSteps)
			break;
		float rayRadius = max(length(ray), boundary + 0.035);
		vec2 rayDirection = ray/rayRadius;
		vec2 tangent = vec2(-rayDirection.y, rayDirection.x);
		float radialStep = min(0.015,
				0.0060/(rayRadius*rayRadius));
		float spinStep = clamp(uSpin*0.0019
				/(rayRadius*rayRadius), -0.0032, 0.0032);
		ray += rayDirection*radialStep + tangent*spinStep;
	}
	float lensWindow = 1.0 - smoothstep(boundary + 1.85,
			max(boundary + 1.95, proxyLimit), radial);
	vec2 sampleOffset = (ray - p)*lensWindow
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
	float flattening = max(0.060, abs(cosInclination));
	float pixelSoftness = SQRT_27*1.35/max(uShadowRadius, 1.0);
	float diskSoftness = min(max(0.045, pixelSoftness),
			max(0.0004, (uDiskOuter - uDiskInner)*0.45));
	float timeCycle = TWO_PI*fract(
			uWorldTime/ANIMATION_PERIOD_TICKS);
	float inclinationBlend = smoothstep(0.08, 0.30, sinInclination);

	/*
	 * The source-plane disk is evaluated through the inverse point-lens
	 * equation.  Outer and parity-flipped image branches emerge from the same
	 * bounded mapping; frame dragging adds only a finite tangential offset.
	 */
	float r2 = max(dot(q, q), 0.0020);
	float einsteinRadius = (1.12 + 0.22*sinInclination)
			*(0.85 + 0.15*boundary);
	float lensScale = 1.0
			- einsteinRadius*einsteinRadius/r2;
	vec2 source = q*lensScale;
	source += vec2(-q.y, q.x)
			*(0.040*uSpin/(r2 + 0.18));
	vec2 sourceDiskPoint;
	float sourceDiskRadius;
	float farSurfaceLight;
	float sourceDiskVolume = sampleDiskVolume(source, flattening,
			sinInclination, diskSoftness, sourceDiskPoint,
			sourceDiskRadius, farSurfaceLight);
	float farGate = smoothstep(-0.11, 0.065,
			source.y*viewSign);
	float arcLift = mix(0.56, 1.0,
			smoothstep(0.018, 0.42, abs(q.y)));
	float lensedDiskMask = sourceDiskVolume
			*farGate*arcLift*inclinationBlend;
	float imageParity = lensScale < 0.0 ? -1.0 : 1.0;
	vec3 farDisk = diskRadiance(sourceDiskPoint,
			sourceDiskRadius, lensedDiskMask, imageParity, timeCycle,
			farSurfaceLight);
	color = compositeEmission(color, farDisk);

	color = mix(color, vec3(0.0), shadow);

	vec2 directDiskPoint;
	float directDiskRadius;
	float nearSurfaceLight;
	float directDiskVolume = sampleDiskVolume(q, flattening,
			sinInclination, diskSoftness, directDiskPoint,
			directDiskRadius, nearSurfaceLight);
	float splitNearGate = smoothstep(-0.11, 0.065,
			-q.y*viewSign);
	float nearGate = mix(1.0 - shadow, splitNearGate,
			inclinationBlend);
	float directMask = directDiskVolume*nearGate*(1.0 - shadow);
	vec3 nearDisk = diskRadiance(directDiskPoint,
			directDiskRadius, directMask, 1.0, timeCycle,
			nearSurfaceLight);
	color = compositeEmission(color, nearDisk);

	float criticalBand = (1.0 - smoothstep(edgeWidth*0.55,
			edgeWidth*2.1, abs(radial - boundary)))
			*sqrt(max(uAccretionRate, 0.0))*(1.0 - shadow);
	float ringVariation = 0.52 + 0.48*saturate(
			length(farDisk)*0.42);
	float ringDoppler = 0.70 + 0.30*saturate(
			0.5 + 0.5*dot(safeNormalize(p), majorAxis));
	color = compositeEmission(color, vec3(1.0, 0.90, 0.72)
			*criticalBand*ringVariation*ringDoppler);

	float proxyFeather = max(0.07,
			3.0/max(uShadowRadius, 1.0));
	float proxyFade = 1.0 - smoothstep(
			proxyLimit - proxyFeather, proxyLimit, radial);
	color = mix(originalColor, color,
			saturate(uAlpha)*proxyFade);
	gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
