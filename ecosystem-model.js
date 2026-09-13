"use strict";

/*
  Living Ecosystem deterministic educational model.

  All numeric values are MODEL VALUES, not scientific measurements.
  Values are bounded from 0 to 100.

  Energy-flow convention:
  food -> consumer
*/

const clamp = (value) =>
  Math.max(0, Math.min(100, Math.round(value)));

const SPECIES = Object.freeze({
  grass: {
    id: "grass",
    name: "Meadow grass",
    role: "producer"
  },

  wildflowers: {
    id: "wildflowers",
    name: "Wildflowers",
    role: "producer"
  },

  rabbit: {
    id: "rabbit",
    name: "Rabbit",
    role: "herbivore",
    foods: ["grass", "wildflowers"]
  },

  grasshopper: {
    id: "grasshopper",
    name: "Grasshopper",
    role: "herbivore",
    foods: ["grass", "wildflowers"]
  },

  fox: {
    id: "fox",
    name: "Fox",
    role: "predator",
    foods: ["rabbit"]
  }
});

const DEFAULT_POPULATIONS = Object.freeze({
  grass: 70,
  wildflowers: 65,
  rabbit: 45,
  grasshopper: 40,
  fox: 25
});

function createState(overrides = {}) {
  return {
    step: 0,

    sunlight: clamp(
      overrides.sunlight ?? 70
    ),

    water: clamp(
      overrides.water ?? 70
    ),

    populations: {
      ...DEFAULT_POPULATIONS,
      ...(overrides.populations || {})
    }
  };
}

function producerNext(current, sunlight, water) {
  /*
    Simplified limiting-resource model:

    Plants need BOTH light and water.
    Extra light cannot fully replace missing water,
    and extra water cannot fully replace missing light.

    We therefore use the lower of the two resources
    as the main growth support value.
  */

  const limitingResource =
    Math.min(sunlight, water);

  const difference =
    (limitingResource - 50) * 0.16;

  return clamp(current + difference);
}

function foodAvailability(state, speciesId) {
  const species = SPECIES[speciesId];

  if (!species || !species.foods) {
    return 0;
  }

  const available = species.foods.map(
    food => state.populations[food] ?? 0
  );

  if (!available.length) {
    return 0;
  }

  return (
    available.reduce((a, b) => a + b, 0)
    / available.length
  );
}

function consumerNext(current, food) {
  /*
    Food below 45 causes decline.
    Food above 45 supports growth.

    A consumer with no food therefore
    cannot thrive indefinitely.
  */

  const change =
    (food - 45) * 0.12;

  return clamp(current + change);
}

function predatorNext(current, prey) {
  const change =
    (prey - 40) * 0.10;

  return clamp(current + change);
}

function advance(state) {
  const previous = JSON.parse(
    JSON.stringify(state)
  );

  const next = createState({
    sunlight: state.sunlight,
    water: state.water,
    populations: state.populations
  });

  next.step = state.step + 1;

  next.populations.grass =
    producerNext(
      state.populations.grass,
      state.sunlight,
      state.water
    );

  next.populations.wildflowers =
    producerNext(
      state.populations.wildflowers,
      state.sunlight,
      state.water
    );

  /*
    Consumers respond to the food values
    from the previous step. This makes
    cause and effect inspectable.
  */

  next.populations.rabbit =
    consumerNext(
      state.populations.rabbit,
      foodAvailability(previous, "rabbit")
    );

  next.populations.grasshopper =
    consumerNext(
      state.populations.grasshopper,
      foodAvailability(previous, "grasshopper")
    );

  next.populations.fox =
    predatorNext(
      state.populations.fox,
      previous.populations.rabbit
    );

  return next;
}

function explainChange(before, after, id) {
  const a = before.populations[id];
  const b = after.populations[id];

  if (a === b) {
    return `${SPECIES[id].name} stayed stable at ${b} model units.`;
  }

  const direction =
    b > a ? "increased" : "decreased";

  if (SPECIES[id].role === "producer") {
    return (
      `${SPECIES[id].name} ${direction} from ` +
      `${a} to ${b} model units because plant ` +
      `growth depends on both sunlight and water.`
    );
  }

  const foods =
    SPECIES[id].foods
      .map(x => SPECIES[x].name)
      .join(" and ");

  return (
    `${SPECIES[id].name} ${direction} from ` +
    `${a} to ${b} model units. Its model food ` +
    `source is ${foods}.`
  );
}

const SCENARIOS = Object.freeze({
  healthy: {
    name: "Healthy meadow",
    sunlight: 70,
    water: 70,
    populations: {
      ...DEFAULT_POPULATIONS
    }
  },

  drought: {
    name: "Dry spell",
    sunlight: 80,
    water: 20,
    populations: {
      ...DEFAULT_POPULATIONS
    }
  },

  cloudy: {
    name: "Cloudy week",
    sunlight: 25,
    water: 70,
    populations: {
      ...DEFAULT_POPULATIONS
    }
  },

  missingFood: {
    name: "Missing food",
    sunlight: 70,
    water: 70,
    populations: {
      grass: 0,
      wildflowers: 0,
      rabbit: 45,
      grasshopper: 40,
      fox: 25
    }
  },

  unfamiliar: {
    name: "Unfamiliar challenge",
    sunlight: 35,
    water: 30,
    populations: {
      grass: 30,
      wildflowers: 25,
      rabbit: 60,
      grasshopper: 55,
      fox: 35
    }
  }
});

function stateFromScenario(name) {
  const s = SCENARIOS[name];

  if (!s) {
    throw new Error(
      `Unknown scenario: ${name}`
    );
  }

  return createState(s);
}

if (typeof module !== "undefined") {
  module.exports = {
    clamp,
    SPECIES,
    SCENARIOS,
    createState,
    stateFromScenario,
    foodAvailability,
    producerNext,
    consumerNext,
    predatorNext,
    advance,
    explainChange
  };
}
