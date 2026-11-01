"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CanvasTexture, CatmullRomCurve3, SRGBColorSpace, Vector3, type Group, type PerspectiveCamera } from "three";

type Rot = { x: number; y: number };
type Palette = { fill: string; line: string; paper: string; screen: string; glyph: string };

const PALETTE: Record<"light" | "dark", Palette> = {
  light: { fill: "#8a3324", line: "#141414", paper: "#fbf8f1", screen: "#141414", glyph: "#f4efe4" },
  dark: { fill: "#ffb000", line: "#f4f1ea", paper: "#2d2d31", screen: "#111112", glyph: "#ffb000" },
};

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
const getTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

/* ---------------------------------------------------------------- objects */

// Keyboard layout: two full rows of keys, then a bottom row with a space bar.
const KEYS: { x: number; z: number; w: number }[] = [
  ...Array.from({ length: 11 }, (_, i) => ({ x: (i - 5) * 0.21, z: -0.22, w: 0.17 })),
  ...Array.from({ length: 11 }, (_, i) => ({ x: (i - 5) * 0.21, z: 0, w: 0.17 })),
  { x: -1.05, z: 0.22, w: 0.17 },
  { x: -0.84, z: 0.22, w: 0.17 },
  { x: 0, z: 0.22, w: 1.3 },
  { x: 0.84, z: 0.22, w: 0.17 },
  { x: 1.05, z: 0.22, w: 0.17 },
];

type Line = { text: string; dim?: boolean };

// Terminal "sessions" the screen cycles through on tap / click / Enter. "dim" lines are output.
const SCREENS: Line[][] = [
  [{ text: "> whoami" }, { text: "yash_dingar", dim: true }, { text: "> cat role.txt" }, { text: "full-stack & security", dim: true }],
  [{ text: "> ls ./projects" }, { text: "shine  taskmesh", dim: true }, { text: "vulnscan  +more", dim: true }, { text: "> scroll down" }],
  [{ text: "> echo $STACK" }, { text: "next.js  angular", dim: true }, { text: "firebase  python", dim: true }, { text: "typescript", dim: true }],
  [{ text: "> sudo hire yash" }, { text: "[sudo] password: ****", dim: true }, { text: "access granted.", dim: true }, { text: "> say hi below" }],
];

const fontFamily = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--font-vt323").trim() || "monospace";

