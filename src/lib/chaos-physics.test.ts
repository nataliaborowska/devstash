import { describe, expect, it } from "vitest";
import {
  CHAOS_PHYSICS,
  chaosTransform,
  createChaosBody,
  stepChaosBody,
  type ChaosBody,
  type ChaosPointer,
} from "@/lib/chaos-physics";

const BOUNDS = { width: 400, height: 300 };
const NO_POINTER: ChaosPointer = { x: 0, y: 0, active: false };

function makeBody(overrides: Partial<ChaosBody> = {}): ChaosBody {
  return { x: 100, y: 100, vx: 0.5, vy: 0, size: 40, rotation: 0, rotationSpeed: 0.1, phase: 0, ...overrides };
}

describe("createChaosBody", () => {
  it("places the body inside the bounds at base speed", () => {
    const body = createChaosBody(40, BOUNDS, 2, () => 0.5);

    expect(body.x).toBe(180);
    expect(body.y).toBe(130);
    expect(Math.hypot(body.vx, body.vy)).toBeCloseTo(CHAOS_PHYSICS.BASE_SPEED);
    expect(body.phase).toBeCloseTo(1.6);
  });

  it("does not go negative when the container is smaller than the icon", () => {
    const body = createChaosBody(40, { width: 10, height: 10 }, 0, () => 0.99);

    expect(body.x).toBeGreaterThanOrEqual(0);
    expect(body.y).toBeGreaterThanOrEqual(0);
  });
});

describe("stepChaosBody", () => {
  it("moves by its velocity without a pointer", () => {
    const next = stepChaosBody(makeBody(), BOUNDS, NO_POINTER);

    expect(next.x).toBeCloseTo(100.5);
    expect(next.y).toBe(100);
  });

  it("does not mutate the input body", () => {
    const body = makeBody();
    stepChaosBody(body, BOUNDS, NO_POINTER);

    expect(body.x).toBe(100);
  });

  it("repels away from an active pointer inside the radius", () => {
    // Body center is (120, 120); pointer just to its left pushes it right.
    const next = stepChaosBody(makeBody({ vx: 0 }), BOUNDS, { x: 100, y: 120, active: true });

    expect(next.vx).toBeGreaterThan(0);
  });

  it("ignores a pointer outside the repel radius", () => {
    const pointer = { x: 120 + CHAOS_PHYSICS.REPEL_RADIUS + 1, y: 120, active: true };
    const next = stepChaosBody(makeBody(), BOUNDS, pointer);

    expect(next.vx).toBe(0.5);
  });

  it("ignores an inactive pointer", () => {
    const next = stepChaosBody(makeBody(), BOUNDS, { x: 120, y: 120, active: false });

    expect(next.vx).toBe(0.5);
  });

  it("clamps speed to the maximum", () => {
    const next = stepChaosBody(makeBody({ vx: 10, vy: 10 }), BOUNDS, NO_POINTER);

    expect(Math.hypot(next.vx, next.vy)).toBeCloseTo(CHAOS_PHYSICS.MAX_SPEED);
  });

  it("slows boosted bodies with friction", () => {
    const next = stepChaosBody(makeBody({ vx: 2 }), BOUNDS, NO_POINTER);

    expect(next.vx).toBeCloseTo(2 * CHAOS_PHYSICS.FRICTION);
  });

  it("bounces off the right wall and stays in bounds", () => {
    const next = stepChaosBody(makeBody({ x: 359, vx: 3 }), BOUNDS, NO_POINTER);

    expect(next.x).toBe(BOUNDS.width - 40);
    expect(next.vx).toBeLessThan(0);
  });

  it("bounces off the top wall and stays in bounds", () => {
    const next = stepChaosBody(makeBody({ y: 1, vx: 0, vy: -3 }), BOUNDS, NO_POINTER);

    expect(next.y).toBe(0);
    expect(next.vy).toBeGreaterThan(0);
  });

  it("reverses rotation past the limit", () => {
    const next = stepChaosBody(makeBody({ rotation: CHAOS_PHYSICS.MAX_ROTATION, rotationSpeed: 0.2 }), BOUNDS, NO_POINTER);

    expect(next.rotationSpeed).toBe(-0.2);
  });
});

describe("chaosTransform", () => {
  it("builds a translate/rotate/scale transform", () => {
    expect(chaosTransform(makeBody({ rotation: 5 }), 0)).toBe("translate(100px, 100px) rotate(5deg) scale(1)");
  });
});
