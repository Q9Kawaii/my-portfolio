"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Group, PerspectiveCamera } from "three";

type Rot = { x: number; y: number };

// Bounding sphere of the whole object: outer ring radius 2.6 + tube.
const OBJECT_RADIUS = 2.65;
// Breathing room around the sphere so nothing touches the canvas edge at any rotation.
const PADDING = 1.12;

const PALETTE = {
  light: { core: "#8a3324", line: "#141414", dot: "#8a3324" },
  dark: { core: "#ffb000", line: "#f4f1ea", dot: "#ffb000" },
};

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
const getTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

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

function Atom({ spin, target, colors }: { spin: boolean; target: React.RefObject<Rot>; colors: (typeof PALETTE)["light"] }) {
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
    group.current.rotation.x += (t.x - group.current.rotation.x) * 0.1;
    group.current.rotation.y += (t.y + idle.current - group.current.rotation.y) * 0.1;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshLambertMaterial color={colors.core} flatShading />
      </mesh>
      <mesh scale={1.5}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={colors.line} wireframe transparent opacity={0.35} />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[2.25, 0.03, 8, 120]} />
          <meshBasicMaterial color={colors.line} />
        </mesh>
        <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]}>
          <torusGeometry args={[2.6, 0.03, 8, 120]} />
          <meshBasicMaterial color={colors.line} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 2.25, Math.sin(a) * 0.6, Math.sin(a) * 2.1]}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshBasicMaterial color={colors.dot} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** Small draggable atom for the hero. Drag (mouse or touch) or use the arrow keys to rotate. */
export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const target = useRef<Rot>({ x: 0.3, y: 0.4 });
  const [visible, setVisible] = useState(true);
  const reduce = useReducedMotion() ?? false;
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "light" as const);

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
      aria-label="3D atom. Drag it, or focus it and use the arrow keys, to rotate."
      onKeyDown={onKey}
      className="h-full w-full cursor-grab active:cursor-grabbing"
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 9], fov: 40 }}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
      >
        <FitCamera />
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 5, 3]} intensity={1.8} />
        <PresentationControls
          global={false}
          cursor={false}
          snap={false}
          speed={1.6}
          polar={[-0.7, 0.7]}
          azimuth={[-Infinity, Infinity]}
        >
          <Atom spin={!reduce} target={target} colors={PALETTE[theme]} />
        </PresentationControls>
      </Canvas>
    </div>
  );
}
