uniform sampler2D uOpticalDepthLut;
uniform vec2 uLutSize;
uniform vec3 uLutDecodeScale;

uniform float uGroundRadius;
uniform float uAtmosphereRadius;
uniform float uRayleighScaleHeight;
uniform float uMieScaleHeight;
uniform float uAbsorptionCenter;
uniform float uAbsorptionWidth;

uniform vec3 uBetaRayleigh;
uniform vec3 uBetaMieScattering;
uniform vec3 uBetaMieExtinction;
uniform vec3 uBetaAbsorption;
uniform vec3 uRayleighTint;
uniform vec3 uLightRadiance;

uniform float uMieAnisotropy;
uniform float uMultipleScattering;
uniform float uExposure;
uniform float uAlpha;
uniform int uDebugView;

const float ATM_PI = 3.14159265358979323846;
const float ATM_EPSILON = 0.00001;
const float ATM_RELATIVE_EPSILON = 0.0000004;
const float ATM_MAX_TAU = 50.0;

float atmosphereLuminance(vec3 value) {
	return dot(value, vec3(0.2126, 0.7152, 0.0722));
}

bool atmosphereInvalid(float value) {
	return value != value || abs(value) > 1.0e18;
}

bool atmosphereRaySphere(vec3 origin, vec3 direction, float radius,
		out float nearHit, out float farHit) {
	float b = dot(origin, direction);
	float c = dot(origin, origin) - radius*radius;
	float bSquared = b*b;
	float discriminant = bSquared - c;
	float tolerance = ATM_RELATIVE_EPSILON
			*max(1.0, max(abs(bSquared), abs(c)));
	if(discriminant < -tolerance)
		return false;
	float root = sqrt(max(discriminant, 0.0));
	nearHit = -b - root;
	farHit = -b + root;
	return farHit >= 0.0;
}

float atmosphereRayleighDensity(float height) {
	if(height < 0.0)
		return 0.0;
	return exp(clamp(-height
			/max(uRayleighScaleHeight, ATM_EPSILON), -50.0, 0.0));
}

float atmosphereMieDensity(float height) {
	if(height < 0.0)
		return 0.0;
	return exp(clamp(-height
			/max(uMieScaleHeight, ATM_EPSILON), -50.0, 0.0));
}

float atmosphereAbsorptionDensity(float height) {
	if(height < 0.0)
		return 0.0;
	return max(0.0, 1.0 - abs(height-uAbsorptionCenter)
			/max(uAbsorptionWidth, ATM_EPSILON));
}

float atmosphereRayleighPhase(float mu) {
	mu = clamp(mu, -1.0, 1.0);
	return 3.0*(1.0 + mu*mu)/(16.0*ATM_PI);
}

float atmosphereMiePhase(float mu) {
	mu = clamp(mu, -1.0, 1.0);
	float g = clamp(uMieAnisotropy, -0.2, 0.95);
	float g2 = g*g;
	float denominator = max(1.0 + g2 - 2.0*g*mu, ATM_EPSILON);
	return (3.0/(8.0*ATM_PI))
			*((1.0-g2)*(1.0+mu*mu))
			/((2.0+g2)*pow(denominator, 1.5));
}

vec3 atmosphereLightColumns(vec3 samplePosition, vec3 lightDirection,
		out bool blocked) {
	float radius = length(samplePosition);
	float height = clamp(radius-uGroundRadius, 0.0,
			uAtmosphereRadius-uGroundRadius);
	float radiusSafe = max(radius, ATM_EPSILON);
	float geometryRadius = max(radius, uGroundRadius);
	float ratio = clamp(uGroundRadius
			/max(geometryRadius, ATM_EPSILON), 0.0, 1.0);
	float muHorizon = -sqrt(max(0.0, 1.0-ratio*ratio));
	float mu = clamp(dot(samplePosition/radiusSafe, lightDirection),
			-1.0, 1.0);
	float angularEpsilon = (1.0-muHorizon)
			*pow(0.5/max(uLutSize.y, 1.0), 2.0);
	blocked = mu <= muHorizon + angularEpsilon;
	if(blocked)
		return vec3(0.0);

	float atmosphereHeight = max(
			uAtmosphereRadius-uGroundRadius, ATM_EPSILON);
	float heightCoordinate = sqrt(clamp(height/atmosphereHeight, 0.0, 1.0));
	float q = clamp((mu-muHorizon)
			/max(1.0-muHorizon, ATM_EPSILON), 0.0, 1.0);
	float directionCoordinate = sqrt(q);
	vec2 firstCenter = 0.5/max(uLutSize, vec2(1.0));
	vec2 lastCenter = vec2(1.0)-firstCenter;
	vec2 uv = clamp(vec2(heightCoordinate, directionCoordinate),
			firstCenter, lastCenter);
	return texture2D(uOpticalDepthLut, uv).rgb*uLutDecodeScale;
}

