import * as THREE from 'three';

const getChaosPos = (radius: number = 30) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const generateTreeData = (count: number, type: 'foliage' | 'gift' | 'bauble') => {
  const chaosData = new Float32Array(count * 3);
  const targetData = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const randoms = new Float32Array(count);
  const scales = new Float32Array(count);

  const treeHeight = 22;
  const baseRadius = 8;

  for (let i = 0; i < count; i++) {
    // 1. Chaos Position
    const chaos = getChaosPos(35);
    chaos.toArray(chaosData, i * 3);

    // 2. Target Position
    let yNorm = Math.random();
    
    if (type === 'foliage') yNorm = Math.pow(yNorm, 0.9);
    
    if (type === 'gift') {
        // 【修改点 1】礼物高度限制：只允许出现在树的中下部
        // Math.pow(yNorm, 2.0) 让它们更多聚集在底部
        // * 0.85 确保没有任何礼物能到达树顶（把位置留给星星）
        yNorm = Math.pow(yNorm, 2.0) * 0.85; 
    }
    
    if (type === 'bauble') yNorm = Math.pow(yNorm, 2);

    const y = yNorm * treeHeight - (treeHeight / 2);
    const coneR = baseRadius * (1 - yNorm);
    const angle = i * 2.39996;
    const rOffset = type === 'gift' ? (Math.random() * 2) : (Math.random() - 0.5);
    const r = Math.max(0.1, coneR + rOffset);

    let x = Math.cos(angle) * r;
    let z = Math.sin(angle) * r;

    const droop = Math.pow(r / baseRadius, 2) * 3.0;
    const finalY = y - droop;

    targetData[i * 3] = x;
    targetData[i * 3 + 1] = finalY;
    targetData[i * 3 + 2] = z;

    randoms[i] = Math.random();
    
    // 3. 颜色
    const color = new THREE.Color();
    if (type === 'foliage') {
      color.setHSL(0.4, 0.9, 0.1 + Math.random() * 0.2);
    } else if (type === 'gift') {
      const palette = ['#D00000', '#FFD700', '#F0EAD6']; 
      color.set(palette[Math.floor(Math.random() * palette.length)]);
    } else {
      // 亮绿色球
      const palette = ['#32CD32', '#7CFC00', '#00FF00', '#00FA9A'];
      color.set(palette[Math.floor(Math.random() * palette.length)]);
      if(Math.random() > 0.6) color.set('#FFD700'); 
    }
    color.toArray(colors, i * 3);

    // 4. 大小 Scales
    if(type === 'foliage') {
        scales[i] = 1.0;
    } else if(type === 'gift') {
        // 【修改点 2】大幅缩小礼物盒：0.6 - 1.0 之间 (原来是 1.5 - 2.5)
        scales[i] = 0.6 + Math.random() * 0.4;
    } else {
        scales[i] = 0.4 + Math.random() * 0.4;
    }
  }

  return { chaosData, targetData, colors, randoms, scales };
};