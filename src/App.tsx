import { Canvas } from '@react-three/fiber';
import { Experience } from './scene/Experience';
import { UI } from './components/UI';
import { Suspense } from 'react';

function App() {
  return (
    <div className="w-full h-screen relative bg-[#020604]">
      <UI />
      <Canvas
        shadows
        // 调整相机位置和FOV使树显示更大更完整
        camera={{ position: [0, 8, 30], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: false, toneMappingExposure: 1.1 }}
      >
        <Suspense fallback={null}>
            <Experience />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;