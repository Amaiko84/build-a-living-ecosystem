"use strict";

const assert = require("assert");

const {
  clamp,
  createState,
  stateFromScenario,
  advance
} = require("./ecosystem-model.js");

let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log("PASS:", name);
  } catch (e) {
    console.error("FAIL:", name);
    throw e;
  }
}

test("values are bounded 0..100", () => {
  assert.equal(clamp(-500), 0);
  assert.equal(clamp(500), 100);
});

test("same inputs are deterministic", () => {
  const a = advance(
    stateFromScenario("healthy")
  );

  const b = advance(
    stateFromScenario("healthy")
  );

  assert.deepStrictEqual(a, b);
});

test("low water reduces plants over time", () => {
  let state =
    stateFromScenario("drought");

  const initial =
    state.populations.grass;

  for (let i = 0; i < 5; i++) {
    state = advance(state);
  }

  assert(
    state.populations.grass < initial
  );
});

test("consumer without food declines", () => {
  let state =
    stateFromScenario("missingFood");

  const initial =
    state.populations.rabbit;

  for (let i = 0; i < 5; i++) {
    state = advance(state);
  }

  assert(
    state.populations.rabbit < initial
  );
});

test("healthy resources support plants", () => {
  const before =
    stateFromScenario("healthy");

  const after =
    advance(before);

  assert(
    after.populations.grass >=
    before.populations.grass
  );
});

test("state never produces NaN", () => {
  let state =
    createState();

  for (let i = 0; i < 100; i++) {
    state = advance(state);

    for (
      const value of
      Object.values(state.populations)
    ) {
      assert(Number.isFinite(value));
      assert(value >= 0);
      assert(value <= 100);
    }
  }
});

test("reset scenario is reproducible", () => {
  const original =
    stateFromScenario("healthy");

  let changed =
    advance(original);

  changed.water = 5;

  const reset =
    stateFromScenario("healthy");

  assert.deepStrictEqual(
    reset,
    original
  );
});

console.log();
console.log(
  `MODEL TESTS: ${passed}/7 PASS`
);
