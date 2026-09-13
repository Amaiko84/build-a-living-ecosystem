"use strict";

let predictState = stateFromScenario("healthy");
let restoreState = stateFromScenario("unfamiliar");

const progress = {
  build: false,
  predict: false,
  restore: false
};

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return [...document.querySelectorAll(selector)];
}

function updateProgress() {
  qs("#progressBuild").textContent =
    `${progress.build ? "✓" : "○"} Build a viable habitat`;

  qs("#progressPredict").textContent =
    `${progress.predict ? "✓" : "○"} Make and test a prediction`;

  qs("#progressRestore").textContent =
    `${progress.restore ? "✓" : "○"} Improve a struggling habitat`;

  if (progress.build && progress.predict && progress.restore) {
    qs("#completionMessage").textContent =
      "Lesson complete. Next practice: invent a new resource change and predict which organisms would be affected first.";
  } else {
    qs("#completionMessage").textContent =
      "Complete all three activities to finish the lesson.";
  }
}

function showActivity(id) {
  qsa(".activity").forEach(section => {
    section.classList.toggle(
      "hidden",
      section.id !== id
    );
  });

  qsa(".nav-btn").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.target === id
    );
  });

  const section = qs(`#${id}`);

  if (section) {
    section.scrollIntoView({
      block: "start"
    });
  }
}

qsa(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showActivity(btn.dataset.target);
  });
});

function selectedSpecies() {
  return qsa("#speciesGrid input:checked")
    .map(x => x.value);
}

qs("#checkHabitatBtn").addEventListener("click", () => {
  const chosen = selectedSpecies();

  const producers = chosen.filter(
    x => SPECIES[x].role === "producer"
  );

  const herbivores = chosen.filter(
    x => SPECIES[x].role === "herbivore"
  );

  const predators = chosen.filter(
    x => SPECIES[x].role === "predator"
  );

  const rabbitFood =
    !chosen.includes("rabbit") ||
    chosen.includes("grass") ||
    chosen.includes("wildflowers");

  const grasshopperFood =
    !chosen.includes("grasshopper") ||
    chosen.includes("grass") ||
    chosen.includes("wildflowers");

  const foxFood =
    !chosen.includes("fox") ||
    chosen.includes("rabbit");

  const viable =
    producers.length >= 2 &&
    herbivores.length >= 2 &&
    predators.length >= 1 &&
    rabbitFood &&
    grasshopperFood &&
    foxFood;

  if (viable) {
    qs("#buildFeedback").textContent =
      "Good model habitat. Plants can support the herbivores, and the rabbit can provide food energy to the fox.";

    progress.build = true;
    qs("#buildStatus").textContent = "Complete";
  } else {
    qs("#buildFeedback").textContent =
      "This habitat is missing part of its food relationship. Try two producers, two herbivores and one predator with an available food source.";
  }

  updateProgress();
});

qs("#buildHintBtn").addEventListener("click", () => {
  qs("#buildFeedback").textContent =
    "Hint: begin with both plants, then choose both plant-eaters. Which predator has one of those animals as food?";
});

function renderIndicators(container, state) {
  const el = qs(container);

  el.innerHTML = Object.keys(SPECIES)
    .map(id => {
      const value = state.populations[id];

      let condition = "medium";

      if (value >= 70) {
        condition = "high";
      } else if (value <= 30) {
        condition = "low";
      }

      return `
        <div class="indicator">
          <strong>${SPECIES[id].name}</strong>
          <span>${SPECIES[id].role}</span>
          <span class="indicator-value">
            ${value}
          </span>
          <span>model units</span>
          <span>Level: ${condition}</span>
        </div>
      `;
    })
    .join("");
}

function syncPredictControls() {
  qs("#waterControl").value =
    predictState.water;

  qs("#sunControl").value =
    predictState.sunlight;

  qs("#waterValue").textContent =
    predictState.water;

  qs("#sunValue").textContent =
    predictState.sunlight;

  renderIndicators(
    "#populationIndicators",
    predictState
  );
}

qs("#scenarioSelect").addEventListener("change", e => {
  predictState =
    stateFromScenario(e.target.value);

  qsa('input[name="prediction"]').forEach(
    x => x.checked = false
  );

  syncPredictControls();

  qs("#predictionFeedback").textContent =
    "Choose a prediction before advancing.";

  qs("#changeLog").textContent =
    "Scenario reset. No simulation step yet.";
});

qs("#waterControl").addEventListener("input", e => {
  predictState.water =
    Number(e.target.value);

  qs("#waterValue").textContent =
    e.target.value;
});

qs("#sunControl").addEventListener("input", e => {
  predictState.sunlight =
    Number(e.target.value);

  qs("#sunValue").textContent =
    e.target.value;
});

