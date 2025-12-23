import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateTreeData } from './treeUtils';
import { useTreeStore } from './Tree.store';

// 修复：直接定义 Shader 字符串
const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  attribute vec3 aTargetPos;
  attribute float aRandom;
  varying vec3 vColor;

  float ease(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    vColor = color;
    // 动画插值逻辑
    float p = smoothstep(0.0, 1.0, (uProgress * 1.5) - (aRandom * 0.5));
    p = ease(clamp(p, 0.0, 1.0));

    vec3 newPos = mix(position, aTargetPos, p);
    
    // 成型后的风吹摆动效果
    if (p > 0.8) {
        float wind = sin(uTime * 1.5 + newPos.y * 0.5) * 0.1 * (newPos.y + 10.0) * 0.05;
        newPos.x += wind;
    }

    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    
    // 【修改点】核心逻辑：
    // 当 uProgress 接近 0 时，乘以 0，让粒子消失。
    // smoothstep(0.0, 0.2, uProgress) 意味着进度小于 0.2 时粒子就开始变小直到消失
    float visibility = smoothstep(0.0, 0.3, uProgress); 

    gl_PointSize = (60.0 * aRandom + 20.0) * (1.0 / -mvPosition.z) * visibility;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 2.0);
    gl_FragColor = vec4(vColor, strength);
  }
`;

export const Foliage = () => {
  const count = 20000;
  const { chaosData, targetData, colors, randoms } = useMemo(() => generateTreeData(count, 'foliage'), []);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mode = useTreeStore((s) => s.mode);
  const progress = useRef(1);

  useFrame((state, delta) => {
    const target = mode === 'FORMED' ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 2.0);
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uProgress.value = progress.current;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={chaosData} itemSize={3} />
        <bufferAttribute attach="attributes-aTargetPos" count={count} array={targetData} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 }, uProgress: { value: 1 } }}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};