float atmosphereQuadratureEdge(float nearHit, float farHit,
		float closest, float sampleIndex, float leftCount,
		float rightCount) {
	if(leftCount <= 0.0) {
		float edge = sampleIndex/max(rightCount, 1.0);
		return closest + (farHit-closest)*edge*edge;
	}
	if(rightCount <= 0.0) {
		float edge = sampleIndex/max(leftCount, 1.0);
		float inverse = 1.0-edge;
		return nearHit + (closest-nearHit)*(1.0-inverse*inverse);
	}
	if(sampleIndex <= leftCount) {
		float edge = sampleIndex/leftCount;
		float inverse = 1.0-edge;
		return nearHit + (closest-nearHit)*(1.0-inverse*inverse);
	}
	float edge = (sampleIndex-leftCount)/rightCount;
	return closest + (farHit-closest)*edge*edge;
}

float atmosphereBayer4x4(vec2 pixel) {
	float x = mod(floor(pixel.x), 4.0);
	float y = mod(floor(pixel.y), 4.0);
	float row0 = x < 1.0 ? 0.0 : (x < 2.0 ? 8.0 : (x < 3.0 ? 2.0 : 10.0));
	float row1 = x < 1.0 ? 12.0 : (x < 2.0 ? 4.0 : (x < 3.0 ? 14.0 : 6.0));
	float row2 = x < 1.0 ? 3.0 : (x < 2.0 ? 11.0 : (x < 3.0 ? 1.0 : 9.0));
	float row3 = x < 1.0 ? 15.0 : (x < 2.0 ? 7.0 : (x < 3.0 ? 13.0 : 5.0));
	float value = y < 1.0 ? row0 : (y < 2.0 ? row1 : (y < 3.0 ? row2 : row3));
	return (value+0.5)/16.0-0.5;
}

