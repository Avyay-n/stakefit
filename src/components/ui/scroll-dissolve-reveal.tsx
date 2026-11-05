import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "../../lib/utils";

const coverVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Burning Fire Dissolve Shader (Rich Red & Orange Flame Edge, No Gray/Black)
const coverFragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uImageResolution;
  uniform float uDissolve;
  uniform vec2 uCenter;
  uniform float uTime;
  uniform float uGrayscale;
  uniform float uEdgeIntensity;
  uniform float uEdgeBrightness;
  varying vec2 vUv;

  mat3 sobelX = mat3(
    -1.0, 0.0, 1.0,
    -2.0, 0.0, 2.0,
    -1.0, 0.0, 1.0
  );

  mat3 sobelY = mat3(
    -1.0, -2.0, -1.0,
     0.0,  0.0,  0.0,
     1.0,  2.0,  1.0
  );

  float getLuminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  float sobel(sampler2D tex, vec2 uv, vec2 texelSize) {
    float gx = 0.0;
    float gy = 0.0;

    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        vec2 offset = vec2(float(i), float(j)) * texelSize;
        float lum = getLuminance(texture2D(tex, uv + offset).rgb);
        gx += lum * sobelX[i + 1][j + 1];
        gy += lum * sobelY[i + 1][j + 1];
      }
    }

    return sqrt(gx * gx + gy * gy);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }

  void main() {
    vec2 ratio = vec2(
      min((uResolution.x / uResolution.y) / (uImageResolution.x / uImageResolution.y), 1.0),
      min((uResolution.y / uResolution.x) / (uImageResolution.y / uImageResolution.x), 1.0)
    );

    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    vec4 texColor = texture2D(uTexture, uv);
    
    // Burning fire tint instead of cold grey
    vec3 fireCharColor = vec3(0.04, 0.01, 0.0);
    vec3 baseColor = mix(texColor.rgb, fireCharColor, uGrayscale * 0.85);
    
    vec2 centeredUv = vUv - uCenter;
    float aspect = uResolution.x / uResolution.y;
    centeredUv.x *= aspect;
    float dist = length(centeredUv);
    
    float angle = atan(centeredUv.y, centeredUv.x);
    
    float noiseScale = 5.0;
    vec2 pixelatedUv = floor(vUv * uResolution / noiseScale) * noiseScale / uResolution;
    float blockNoise = fbm(pixelatedUv * 90.0) * 0.16;
    float angularNoise = fbm(vec2(angle * 5.0, uTime * 0.4)) * 0.14;
    
    float totalNoise = blockNoise + angularNoise;
    float noisyDist = dist + totalNoise;
    
    float maxDist = length(vec2(aspect * 0.5, 0.5));
    float normalizedDist = noisyDist / maxDist;
    
    float dissolveThreshold = uDissolve * 1.55; 
    
    vec2 texelSize = 1.0 / uResolution;
    float edge = sobel(uTexture, uv, texelSize);
    edge = pow(edge, 0.65) * 2.2;
    edge = clamp(edge, 0.0, 1.0);
    
    float dissolveMask = smoothstep(dissolveThreshold - 0.035, dissolveThreshold, normalizedDist);
    
    // BURNING FIRE EDGE COLORS: Vivid crimson red and fiery bright orange mix
    vec3 flameRed = vec3(0.95, 0.12, 0.02);
    vec3 flameOrange = vec3(1.0, 0.48, 0.04);
    vec3 flameYellow = vec3(1.0, 0.88, 0.22);
    
    vec3 fireEdgeColor = mix(flameRed, flameOrange, clamp(edge * 1.4, 0.0, 1.0));
    fireEdgeColor = mix(fireEdgeColor, flameYellow, clamp(pow(edge, 2.0), 0.0, 1.0));
    
    vec3 finalColor = baseColor;
    
    float edgeGlowIntensity = uEdgeIntensity * 3.0;
    float edgeGlow = edge * edgeGlowIntensity * (1.2 + uGrayscale * 2.5);
    finalColor += fireEdgeColor * edgeGlow * uEdgeBrightness;
    
    // Burning Ember Sparkles in Fire Red/Orange/Yellow
    float edgeZoneWidth = 0.16 * (1.0 - uDissolve) + 0.03;
    float edgeZone = smoothstep(dissolveThreshold - edgeZoneWidth, dissolveThreshold - edgeZoneWidth + 0.045, normalizedDist) * 
                     smoothstep(dissolveThreshold + 0.025, dissolveThreshold - 0.025, normalizedDist);
    float sparkle = hash(floor(vUv * uResolution / 3.5)) * edgeZone;
    
    float edgeBrightness = (1.0 - uDissolve) * uEdgeBrightness * (1.0 + uGrayscale * 1.8);
    vec3 emberColor = mix(flameOrange, flameYellow, hash(floor(vUv * uResolution / 2.0)));
    finalColor += emberColor * (sparkle * 4.5 * edgeBrightness);
    
    float alpha = dissolveMask * texColor.a;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Burning Fire Dissolve Shader for Revealed Layer
const coverFragmentShaderReverse = `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uImageResolution;
  uniform float uDissolve;
  uniform vec2 uCenter;
  uniform float uTime;
  uniform float uBrightness;
  uniform float uEdgeIntensity;
  uniform float uDarkness;
  uniform float uGrayscale;
  varying vec2 vUv;

  mat3 sobelX = mat3(
    -1.0, 0.0, 1.0,
    -2.0, 0.0, 2.0,
    -1.0, 0.0, 1.0
  );

  mat3 sobelY = mat3(
    -1.0, -2.0, -1.0,
     0.0,  0.0,  0.0,
     1.0,  2.0,  1.0
  );

  float getLuminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  float sobel(sampler2D tex, vec2 uv, vec2 texelSize) {
    float gx = 0.0;
    float gy = 0.0;

    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        vec2 offset = vec2(float(i), float(j)) * texelSize;
        float lum = getLuminance(texture2D(tex, uv + offset).rgb);
        gx += lum * sobelX[i + 1][j + 1];
        gy += lum * sobelY[i + 1][j + 1];
      }
    }

    return sqrt(gx * gx + gy * gy);
  }

  void main() {
    vec2 ratio = vec2(
      min((uResolution.x / uResolution.y) / (uImageResolution.x / uImageResolution.y), 1.0),
      min((uResolution.y / uResolution.x) / (uImageResolution.y / uImageResolution.x), 1.0)
    );

    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    vec4 texColor = texture2D(uTexture, uv);
    
    vec2 texelSize = 1.0 / uResolution;
    float edge = sobel(uTexture, uv, texelSize);
    edge = pow(edge, 0.65) * 2.2;
    edge = clamp(edge, 0.0, 1.0);
    
    // BURNING FIRE EDGE COLORS
    vec3 flameRed = vec3(0.95, 0.12, 0.02);
    vec3 flameOrange = vec3(1.0, 0.52, 0.05);
    vec3 fireEdge = mix(flameRed, flameOrange, clamp(edge * 1.5, 0.0, 1.0));
    
    vec3 darkBase = vec3(0.01, 0.0, 0.0);
    vec3 baseColor = mix(texColor.rgb, darkBase, uDarkness);
    
    float edgeGlow = edge * uEdgeIntensity * 2.8;
    baseColor += fireEdge * edgeGlow;
    
    vec3 finalColor = clamp(baseColor, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, texColor.a);
  }
`;

interface SceneProps {
  imageFront: string;
  imageBack: string;
  progress: number;
}

const Scene = ({ imageFront, imageBack, progress }: SceneProps) => {
  const [texture1, texture2] = useTexture([imageFront, imageBack]);
  const material1Ref = useRef<THREE.ShaderMaterial>(null);
  const material2Ref = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms1 = useMemo(
    () => ({
      uTexture: { value: texture1 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uImageResolution: {
        value: new THREE.Vector2(
          (texture1.image as HTMLImageElement)?.width || 1920,
          (texture1.image as HTMLImageElement)?.height || 1080
        ),
      },
      uDissolve: { value: 0.0 },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0.0 },
      uGrayscale: { value: 0.0 },
      uEdgeIntensity: { value: 0.0 },
      uEdgeBrightness: { value: 1.0 },
    }),
    [texture1, size]
  );

  const uniforms2 = useMemo(
    () => ({
      uTexture: { value: texture2 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uImageResolution: {
        value: new THREE.Vector2(
          (texture2.image as HTMLImageElement)?.width || 1920,
          (texture2.image as HTMLImageElement)?.height || 1080
        ),
      },
      uDissolve: { value: 0.0 },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0.0 },
      uBrightness: { value: 0.0 },
      uEdgeIntensity: { value: 0.6 },
      uDarkness: { value: 1.0 },
      uGrayscale: { value: 1.0 },
    }),
    [texture2, size]
  );

  useFrame((state) => {
    const timeInSeconds = state.clock.getElapsedTime();

    if (material1Ref.current) {
      material1Ref.current.uniforms.uTime.value = timeInSeconds;
      material1Ref.current.uniforms.uResolution.value.set(
        size.width,
        size.height
      );

      material1Ref.current.uniforms.uDissolve.value = progress;
      const grayscaleProgress = Math.min(1.0, progress / 0.4);
      material1Ref.current.uniforms.uGrayscale.value = grayscaleProgress;
      material1Ref.current.uniforms.uEdgeIntensity.value = progress * 0.7;
      material1Ref.current.uniforms.uEdgeBrightness.value = 1.0 - progress;
    }

    if (material2Ref.current) {
      material2Ref.current.uniforms.uTime.value = timeInSeconds;
      material2Ref.current.uniforms.uResolution.value.set(
        size.width,
        size.height
      );

      const acceleratedProgress = Math.min(1.0, progress * 1.15);
      material2Ref.current.uniforms.uEdgeIntensity.value =
        0.8 * (1.0 - acceleratedProgress);
      material2Ref.current.uniforms.uDarkness.value =
        1.0 - acceleratedProgress;
      material2Ref.current.uniforms.uGrayscale.value =
        1.0 - acceleratedProgress;
    }
  });

  return (
    <>
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={material2Ref}
          vertexShader={coverVertexShader}
          fragmentShader={coverFragmentShaderReverse}
          uniforms={uniforms2}
          transparent={true}
        />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={material1Ref}
          vertexShader={coverVertexShader}
          fragmentShader={coverFragmentShader}
          uniforms={uniforms1}
          transparent={true}
        />
      </mesh>
    </>
  );
};

export interface ScrollDissolveRevealProps {
  imageFront: string;
  imageBack: string;
  progress: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function ScrollDissolveReveal({
  imageFront,
  imageBack,
  progress,
  className,
  style,
  children,
}: ScrollDissolveRevealProps) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden select-none", className)} style={style}>
      <Canvas dpr={1} frameloop="always" gl={{ antialias: false, alpha: false }}>
        <OrthographicCamera
          makeDefault
          manual
          left={-1}
          right={1}
          top={1}
          bottom={-1}
          near={0.1}
          far={10}
          position={[0, 0, 1]}
        />
        <React.Suspense fallback={null}>
          <Scene
            imageFront={imageFront}
            imageBack={imageBack}
            progress={progress}
          />
        </React.Suspense>
      </Canvas>
      {children}
    </div>
  );
}
