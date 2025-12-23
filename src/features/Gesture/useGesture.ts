import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useTreeStore } from '../Tree/Tree.store';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import * as THREE from 'three';

export const useGestureControl = () => {
  const { camera } = useThree();
  const setMode = useTreeStore((s) => s.setMode);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastVideoTime = useRef(-1);
  const handLandmarker = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    const video = document.createElement('video');
    // 样式保持不变
    video.style.position = 'fixed';
    video.style.top = '20px';
    video.style.right = '20px';
    video.style.width = '320px';
    video.style.height = '240px';
    video.style.opacity = '1';
    video.style.borderRadius = '12px';
    video.style.border = '2px solid #D4AF37';
    video.style.transform = 'scaleX(-1)';
    video.style.zIndex = '9999';
    video.setAttribute('playsinline', '');
    document.body.appendChild(video);
    videoRef.current = video;

    const initHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        handLandmarker.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        startWebcam();
      } catch (error) {
        console.error("Failed to load MediaPipe:", error);
      }
    };

    const startWebcam = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            videoRef.current.addEventListener("loadeddata", predictWebcam);
          }
        });
      }
    };

    const predictWebcam = () => {
      const video = videoRef.current;
      const landmarker = handLandmarker.current;

      if (video && landmarker && !video.paused && !video.ended) {
        let startTimeMs = performance.now();
        if (video.currentTime !== lastVideoTime.current) {
          lastVideoTime.current = video.currentTime;
          const results = landmarker.detectForVideo(video, startTimeMs);

          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];
            const wrist = landmarks[0];
            const indexMCP = landmarks[5];
            const middleTip = landmarks[12];
            const getDist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
            
            const palmSize = getDist(wrist, indexMCP);
            const fingerExtension = getDist(wrist, middleTip);

            if (fingerExtension > palmSize * 1.8) {
               setMode('CHAOS'); 
            } else {
               setMode('FORMED');
            }

            // === 视角控制核心逻辑 ===
            const handX = 1 - wrist.x; // 0 (左) 到 1 (右)
            const handY = wrist.y;     // 0 (上) 到 1 (下)

            // 【修改点】大幅增加倍数，扩大移动范围
            // (handX - 0.5) 范围是 -0.5 到 0.5
            // * 50 后范围是 -25 到 +25 (之前是 10)
            const targetX = (handX - 0.5) * 50; 
            
            // Y 轴也相应增加，范围更大
            const targetY = 4 + (handY - 0.5) * 20;
            
            // 平滑插值
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
            
            // 始终看向中心，产生环绕视差效果
            camera.lookAt(0, 4, 0);
          }
        }
        requestAnimationFrame(predictWebcam);
      }
    };

    initHandLandmarker();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) videoRef.current.remove();
    };
  }, [camera, setMode]);
};