qs("#stepBtn").addEventListener("click", () => {
  const prediction =
    qs('input[name="prediction"]:checked');

  if (!prediction) {
    qs("#predictionFeedback").textContent =
      "Choose a prediction first so you can compare your idea with the model.";
    return;
  }

  const before =
    JSON.parse(
      JSON.stringify(predictState)
    );

  predictState =
    advance(predictState);

  const plantBefore =
    before.populations.grass +
    before.populations.wildflowers;

  const plantAfter =
    predictState.populations.grass +
    predictState.populations.wildflowers;

  const actual =
    plantAfter > plantBefore
      ? "increase"
      : plantAfter < plantBefore
      ? "decrease"
      : "stable";

  if (prediction.value === actual) {
    qs("#predictionFeedback").textContent =
      `Your prediction matched this model step: plants ${actual}.`;
  } else {
    qs("#predictionFeedback").textContent =
      `Your prediction was ${prediction.value}. In this model step, plants ${actual}. Try another step or change a resource.`;
  }

  qs("#changeLog").innerHTML =
    Object.keys(SPECIES)
      .map(id => (
        `<p>${explainChange(
          before,
          predictState,
          id
        )}</p>`
      ))
      .join("");

  renderIndicators(
    "#populationIndicators",
    predictState
  );

  progress.predict = true;
  qs("#predictStatus").textContent =
    "Complete";

  updateProgress();
});

qs("#pauseBtn").addEventListener("click", () => {
  qs("#predictionFeedback").textContent =
    "Simulation paused. Nothing changes until you choose Advance one step.";
});

qs("#resetScenarioBtn").addEventListener("click", () => {
  predictState =
    stateFromScenario(
      qs("#scenarioSelect").value
    );

  qsa('input[name="prediction"]').forEach(
    x => x.checked = false
  );

  progress.predict = false;
  qs("#predictStatus").textContent =
    "Not complete";

  syncPredictControls();

  qs("#predictionFeedback").textContent =
    "Scenario reset. Choose a new prediction.";

  qs("#changeLog").textContent =
    "No simulation step yet.";

  updateProgress();
});

function syncRestoreControls() {
  qs("#restoreWater").value =
    restoreState.water;

  qs("#restoreSun").value =
    restoreState.sunlight;

  qs("#restoreWaterValue").textContent =
    restoreState.water;

  qs("#restoreSunValue").textContent =
    restoreState.sunlight;

  renderIndicators(
    "#restoreIndicators",
    restoreState
  );
}

qs("#restoreWater").addEventListener("input", e => {
  restoreState.water =
    Number(e.target.value);

  qs("#restoreWaterValue").textContent =
    e.target.value;
});

qs("#restoreSun").addEventListener("input", e => {
  restoreState.sunlight =
    Number(e.target.value);

  qs("#restoreSunValue").textContent =
    e.target.value;
});

qs("#restoreStepBtn").addEventListener("click", () => {
  const before =
    JSON.parse(
      JSON.stringify(restoreState)
    );

  const beforePlants =
    before.populations.grass +
    before.populations.wildflowers;

  restoreState =
    advance(restoreState);

  const afterPlants =
    restoreState.populations.grass +
    restoreState.populations.wildflowers;

  renderIndicators(
    "#restoreIndicators",
    restoreState
  );

  if (
    afterPlants > beforePlants &&
    restoreState.water >= 50 &&
    restoreState.sunlight >= 50
  ) {
    qs("#restoreFeedback").textContent =
      "Your changes improved plant support in this model. That gives herbivores a stronger food base over later steps. This does not guarantee the same result in a real ecosystem.";

    progress.restore = true;
    qs("#restoreStatus").textContent =
      "Complete";
  } else {
    qs("#restoreFeedback").textContent =
      "The habitat is still under stress. Look for the limiting plant resource and try another change.";
  }

  updateProgress();
});

qs("#restoreHintBtn").addEventListener("click", () => {
  qs("#restoreFeedback").textContent =
    "Hint: plants need both water and sunlight. Raising only one resource may leave the other as the limiting resource.";
});

qs("#restoreResetBtn").addEventListener("click", () => {
  restoreState =
    stateFromScenario("unfamiliar");

  progress.restore = false;
  qs("#restoreStatus").textContent =
    "Not complete";

  syncRestoreControls();

  qs("#restoreFeedback").textContent =
    "Challenge reset. Adjust the conditions, then test your idea.";

  updateProgress();
});

qs("#resetAllBtn").addEventListener("click", () => {
  progress.build = false;
  progress.predict = false;
  progress.restore = false;

  qsa("#speciesGrid input").forEach(
    x => x.checked = false
  );

  qsa('input[name="prediction"]').forEach(
    x => x.checked = false
  );

  predictState =
    stateFromScenario("healthy");

  restoreState =
    stateFromScenario("unfamiliar");

  qs("#scenarioSelect").value =
    "healthy";

  qs("#buildStatus").textContent =
    "Not complete";

  qs("#predictStatus").textContent =
    "Not complete";

  qs("#restoreStatus").textContent =
    "Not complete";

  qs("#buildFeedback").textContent =
    "Choose organisms, then check your habitat.";

  qs("#predictionFeedback").textContent =
    "Choose a prediction before advancing.";

  qs("#restoreFeedback").textContent =
    "Adjust the conditions, then test your idea.";

  qs("#changeLog").textContent =
    "No simulation step yet.";

  syncPredictControls();
  syncRestoreControls();
  updateProgress();

  showActivity("build");
});

syncPredictControls();
syncRestoreControls();
updateProgress();
