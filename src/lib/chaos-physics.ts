export interface ChaosBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  phase: number;
}

export interface ChaosBounds {
  width: number;
  height: number;
}

export interface ChaosPointer {
  x: number;
  y: number;
  active: boolean;
}

export const CHAOS_PHYSICS = {
  REPEL_RADIUS: 110,
  REPEL_FORCE: 0.6,
  MAX_SPEED: 3.2,
  BASE_SPEED: 0.6,
  FRICTION: 0.985,
  MAX_ROTATION: 18,
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Random starting position, direction, and tilt inside the container.
export function createChaosBody(
  size: number,
  bounds: ChaosBounds,
  index: number,
  random: () => number = Math.random,
): ChaosBody {
  const angle = random() * Math.PI * 2;
  return {
    x: random() * Math.max(bounds.width - size, 1),
    y: random() * Math.max(bounds.height - size, 1),
    vx: Math.cos(angle) * CHAOS_PHYSICS.BASE_SPEED,
    vy: Math.sin(angle) * CHAOS_PHYSICS.BASE_SPEED,
    size,
    rotation: random() * 30 - 15,
    rotationSpeed: (random() - 0.5) * 0.4,
    phase: index * 0.8,
  };
}

// Pushes the body away from the pointer when it is within the repel radius.
function applyRepel(body: ChaosBody, pointer: ChaosPointer): Pick<ChaosBody, "vx" | "vy"> {
  if (!pointer.active) return { vx: body.vx, vy: body.vy };

  const dx = body.x + body.size / 2 - pointer.x;
  const dy = body.y + body.size / 2 - pointer.y;
  const distance = Math.hypot(dx, dy) || 1;
  if (distance >= CHAOS_PHYSICS.REPEL_RADIUS) return { vx: body.vx, vy: body.vy };

  const force = (1 - distance / CHAOS_PHYSICS.REPEL_RADIUS) * CHAOS_PHYSICS.REPEL_FORCE;
  return { vx: body.vx + (dx / distance) * force, vy: body.vy + (dy / distance) * force };
}

// Caps speed at MAX_SPEED and lets boosted bodies slow back down toward BASE_SPEED.
function limitSpeed(vx: number, vy: number): Pick<ChaosBody, "vx" | "vy"> {
  const speed = Math.hypot(vx, vy);
  if (speed > CHAOS_PHYSICS.MAX_SPEED) {
    return { vx: (vx / speed) * CHAOS_PHYSICS.MAX_SPEED, vy: (vy / speed) * CHAOS_PHYSICS.MAX_SPEED };
  }
  if (speed > CHAOS_PHYSICS.BASE_SPEED) {
    return { vx: vx * CHAOS_PHYSICS.FRICTION, vy: vy * CHAOS_PHYSICS.FRICTION };
  }
  return { vx, vy };
}

// Moves along one axis, reversing velocity and clamping when it hits a wall.
function bounce(position: number, velocity: number, max: number): [number, number] {
  const next = position + velocity;
  if (next <= 0 || next >= max) return [clamp(next, 0, Math.max(max, 0)), -velocity];
  return [next, velocity];
}

// Advances a body by one animation frame. Pure: returns a new body.
export function stepChaosBody(body: ChaosBody, bounds: ChaosBounds, pointer: ChaosPointer): ChaosBody {
  const repelled = applyRepel(body, pointer);
  const { vx, vy } = limitSpeed(repelled.vx, repelled.vy);
  const [x, nextVx] = bounce(body.x, vx, bounds.width - body.size);
  const [y, nextVy] = bounce(body.y, vy, bounds.height - body.size);

  const rotation = body.rotation + body.rotationSpeed;
  const rotationSpeed =
    Math.abs(rotation) > CHAOS_PHYSICS.MAX_ROTATION ? -body.rotationSpeed : body.rotationSpeed;

  return { ...body, x, y, vx: nextVx, vy: nextVy, rotation, rotationSpeed };
}

// CSS transform for a body, with a gentle scale pulse driven by the frame time.
export function chaosTransform(body: ChaosBody, time: number): string {
  const scale = 1 + Math.sin(time / 900 + body.phase) * 0.08;
  return `translate(${body.x}px, ${body.y}px) rotate(${body.rotation}deg) scale(${scale})`;
}
