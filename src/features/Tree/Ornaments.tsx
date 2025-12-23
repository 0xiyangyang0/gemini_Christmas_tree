import { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateTreeData } from './treeUtils';
import { useTreeStore } from '../Tree/Tree.store';

const InstancedDecor = ({ 
  count, 
  geometry, 
  material, 
  type,
  colors 
}: { 
  count: number, 
  geometry: THREE.BufferGeometry, 
  material: THREE.Material,
  type: 'gift' | 'bauble',
  colors: Float32Array
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { chaosData, targetData, scales, randoms } = useMemo(() => generateTreeData(count, type), [count, type]);
  const mode = useTreeStore((s) => s.mode);
  
  const progress = useRef(1);
  const dummy = new THREE.Object3D();

  useLayoutEffect(() => {
    if(meshRef.current) {
        for(let i=0; i<count; i++) {
            meshRef.current.setColorAt(i, new THREE.Color(colors[i*3], colors[i*3+1], colors[i*3+2]));
        }
        meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [colors, count]);

  useFrame((state, delta) => {
    const target = mode === 'FORMED' ? 1 : 0;
    const speed = type === 'gift' ? 1.2 : 2.5;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * speed);

    if (!meshRef.current) return;

    for (let i = 0; i < count; i++) {
      const cx = chaosData[i*3];
      const cy = chaosData[i*3+1];
      const cz = chaosData[i*3+2];
      
      const tx = targetData[i*3];
      const ty = targetData[i*3+1];
      const tz = targetData[i*3+2];

      const rnd = randoms[i];
      let p = smoothstep(0.0, 1.0, (progress.current * 1.2) - (rnd * 0.2));
      
      dummy.position.set(
        THREE.MathUtils.lerp(cx, tx, p),
        THREE.MathUtils.lerp(cy, ty, p),
        THREE.MathUtils.lerp(cz, tz, p)
      );

      dummy.rotation.x = p * Math.PI * 2 + rnd;
      dummy.rotation.y = p * Math.PI * 2 + state.clock.elapsedTime * 0.5 * rnd;
      
      // 保持大小，不消失
      dummy.scale.setScalar(scales[i]); 

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} castShadow receiveShadow />
  );
};

export const Ornaments = () => {
  // === 修改部分：不再使用 useGLTF 加载外部模型 ===
  
  // 1. 定义几何体
  // 礼物盒：简单的立方体
  const giftGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  // 彩球：球体
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.6, 16, 16), []);
  
  // 2. 定义材质
  const giftMat = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.3,
    metalness: 0.5,
  }), []);

  const baubleMat = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.1,
    metalness: 0.8,
    emissive: new THREE.Color('#002200'),
    emissiveIntensity: 0.1
  }), []);

  const giftColors = useMemo(() => generateTreeData(400, 'gift').colors, []);
  const baubleColors = useMemo(() => generateTreeData(2000, 'bauble').colors, []);

  return (
    <group>
      <InstancedDecor count={180} geometry={giftGeo} material={giftMat} type="gift" colors={giftColors} />
      <InstancedDecor count={200} geometry={sphereGeo} material={baubleMat} type="bauble" colors={baubleColors} />
    </group>
  );
};

function smoothstep(min:number, max:number, value:number) {
  var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
  return x*x*(3 - 2*x);
}