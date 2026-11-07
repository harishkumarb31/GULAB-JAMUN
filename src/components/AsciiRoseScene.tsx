import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Eye, RotateCw } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

interface AsciiRoseSceneProps {
  onComplete: () => void;
  onStartMusic?: () => void;
}

export const AsciiRoseScene: React.FC<AsciiRoseSceneProps> = ({ onComplete, onStartMusic }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Story stages:
  // 0: Start Screen
  // 1: First Quote: "Like a flower, you have your own beautiful way of blooming."
  // 2: Blooming Rose (unfolding from closed bud to full bloom)
  // 3: Full Bloom Reveal: "Today, this rose blooms just for you, Bhoomika."
  const [stage, setStage] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [bloomProgress, setBloomProgress] = useState<number>(0.05); // 0.05 (closed bud) -> 1.0 (full bloom)
  const [isRotating, setIsRotating] = useState<boolean>(true);

  // Manual rotation refs for drag interaction
  const manualRot = useRef<{ x: number; y: number }>({ x: 0.15, y: 0 });
  const isDragging = useRef<boolean>(false);
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Floating background particles
  const particlesRef = useRef<
    Array<{ x: number; y: number; speed: number; size: number; char: string; color: string; alpha: number }>
  >([]);

  // Initialize background star dust
  useEffect(() => {
    const chars = ['✦', '✧', '⋆', '･', '°', '·', '❀'];
    const colors = ['#fbcfe8', '#f472b6', '#fbbf24', '#ffffff', '#fda4af'];
    const p: typeof particlesRef.current = [];
    for (let i = 0; i < 75; i++) {
      p.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: Math.random() * 0.4 + 0.2,
        size: Math.random() * 6 + 9,
        char: chars[Math.floor(Math.random() * chars.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.25,
      });
    }
    particlesRef.current = p;
  }, []);

  // Narrative Story flow
  const startExperience = () => {
    setHasStarted(true);
    audioSystem.startMusic();
    if (onStartMusic) onStartMusic();

    setTimeout(() => {
      setStage(1); // Quote 1
    }, 600);

    setTimeout(() => {
      setStage(2); // Start blooming
      audioSystem.playRoseBloom();
    }, 4200);
  };

  const handleSkipToBloom = () => {
    setStage(3);
    setBloomProgress(1.0);
  };

  // Bloom animation loop
  useEffect(() => {
    if (stage < 2) return;

    const interval = setInterval(() => {
      setBloomProgress((prev) => {
        if (prev >= 1.0) {
          clearInterval(interval);
          setStage(3); // Full bloom achieved
          return 1.0;
        }
        return Math.min(1.0, prev + 0.009);
      });
    }, 45);

    return () => clearInterval(interval);
  }, [stage]);

  // THREE.JS & ASCII CONVERTER ENGINE
  useEffect(() => {
    const displayCanvas = canvasRef.current;
    if (!displayCanvas) return;
    const displayCtx = displayCanvas.getContext('2d');
    if (!displayCtx) return;

    // 1. Offscreen WebGL Canvas for 3D Geometry
    const offWidth = 320;
    const offHeight = 320;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = offWidth;
    offCanvas.height = offHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas: offCanvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(offWidth, offHeight);
    renderer.setPixelRatio(1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, offWidth / offHeight, 0.1, 100);
    camera.position.set(0, 0.8, 4.4);
    camera.lookAt(0, 0, 0);

    // 2. Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x2a0814, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff0f5, 3.2);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const pinkFillLight = new THREE.DirectionalLight(0xff2a6d, 2.8);
    pinkFillLight.position.set(-4, 2, 2);
    scene.add(pinkFillLight);

    const rimLight = new THREE.DirectionalLight(0xffd1dc, 2.2);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // 3. Rose Root Object
    const roseGroup = new THREE.Group();
    scene.add(roseGroup);

    // PETAL GENERATOR
    // Creates a realistic curved petal with organic rim cupping and reflexing
    const createPetalGeometry = (width: number, height: number, cup: number, reflex: number) => {
      const uSegs = 14;
      const vSegs = 14;
      const geom = new THREE.PlaneGeometry(width, height, uSegs, vSegs);
      const pos = geom.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const u = (pos.getY(i) / height) + 0.5; // 0 (base) to 1 (tip)
        const v = (pos.getX(i) / (width / 2)); // -1 (left) to 1 (right)

        // Taper base and flare out mid-petal
        const widthTaper = Math.sin(Math.pow(u, 0.8) * Math.PI) * 0.95 + 0.05;
        pos.setX(i, pos.getX(i) * widthTaper);

        // Cup curvature (curving inward around the core)
        const cupping = Math.cos(v * Math.PI * 0.5) * cup * Math.sin(u * Math.PI);

        // Reflexing (top rim curls outward/backward like real rose petals)
        const reflexing = Math.pow(Math.max(0, u - 0.45) / 0.55, 2) * reflex;

        pos.setZ(i, -cupping + reflexing);
      }

      geom.computeVertexNormals();
      return geom;
    };

    // Material definitions
    const innerPetalMat = new THREE.MeshStandardMaterial({
      color: 0x880826, // Deep velvety crimson
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    const midPetalMat = new THREE.MeshStandardMaterial({
      color: 0xc70039, // Rich red
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    const outerPetalMat = new THREE.MeshStandardMaterial({
      color: 0xe0115f, // Ruby rose
      roughness: 0.35,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });

    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x1e5631, // Deep stem green
      roughness: 0.5,
      metalness: 0.05,
    });

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f, // Rose leaf green
      roughness: 0.4,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    // Petal Layer Structure
    interface PetalNode {
      mesh: THREE.Mesh;
      baseRotX: number;
      bloomRotX: number;
      baseRotZ: number;
      layer: number;
    }
    const petalNodes: PetalNode[] = [];

    // Layer 0: Tight Central Bud (4 petals tightly spiraled)
    for (let i = 0; i < 4; i++) {
      const geom = createPetalGeometry(0.45, 0.7, 0.22, 0.05);
      const mesh = new THREE.Mesh(geom, innerPetalMat);
      mesh.rotation.y = (i * Math.PI) / 2 + 0.2;
      mesh.position.y = 0.2;
      roseGroup.add(mesh);
      petalNodes.push({
        mesh,
        baseRotX: 0.05,
        bloomRotX: 0.25,
        baseRotZ: (i % 2 === 0 ? 0.05 : -0.05),
        layer: 0,
      });
    }

    // Layer 1: Inner Spiraling Petals (5 petals)
    for (let i = 0; i < 5; i++) {
      const geom = createPetalGeometry(0.65, 0.85, 0.28, 0.12);
      const mesh = new THREE.Mesh(geom, innerPetalMat);
      mesh.rotation.y = (i * 2 * Math.PI) / 5 + 0.4;
      mesh.position.y = 0.15;
      roseGroup.add(mesh);
      petalNodes.push({
        mesh,
        baseRotX: 0.12,
        bloomRotX: 0.45,
        baseRotZ: 0.08,
        layer: 1,
      });
    }

    // Layer 2: Mid-Whorl Petals (6 petals cupped and reflexing)
    for (let i = 0; i < 6; i++) {
      const geom = createPetalGeometry(0.85, 1.05, 0.35, 0.25);
      const mesh = new THREE.Mesh(geom, midPetalMat);
      mesh.rotation.y = (i * 2 * Math.PI) / 6 + 0.6;
      mesh.position.y = 0.1;
      roseGroup.add(mesh);
      petalNodes.push({
        mesh,
        baseRotX: 0.18,
        bloomRotX: 0.75,
        baseRotZ: 0.1,
        layer: 2,
      });
    }

    // Layer 3: Outer Reflexed Petals (7 large petals)
    for (let i = 0; i < 7; i++) {
      const geom = createPetalGeometry(1.1, 1.25, 0.38, 0.45);
      const mesh = new THREE.Mesh(geom, outerPetalMat);
      mesh.rotation.y = (i * 2 * Math.PI) / 7 + 0.3;
      mesh.position.y = 0.05;
      roseGroup.add(mesh);
      petalNodes.push({
        mesh,
        baseRotX: 0.25,
        bloomRotX: 1.05,
        baseRotZ: 0.12,
        layer: 3,
      });
    }

    // Layer 4: Lowermost Full Outer Petals (7 large drooping petals)
    for (let i = 0; i < 7; i++) {
      const geom = createPetalGeometry(1.3, 1.4, 0.42, 0.65);
      const mesh = new THREE.Mesh(geom, outerPetalMat);
      mesh.rotation.y = (i * 2 * Math.PI) / 7 + 0.7;
      mesh.position.y = 0.0;
      roseGroup.add(mesh);
      petalNodes.push({
        mesh,
        baseRotX: 0.32,
        bloomRotX: 1.35,
        baseRotZ: 0.15,
        layer: 4,
      });
    }

    // STEM: Naturally curved tube extending downwards
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0.04, -0.6, 0.02),
      new THREE.Vector3(-0.06, -1.3, -0.03),
      new THREE.Vector3(0.02, -2.1, 0.01),
    ]);
    const stemGeom = new THREE.TubeGeometry(stemCurve, 24, 0.065, 8, false);
    const stemMesh = new THREE.Mesh(stemGeom, stemMat);
    roseGroup.add(stemMesh);

    // SEPAL (5 green calyx leaflets under flower head)
    for (let i = 0; i < 5; i++) {
      const sepalGeom = createPetalGeometry(0.25, 0.65, 0.15, 0.3);
      const sepal = new THREE.Mesh(sepalGeom, leafMat);
      sepal.rotation.y = (i * 2 * Math.PI) / 5;
      sepal.rotation.x = 0.9;
      sepal.position.set(0, 0.05, 0);
      roseGroup.add(sepal);
    }

    // LEAVES: 2 natural serrated rose leaf clusters with veins
    const createLeaf = (x: number, y: number, z: number, rotY: number, rotX: number) => {
      const leafG = new THREE.Group();
      leafG.position.set(x, y, z);
      leafG.rotation.y = rotY;
      leafG.rotation.x = rotX;

      // Center leaf
      const lGeom = createPetalGeometry(0.45, 0.75, 0.1, 0.15);
      const lMesh = new THREE.Mesh(lGeom, leafMat);
      lMesh.rotation.x = 0.6;
      leafG.add(lMesh);

      // Side leaflets
      const s1 = new THREE.Mesh(createPetalGeometry(0.35, 0.55, 0.08, 0.1), leafMat);
      s1.position.set(0.18, -0.15, 0);
      s1.rotation.set(0.5, 0.4, -0.3);
      leafG.add(s1);

      const s2 = new THREE.Mesh(createPetalGeometry(0.35, 0.55, 0.08, 0.1), leafMat);
      s2.position.set(-0.18, -0.15, 0);
      s2.rotation.set(0.5, -0.4, 0.3);
      leafG.add(s2);

      return leafG;
    };

    const leaf1 = createLeaf(0.04, -0.7, 0.02, 0.8, -0.2);
    const leaf2 = createLeaf(-0.06, -1.3, -0.03, -1.8, 0.15);
    roseGroup.add(leaf1);
    roseGroup.add(leaf2);

    // Position rose slightly lower for graceful framing
    roseGroup.position.y = 0.3;

    // Pixel reader context
    const pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = offWidth;
    pixelCanvas.height = offHeight;
    const pixelCtx = pixelCanvas.getContext('2d', { willReadFrequently: true });

    let animId: number;
    let time = 0;

    // ASCII Shades ramp
    const ASCII_CHARS = " .':;!~=+*#%@$";

    const render = () => {
      time += 0.025;

      const dpr = window.devicePixelRatio || 1;
      const width = displayCanvas.clientWidth;
      const height = displayCanvas.clientHeight;

      if (displayCanvas.width !== width * dpr || displayCanvas.height !== height * dpr) {
        displayCanvas.width = width * dpr;
        displayCanvas.height = height * dpr;
      }

      displayCtx.save();
      displayCtx.scale(dpr, dpr);

      // Deep obsidian-burgundy background
      displayCtx.fillStyle = '#050308';
      displayCtx.fillRect(0, 0, width, height);

      // Ambient radial bloom aura
      const grad = displayCtx.createRadialGradient(
        width / 2,
        height / 2 - 20,
        15,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.6
      );
      grad.addColorStop(0, 'rgba(100, 15, 40, 0.32)');
      grad.addColorStop(0.5, 'rgba(40, 8, 20, 0.18)');
      grad.addColorStop(1, 'rgba(5, 3, 8, 0)');
      displayCtx.fillStyle = grad;
      displayCtx.fillRect(0, 0, width, height);

      // Cosmic background dust particles
      particlesRef.current.forEach((pt) => {
        pt.y -= pt.speed;
        if (pt.y < -20) pt.y = height + 20;

        const shimmer = Math.sin(time * 3 + pt.x * 0.02) * 0.25 + 0.75;
        displayCtx.font = `${pt.size}px 'JetBrains Mono', monospace`;
        displayCtx.fillStyle = pt.color;
        displayCtx.globalAlpha = pt.alpha * shimmer * (stage >= 1 ? 1 : 0.5);
        displayCtx.fillText(pt.char, pt.x, pt.y);
      });
      displayCtx.globalAlpha = 1.0;

      // Update Petal Unfolding based on bloomProgress
      petalNodes.forEach((node) => {
        // Outer petals unfold earlier and wider than inner petals
        const layerLag = node.layer * 0.15;
        const effectiveBloom = Math.max(0, Math.min(1, (bloomProgress - layerLag) / (1 - layerLag + 0.001)));
        const targetRotX = node.baseRotX + (node.bloomRotX - node.baseRotX) * effectiveBloom;
        node.mesh.rotation.x = targetRotX;
      });

      // Stem Sway & 360 Rotation
      const sway = Math.sin(time * 0.8) * 0.06;
      roseGroup.rotation.z = sway;

      if (isRotating) {
        roseGroup.rotation.y = time * 0.45 + manualRot.current.y;
      } else {
        roseGroup.rotation.y = manualRot.current.y;
      }
      roseGroup.rotation.x = manualRot.current.x + Math.cos(time * 0.6) * 0.03;

      // Render 3D Scene to offscreen WebGL
      renderer.render(scene, camera);

      // Read WebGL image into pixel context for ASCII sampling
      if (pixelCtx && stage >= 1) {
        pixelCtx.clearRect(0, 0, offWidth, offHeight);
        pixelCtx.drawImage(offCanvas, 0, 0);
        const imgData = pixelCtx.getImageData(0, 0, offWidth, offHeight);
        const data = imgData.data;

        // Display Grid Dimensions
        const isMobile = width < 640;
        const fontSize = isMobile ? 8.5 : 10.5;
        const fontWidth = fontSize * 0.62;
        const fontHeight = fontSize;

        const cols = Math.floor(width / fontWidth);
        const rows = Math.floor(height / fontHeight);

        displayCtx.font = `bold ${fontSize}px 'JetBrains Mono', Consolas, monospace`;
        displayCtx.textBaseline = 'top';

        // Sample and project pixels onto ASCII grid
        // Center the 3D rose in display viewport
        const roseCenterX = width / 2;
        const roseCenterY = height / 2 - 15;
        const scaleGrid = isMobile ? Math.min(width, height) * 0.95 : Math.min(width, height) * 1.1;

        const startCol = Math.max(0, Math.floor((roseCenterX - scaleGrid / 2) / fontWidth));
        const endCol = Math.min(cols, Math.ceil((roseCenterX + scaleGrid / 2) / fontWidth));
        const startRow = Math.max(0, Math.floor((roseCenterY - scaleGrid / 2) / fontHeight));
        const endRow = Math.min(rows, Math.ceil((roseCenterY + scaleGrid / 2) / fontHeight));

        for (let r = startRow; r < endRow; r++) {
          const screenY = r * fontHeight;
          const normY = (screenY - (roseCenterY - scaleGrid / 2)) / scaleGrid;
          const offY = Math.floor(normY * offHeight);

          if (offY < 0 || offY >= offHeight) continue;

          for (let c = startCol; c < endCol; c++) {
            const screenX = c * fontWidth;
            const normX = (screenX - (roseCenterX - scaleGrid / 2)) / scaleGrid;
            const offX = Math.floor(normX * offWidth);

            if (offX < 0 || offX >= offWidth) continue;

            const idx = (offY * offWidth + offX) * 4;
            const red = data[idx];
            const green = data[idx + 1];
            const blue = data[idx + 2];
            const alpha = data[idx + 3];

            if (alpha > 30) {
              const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
              const charIdx = Math.floor(luminance * (ASCII_CHARS.length - 1));
              const ch = ASCII_CHARS[Math.max(1, charIdx)];

              // Color categorization: Stem/Leaves vs Rose Petals
              if (green > red * 0.95 && green > 35) {
                // Stem & Leaves - Emerald greens
                if (luminance > 0.6) {
                  displayCtx.fillStyle = '#86efac';
                } else if (luminance > 0.35) {
                  displayCtx.fillStyle = '#22c55e';
                } else {
                  displayCtx.fillStyle = '#15803d';
                }
                displayCtx.shadowBlur = 0;
              } else {
                // Rose Petals - Natural rich red to blush pink
                if (luminance > 0.72) {
                  displayCtx.fillStyle = '#fff1f2'; // Radiant rim highlight
                  displayCtx.shadowColor = '#f43f5e';
                  displayCtx.shadowBlur = 6;
                } else if (luminance > 0.48) {
                  displayCtx.fillStyle = '#fb7185'; // Soft rose pink
                  displayCtx.shadowColor = '#e11d48';
                  displayCtx.shadowBlur = 4;
                } else if (luminance > 0.28) {
                  displayCtx.fillStyle = '#e11d48'; // Rich red
                  displayCtx.shadowBlur = 0;
                } else {
                  displayCtx.fillStyle = '#9f1239'; // Deep shadow velvet ruby
                  displayCtx.shadowBlur = 0;
                }
              }

              displayCtx.fillText(ch, screenX, screenY);
            }
          }
        }
        displayCtx.shadowBlur = 0;
      }

      displayCtx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [stage, bloomProgress, isRotating]);

  // Pointer drag for manual 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastPointerPos.current.x;
    const deltaY = e.clientY - lastPointerPos.current.y;
    lastPointerPos.current = { x: e.clientX, y: e.clientY };

    manualRot.current.y += deltaX * 0.012;
    manualRot.current.x = Math.max(-0.4, Math.min(0.6, manualRot.current.x + deltaY * 0.01));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-screen overflow-hidden bg-black select-none touch-none flex flex-col items-center justify-center"
    >
      {/* 3D ASCII Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />

      {/* STAGE 0: Initial Start Screen */}
      {!hasStarted && (
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-xl animate-fade-in">
          <div className="w-16 h-16 mb-6 rounded-full border border-rose-400/30 flex items-center justify-center bg-rose-950/20 glow-pink-box animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-rose-300" />
          </div>

          <h2 className="text-xs uppercase tracking-[0.35em] text-rose-300/80 mb-3 font-cinzel">
            An Interactive Birthday Story
          </h2>
          <h1 className="text-4xl md:text-5xl font-serif-luxury text-white mb-4 tracking-wide">
            BLOOM
          </h1>
          <p className="text-sm md:text-base text-rose-200/70 font-light italic mb-8 max-w-md">
            "For a girl who makes life bloom."
          </p>

          <button
            onClick={startExperience}
            className="group relative px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600/80 via-pink-600/80 to-rose-700/80 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-rose-950/50 hover:shadow-rose-600/30 hover:scale-105 active:scale-95 border border-rose-300/30 flex items-center gap-3 cursor-pointer"
          >
            <span>Touch To Begin Journey</span>
            <span className="text-rose-200 group-hover:translate-x-1 transition-transform">♡</span>
          </button>

          <p className="mt-4 text-[11px] text-zinc-500 tracking-wider">
            Turn up your sound for the ambient experience
          </p>
        </div>
      )}

      {/* STAGE 1: Requested Opening Quote */}
      {hasStarted && stage === 1 && (
        <div className="relative z-20 text-center px-6 max-w-xl transition-all duration-1000 ease-out animate-fade-in">
          <p className="text-2xl md:text-3xl font-serif-luxury text-rose-100 tracking-wide glow-white-text italic leading-relaxed">
            "Like a flower, you have your own beautiful way of blooming."
          </p>
        </div>
      )}

      {/* Blooming Progress Header */}
      {hasStarted && stage >= 2 && (
        <div className="absolute top-8 left-0 right-0 z-20 flex flex-col items-center pointer-events-none px-4">
          <span className="text-[11px] font-cinzel uppercase tracking-[0.3em] text-rose-300/80 mb-1">
            Scene I • The Botanical Geometry
          </span>
          <span className="text-xs text-zinc-400 font-mono-code">
            {stage === 2
              ? `Rose Unfolding... ${Math.round(bloomProgress * 100)}%`
              : 'Full 3D Rose Blossom Achieved'}
          </span>
        </div>
      )}

      {/* STAGE 3: Requested Rose Bloom Reveal */}
      {hasStarted && stage === 3 && (
        <div className="absolute bottom-10 left-0 right-0 z-20 flex flex-col items-center text-center px-6 animate-fade-in pointer-events-auto">
          <div className="glass-panel px-6 py-5 rounded-2xl max-w-lg mb-6 shadow-2xl border border-rose-500/20">
            <p className="text-base md:text-lg font-serif-luxury text-rose-100 leading-relaxed italic mb-1">
              "Like a flower, you have your own beautiful way of blooming."
            </p>
            {/* Exact Requested Text */}
            <p className="text-lg md:text-xl font-serif-luxury text-pink-300 font-semibold tracking-wide glow-pink-text">
              "Today, this rose blooms just for you, Bhoomika."
            </p>
          </div>

          <button
            onClick={() => {
              audioSystem.playSparkle();
              onComplete();
            }}
            className="group px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-rose-400 text-white font-medium text-sm tracking-wider uppercase transition-all duration-300 shadow-xl shadow-rose-900/40 hover:scale-105 active:scale-95 border border-pink-200/40 flex items-center gap-3 cursor-pointer"
          >
            <span>Reveal The Birthday Surprise</span>
            <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}

      {/* Interactive Controls Overlay (bottom-right) */}
      {hasStarted && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsRotating((prev) => !prev)}
            className="p-2.5 rounded-full glass-panel text-rose-200 hover:text-white hover:bg-rose-900/30 transition-all border border-rose-500/20 text-xs flex items-center gap-1.5 cursor-pointer"
            title={isRotating ? 'Pause rotation' : 'Resume auto-rotation'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="hidden sm:inline text-[11px]">360° Spin</span>
          </button>

          {stage === 2 && (
            <button
              onClick={handleSkipToBloom}
              className="px-3 py-2 rounded-full glass-panel text-rose-300/80 hover:text-white text-xs border border-rose-500/20 flex items-center gap-1 hover:bg-rose-900/20 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full Bloom</span>
            </button>
          )}
        </div>
      )}

      {/* Drag hint */}
      {hasStarted && stage >= 2 && (
        <div className="absolute bottom-6 left-6 z-10 text-[10px] text-zinc-500 font-mono-code hidden sm:block pointer-events-none">
          Drag to spin 3D rose in real-time
        </div>
      )}
    </div>
  );
};