vec4 atmosphereIntegrate(vec3 origin, vec3 rayDirection,
		vec3 lightDirection) {
	float atmosphereNear;
	float atmosphereFar;
	if(!atmosphereRaySphere(origin, rayDirection, uAtmosphereRadius,
			atmosphereNear, atmosphereFar))
		return vec4(0.0);

	float nearHit = max(atmosphereNear, 0.0);
	float farHit = atmosphereFar;
	float originRadius = length(origin);
	float radialTolerance = max(ATM_EPSILON,
			ATM_RELATIVE_EPSILON*uGroundRadius);
	if(originRadius < uGroundRadius-radialTolerance)
		return vec4(0.0);
	float groundNear;
	float groundFar;
	if(atmosphereRaySphere(origin, rayDirection, uGroundRadius,
			groundNear, groundFar)) {
		if(originRadius <= uGroundRadius+radialTolerance
				&& dot(origin, rayDirection) < 0.0)
			return vec4(0.0);
		if(groundNear >= nearHit-radialTolerance
				&& groundNear <= farHit+radialTolerance)
			farHit = min(farHit, max(nearHit, groundNear));
	}
	if(farHit <= nearHit+ATM_EPSILON)
		return vec4(0.0);

	float closest = clamp(-dot(origin, rayDirection), nearHit, farHit);
	float leftLength = closest-nearHit;
	float rightLength = farHit-closest;
	float leftCount = floor(float(ATMOSPHERE_SAMPLE_COUNT)/2.0);
	float rightCount = float(ATMOSPHERE_SAMPLE_COUNT)-leftCount;
	if(leftLength <= ATM_EPSILON) {
		leftCount = 0.0;
		rightCount = float(ATMOSPHERE_SAMPLE_COUNT);
		closest = nearHit;
	}
	else if(rightLength <= ATM_EPSILON) {
		leftCount = float(ATMOSPHERE_SAMPLE_COUNT);
		rightCount = 0.0;
		closest = farHit;
	}

	vec3 viewDepth = vec3(0.0);
	vec3 radiance = vec3(0.0);
	vec3 rayleighRadiance = vec3(0.0);
	vec3 mieRadiance = vec3(0.0);
	float phaseRayleigh = atmosphereRayleighPhase(
			dot(lightDirection, rayDirection));
	float phaseMie = atmosphereMiePhase(
			dot(lightDirection, rayDirection));

	for(int sampleIndex = 0;
			sampleIndex < ATMOSPHERE_SAMPLE_COUNT; sampleIndex++) {
		float edge0 = atmosphereQuadratureEdge(nearHit, farHit,
				closest, float(sampleIndex), leftCount, rightCount);
		float edge1 = atmosphereQuadratureEdge(nearHit, farHit,
				closest, float(sampleIndex+1), leftCount, rightCount);
		float stepLength = max(edge1-edge0, 0.0);
		float sampleDistance = 0.5*(edge0+edge1);
		vec3 samplePosition = origin + rayDirection*sampleDistance;
		float height = length(samplePosition)-uGroundRadius;
		float densityRayleigh = atmosphereRayleighDensity(height);
		float densityMie = atmosphereMieDensity(height);
		float densityAbsorption = atmosphereAbsorptionDensity(height);
		vec3 halfStepDepth = 0.5*stepLength
				*vec3(densityRayleigh, densityMie, densityAbsorption);
		viewDepth += halfStepDepth;

		bool blocked;
		vec3 lightDepth = atmosphereLightColumns(samplePosition,
				lightDirection, blocked);
		if(!blocked) {
			vec3 opticalDepth =
					uBetaRayleigh*(viewDepth.x+lightDepth.x)
					+uBetaMieExtinction*(viewDepth.y+lightDepth.y)
					+uBetaAbsorption*(viewDepth.z+lightDepth.z);
			vec3 transmittance = exp(-clamp(opticalDepth,
					vec3(0.0), vec3(ATM_MAX_TAU)));
			vec3 rayleighStep = transmittance*uLightRadiance
					*(uBetaRayleigh*densityRayleigh*phaseRayleigh)
					*stepLength;
			vec3 mieStep = transmittance*uLightRadiance
					*(uBetaMieScattering*densityMie*phaseMie)
					*stepLength;
			rayleighRadiance += rayleighStep;
			mieRadiance += mieStep;
			radiance += rayleighStep+mieStep;
		}
		viewDepth += halfStepDepth;
	}

	vec3 viewOpticalDepth = uBetaRayleigh*viewDepth.x
			+uBetaMieExtinction*viewDepth.y
			+uBetaAbsorption*viewDepth.z;
	vec3 viewTransmittance = exp(-clamp(viewOpticalDepth,
			vec3(0.0), vec3(ATM_MAX_TAU)));
	float opacity = clamp(1.0-atmosphereLuminance(viewTransmittance),
			0.0, 1.0);

	vec3 multipleRadiance = vec3(0.0);
	if(uMultipleScattering > 0.0) {
		float localLightCosine = originRadius > ATM_EPSILON
				? dot(origin/originRadius, lightDirection) : -1.0;
		float ambientBound = smoothstep(-0.15, 0.35,
				clamp(localLightCosine, -1.0, 1.0));
		float lightBound = clamp(atmosphereLuminance(
				max(uLightRadiance, vec3(0.0))), 0.0, 1.0);
		multipleRadiance = min(vec3(0.25),
				max(uMultipleScattering, 0.0)
				*(1.0-atmosphereLuminance(viewTransmittance))
				*ambientBound*lightBound
				*clamp(uRayleighTint, vec3(0.0), vec3(4.0)));
		radiance += multipleRadiance;
	}

	if(uDebugView == 1)
		radiance = vec3(atmosphereLuminance(viewTransmittance));
	else if(uDebugView == 2)
		radiance = rayleighRadiance;
	else if(uDebugView == 3)
		radiance = mieRadiance;
	else if(uDebugView == 4)
		radiance = vec3(clamp(atmosphereLuminance(viewOpticalDepth)
				/10.0, 0.0, 1.0));
	else if(uDebugView == 5)
		radiance = multipleRadiance;

	vec3 mapped = vec3(1.0)-exp(-max(radiance, vec3(0.0))
			*max(uExposure, 0.0));
	mapped = pow(clamp(mapped, vec3(0.0), vec3(1.0)),
			vec3(1.0/2.2));
	float dither = atmosphereBayer4x4(gl_FragCoord.xy)/255.0;
	mapped = clamp(mapped+vec3(dither), vec3(0.0), vec3(1.0));
	if(atmosphereInvalid(mapped.x) || atmosphereInvalid(mapped.y)
			|| atmosphereInvalid(mapped.z))
		mapped = vec3(1.0, 0.0, 1.0);
	return vec4(mapped*clamp(uAlpha, 0.0, 1.0),
			opacity*clamp(uAlpha, 0.0, 1.0));
}
