"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, PresentationControls } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Group, PerspectiveCamera } from "three";

type Rot = { x: number; y: number };

// Bounding sphere of the whole object: outer ring radius 2.6 + tube + Float bob (~0.1).
const OBJECT_RADIUS = 2.75;
// Extra breathing room around the sphere (1.18 = ~18% padding).
const PADDING = 1.18;

/**
 * Places the camera so the bounding sphere fits inside the narrower of the
 * vertical/horizontal field of view, whatever the canvas size or aspect.
 * A sphere is rotation-invariant, so dragging can never push a ring off-canvas.
 */
function FitCamera() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const { width, height } = useThree((s) => s.size);
  useEffect(() => {
    if (!width || !height) return;
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (width / height));
    const fit = Math.min(vFov, hFov);
    camera.position.set(0, 0, (OBJECT_RADIUS * PADDING) / Math.sin(fit / 2));
    camera.updateProjectionMatrix();
  }, [camera, width, height]);
  return null;
}

function Core({ spin, target }: { spin: boolean; target: React.RefObject<Rot> }) {
  const group = useRef<Group>(null);
  const rings = useRef<Group>(null);
  const idle = useRef(0);

  useFrame((_, dt) => {
    if (!group.current || !rings.current || !target.current) return;
    const t = target.current;
    if (spin) {
      idle.current += dt * 0.18;
      rings.current.rotation.z -= dt * 0.12;
    }
    // Ease toward the keyboard target plus a slow idle spin.
    group.current.rotation.x += (t.x - group.current.rotation.x) * 0.1;
    group.current.rotation.y += (t.y + idle.current - group.current.rotation.y) * 0.1;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial color="#7cf0c5" emissive="#0b4a3a" metalness={0.55} roughness={0.25} flatShading />
      </mesh>
      <mesh scale={1.55}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#9db2ff" wireframe transparent opacity={0.45} />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[2.25, 0.025, 12, 160]} />
          <meshBasicMaterial color="#7cf0c5" />
        </mesh>
        <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]}>
          <torusGeometry args={[2.6, 0.015, 12, 160]} />
          <meshBasicMaterial color="#9db2ff" />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 2.25, Math.sin(a) * 0.6, Math.sin(a) * 2.1]}>
              <octahedronGeometry args={[0.13]} />
              <meshStandardMaterial color="#ffffff" emissive="#9db2ff" emissiveIntensity={0.6} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** Draggable 3D object for the hero. Drag (mouse or touch) or use the arrow keys to rotate. */
export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const target = useRef<Rot>({ x: 0.3, y: 0.4 });
  const [visible, setVisible] = useState(true);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    // Stop rendering while the hero is scrolled out of view.
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    const step = 0.3;
    const t = target.current;
    if (e.key === "ArrowLeft") t.y -= step;
    else if (e.key === "ArrowRight") t.y += step;
    else if (e.key === "ArrowUp") t.x -= step;
    else if (e.key === "ArrowDown") t.x += step;
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={wrap}
      tabIndex={0}
      role="img"
      aria-label="Interactive 3D shield core. Drag it, or focus it and use the arrow keys, to rotate."
      onKeyDown={onKey}
      className="h-full w-full cursor-grab active:cursor-grabbing"
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 9], fov: 45 }}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <FitCamera />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 5, 3]} intensity={2.2} />
        <pointLight position={[-4, -2, 2]} intensity={30} color="#9db2ff" />
        <PresentationControls
          global={false}
          cursor={false}
          snap={false}
          speed={1.6}
          polar={[-0.7, 0.7]}
          azimuth={[-Infinity, Infinity]}
        >
          <Float speed={reduce ? 0 : 1.6} rotationIntensity={reduce ? 0 : 0.25} floatIntensity={reduce ? 0 : 0.6}>
            <Core spin={!reduce} target={target} />
          </Float>
        </PresentationControls>
      </Canvas>
    </div>
  );
}
