import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// --- 辅助函数：创建五角星的 2D 形状 ---
const createStarShape = (outerRadius: number, innerRadius: number, points: number = 5) => {
  const shape = new THREE.Shape();
  const step = Math.PI / points; // 每半个角的弧度

  // 从顶点开始画线
  shape.moveTo(0, outerRadius);
  for (let i = 0; i < 2 * points; i++) {
    // 偶数点在外圆，奇数点在内圆
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step;
    // 计算坐标并画线
    shape.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius);
  }
  shape.closePath(); // 闭合形状
  return shape;
};

export const Star = () => {
  const ref = useRef<THREE.Group>(null);

  // 1. 使用 useMemo 生成几何体 (只需计算一次)
  const starGeometry = useMemo(() => {
    // 定义形状：外径 1.2，内径 0.6
    const starShape = createStarShape(1.2, 0.6);
    
    // 定义挤压设置 (让它变成 3D)
    const extrudeSettings = {
      depth: 0.4,         // 星星的厚度
      bevelEnabled: true, // 启用斜角，让边缘更圆润光滑，反光更好看
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 5    // 斜角的平滑度
    };
    
    // 生成 3D 几何体
    const geo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    // 将几何体中心移动到原点，方便旋转
    geo.center();
    return geo;
  }, []);

  // 2. 使用 useMemo 定义奢华金色材质
  const starMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#FFD700",       // 金色
    emissive: "#FFD700",    // 自发光颜色
    emissiveIntensity: 1.5, // 发光强度
    roughness: 0.1,         // 光滑度
    metalness: 1.0,         // 金属感
  }), []);

  // 3. 自转动画
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    // 调整位置到树顶
    <group position={[0, 11.8, 0]} ref={ref}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* 使用生成的几何体和材质 */}
        <mesh geometry={starGeometry} material={starMaterial} rotation={[0, 0, Math.PI / 10]} />
        
        {/* 添加点光源增强光晕效果 */}
        <pointLight intensity={3} distance={15} color="#FFD700" />
      </Float>
    </group>
  );
};
// 注意：删除了底部的 useGLTF.preload，因为不再需要外部文件了