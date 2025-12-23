import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber'; // 【新增】引入 useFrame 和 useThree
import * as THREE from 'three'; // 【新增】引入 THREE
import { Foliage } from '../features/Tree/Foliage';
import { Ornaments } from '../features/Tree/Ornaments';
import { Star } from '../features/Tree/Star';
import { useGestureControl } from '../features/Gesture/useGesture';
import { useTreeStore } from '../features/Tree/Tree.store'; // 【新增】引入状态库

export const Experience = () => {
  useGestureControl();

  // 【新增】获取摄像机和当前模式状态
  const { camera } = useThree();
  const mode = useTreeStore((s) => s.mode);

  // 【新增】核心逻辑：每一帧平滑移动摄像机
  useFrame((_, delta) => {
    // 定义目标距离：CHAOS 模式拉近到 15，FORMED 模式拉远回 45
    const targetZ = mode === 'CHAOS' ? 15 : 45;
    
    // 使用 lerp 进行平滑插值，delta * 1.5 控制移动速度
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 1.5);
  });

  return (
    <>
      <color attach="background" args={['#020604']} />

      <OrbitControls enablePan={false} enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 1.8} minDistance={10} maxDistance={60} />
      
      <ambientLight intensity={0.5} color="#ffffff" />
      <directionalLight position={[10, 10, 5]} intensity={2.0} color="#ffd700" castShadow />
      <pointLight position={[-10, 5, -10]} intensity={1.0} color="#00ff00" />
      <pointLight position={[0, 10, 0]} intensity={1.0} color="white" />

      <group position={[0, -5, 0]}>
        <Foliage />
        <Ornaments />
        <Star />
      </group>
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.5} levels={9} />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>
    </>
  );
};