/** Draws the terminal (VT323, the site's pixel font) into the canvas and flags the texture for upload. */
function drawScreen(canvas: HTMLCanvasElement, texture: CanvasTexture, lines: Line[], c: Palette, cursorOn: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const size = 50;
  const all: Line[] = [...lines, { text: "> " }];
  ctx.fillStyle = c.screen;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${size}px ${fontFamily()}`;
  ctx.textBaseline = "top";
  ctx.fillStyle = c.glyph;
  all.forEach((line, i) => {
    ctx.globalAlpha = line.dim ? 0.7 : 1;
    ctx.fillText(line.text, 34, 30 + i * (size + 14));
  });
  ctx.globalAlpha = 1;
  if (cursorOn) {
    const last = all.length - 1;
    const x = 34 + ctx.measureText(all[last].text).width;
    ctx.fillRect(x, 30 + last * (size + 14) + 6, size * 0.45, size * 0.78);
  }
  texture.needsUpdate = true;
}

/** Live screen texture with a blinking cursor; redraws on theme/command change and once the font has loaded. */
function Screen({ c, motion, lines }: { c: Palette; motion: boolean; lines: Line[] }) {
  const [canvas] = useState(() => {
    const el = document.createElement("canvas");
    el.width = 640;
    el.height = 440;
    return el;
  });
  const [texture] = useState(() => {
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  });
  const cursorOn = useRef(true);

  useEffect(() => {
    const redraw = () => drawScreen(canvas, texture, lines, c, cursorOn.current);
    redraw();
    document.fonts.load(`50px ${fontFamily()}`).then(redraw, () => {});
  }, [canvas, texture, lines, c]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    const on = !motion || Math.floor(clock.elapsedTime * 2) % 2 === 0;
    if (on === cursorOn.current) return;
    cursorOn.current = on;
    drawScreen(canvas, texture, lines, c, on);
  });

  return (
    <mesh position={[0, 0.42, 1.017]}>
      <planeGeometry args={[2.15, 1.47]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/** Flat coloured rectangle (slots, vents, details). */
function Flat({ p, size, color }: { p: [number, number, number]; size: [number, number]; color: string }) {
  return (
    <mesh position={p}>
      <planeGeometry args={size} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// Mouse cable: from the back of the mouse, along the desk, to the monitor stand.
const CABLE = new CatmullRomCurve3([
  new Vector3(1.75, -1.33, 1.33),
  new Vector3(1.78, -1.36, 0.95),
  new Vector3(1.45, -1.36, 0.55),
  new Vector3(0.8, -1.3, 0.2),
]);

/** Retro computer: CRT with a live terminal, floppy slot, vents, keyboard and mouse. */
function Computer({ c, motion, lines }: { c: Palette; motion: boolean; lines: Line[] }) {
  return (
    // Offset so the whole model (monitor, keyboard, mouse) is centred on the rotation point.
    <group position={[-0.2, -0.03, -0.44]}>
      {/* monitor front shell and CRT back */}
      <mesh position={[0, 0.3, 0.4]}>
        <boxGeometry args={[2.8, 2.3, 1.2]} />
        <meshLambertMaterial color={c.paper} flatShading />
        <Edges color={c.line} />
      </mesh>
      <mesh position={[0, 0.35, -0.65]}>
        <boxGeometry args={[2.2, 1.8, 0.9]} />
        <meshLambertMaterial color={c.paper} flatShading />
        <Edges color={c.line} />
      </mesh>

      {/* screen bezel + live terminal */}
      <mesh position={[0, 0.42, 1.005]}>
        <boxGeometry args={[2.25, 1.55, 0.02]} />
        <meshBasicMaterial color={c.screen} />
        <Edges color={c.line} />
      </mesh>
      <Screen c={c} motion={motion} lines={lines} />

      {/* chin: vents, floppy slot, power LED */}
      {[-1.0, -0.88, -0.76, -0.64].map((x) => (
        <Flat key={x} p={[x, -0.55, 1.002]} size={[0.05, 0.24]} color={c.line} />
      ))}
      <Flat p={[0.45, -0.52, 1.002]} size={[0.75, 0.07]} color={c.line} />
      <Flat p={[1.05, -0.52, 1.002]} size={[0.12, 0.12]} color={c.fill} />

      {/* side vents */}
      {[0.9, 0.75, 0.6, 0.45, 0.3].map((y) => (
        <mesh key={y} position={[1.402, y, 0.4]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.7, 0.05]} />
          <meshBasicMaterial color={c.line} />
        </mesh>
      ))}

      {/* stand */}
      <mesh position={[0, -1.03, 0]}>
        <boxGeometry args={[1, 0.35, 0.9]} />
        <meshLambertMaterial color={c.fill} flatShading />
        <Edges color={c.line} />
      </mesh>
      <mesh position={[0, -1.27, 0]}>
        <boxGeometry args={[1.9, 0.14, 1.5]} />
        <meshLambertMaterial color={c.paper} flatShading />
        <Edges color={c.line} />
      </mesh>

      {/* keyboard */}
      <group position={[0, -1.3, 1.55]} rotation={[0.08, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.6, 0.16, 0.85]} />
          <meshLambertMaterial color={c.fill} flatShading />
          <Edges color={c.line} />
        </mesh>
        {KEYS.map((k, i) => (
          <mesh key={i} position={[k.x, 0.11, k.z]}>
            <boxGeometry args={[k.w, 0.06, 0.17]} />
            <meshLambertMaterial color={c.paper} flatShading />
            <Edges color={c.line} />
          </mesh>
        ))}
      </group>

      {/* mouse: body, button split, cable */}
      <group position={[1.75, -1.33, 1.6]}>
        <mesh>
          <boxGeometry args={[0.34, 0.13, 0.5]} />
          <meshLambertMaterial color={c.paper} flatShading />
          <Edges color={c.line} />
        </mesh>
        <mesh position={[0, 0.066, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.025, 0.25]} />
          <meshBasicMaterial color={c.line} />
        </mesh>
        <mesh position={[0, 0.066, -0.01]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.34, 0.02]} />
          <meshBasicMaterial color={c.line} />
        </mesh>
      </group>
      <mesh>
        <tubeGeometry args={[CABLE, 24, 0.022, 5, false]} />
        <meshBasicMaterial color={c.line} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- scene */

// Bounding sphere of the computer, so it never touches the canvas edge at any rotation.
const RADIUS = 2.6;
const PADDING = 1.1;

/** Fits the bounding sphere inside the narrower field of view, whatever the canvas aspect. */
function FitCamera({ radius }: { radius: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const { width, height } = useThree((s) => s.size);
  useEffect(() => {
    if (!width || !height) return;
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (width / height));
    camera.position.set(0, 0, (radius * PADDING) / Math.sin(Math.min(vFov, hFov) / 2));
    camera.updateProjectionMatrix();
  }, [camera, width, height, radius]);
  return null;
}

/** Eases toward the drag/keyboard target, plus a gentle side-to-side sway. */
function Rig({
  target,
  motion,
  children,
}: {
  target: React.RefObject<Rot>;
  motion: boolean;
  children: ReactNode;
}) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || !target.current) return;
    const extra = motion ? Math.sin(clock.elapsedTime * 0.7) * 0.45 : 0;
    const t = target.current;
    group.current.rotation.x += (t.x - group.current.rotation.x) * 0.1;
    group.current.rotation.y += (t.y + extra - group.current.rotation.y) * 0.1;
  });
  return <group ref={group}>{children}</group>;
}

const TILT_LIMIT = 0.7;
const clampTilt = (x: number) => Math.max(-TILT_LIMIT, Math.min(TILT_LIMIT, x));

/**
 * Small interactive 3D retro computer for the hero.
 * - Drag anywhere in the square to rotate (mouse or touch). On touch, vertical swipes still
 *   scroll the page (touch-action: pan-y); horizontal drags spin the model.
 * - Tap / click / Enter: spins once and types the next command on the screen.
 * - Arrow keys rotate when focused.
 */
export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const target = useRef<Rot>({ x: 0.15, y: 0 });
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  const [screen, setScreen] = useState(0);
  const [visible, setVisible] = useState(true);
  const motion = !(useReducedMotion() ?? false);
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "light" as const);
  const c = PALETTE[theme];

  useEffect(() => {
    // Stop rendering while the hero is scrolled out of view.
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  const next = () => {
    setScreen((s) => (s + 1) % SCREENS.length);
    if (motion) target.current.y += Math.PI * 2; // one quick turn
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = 0.3;
    const t = target.current;
    if (e.key === "ArrowLeft") t.y -= step;
    else if (e.key === "ArrowRight") t.y += step;
    else if (e.key === "ArrowUp") t.x = clampTilt(t.x - step);
    else if (e.key === "ArrowDown") t.x = clampTilt(t.x + step);
    else if (e.key === "Enter" || e.key === " ") next();
    else return;
    e.preventDefault();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    target.current.y += dx * 0.012;
    target.current.x = clampTilt(target.current.x + dy * 0.012);
    drag.current = { x: e.clientX, y: e.clientY, moved: d.moved + Math.abs(dx) + Math.abs(dy) };
  };
  const onPointerUp = () => {
    // Barely moved: treat as a tap / click.
    if (drag.current && drag.current.moved < 6) next();
    drag.current = null;
  };
  const onPointerCancel = () => {
    // The browser took over (e.g. a vertical scroll on touch).
    drag.current = null;
  };

  return (
    <div
      ref={wrap}
      tabIndex={0}
      role="img"
      aria-label="3D retro computer. Drag to rotate; tap, click or press Enter to run the next command on its screen."
      onKeyDown={onKey}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      // No outline: the global :focus-visible ring would draw a box around the model.
      style={{ touchAction: "pan-y", outline: "none" }}
      className="h-full w-full cursor-grab select-none active:cursor-grabbing"
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 9], fov: 40 }}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: "pan-y" }}
      >
        <FitCamera radius={RADIUS} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 5, 3]} intensity={1.6} />
        <Rig target={target} motion={motion}>
          <Computer c={c} motion={motion} lines={SCREENS[screen]} />
        </Rig>
      </Canvas>
    </div>
  );
}
