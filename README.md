# Meadow Balance Lab

Interactive educational website for learners around age 9.

Learners build a meadow ecosystem, predict how changes in sunlight or water affect organisms, and restore balance to a struggling habitat.

## Learning goals

Learners can:

- identify producers and consumers;
- connect sunlight, water, and plant growth with animal survival;
- trace simple food relationships;
- predict effects of environmental changes;
- distinguish a simplified model from a real ecosystem.

## Activities

1. Build a healthy meadow.
2. Predict and experiment with sunlight and water.
3. Restore balance to a struggling ecosystem.

## Run locally

No build step is required.

Run:

python3 -m http.server 8090 --bind 127.0.0.1

Then open:

http://127.0.0.1:8090/

## Runtime

- HTML5
- CSS3
- modern JavaScript
- no framework
- no backend
- no database
- no account or login
- no remote API
- no analytics
- no paid services

Tested with Chromium 152 on Debian 12.

## Architecture

- index.html — interface and educational content
- styles.css — responsive and accessibility styling
- ecosystem-model.js — deterministic ecosystem model
- app.js — activities, feedback, progress, and reset
- model.test.js — automated model tests
- evidence/ — browser QA screenshots

## Model

All organism values remain between 0 and 100.

Plants depend on both sunlight and water.

Herbivores depend on modeled plant-food availability.

Predators depend on modeled prey availability.

Identical inputs and actions produce identical results.

Values are illustrative model units, not real population measurements.

## Accessibility

Designed toward WCAG 2.2 AA with:

- semantic controls;
- keyboard-operable activities;
- visible keyboard focus;
- practical touch targets;
- non-color textual status cues;
- responsive layouts;
- reduced-motion support;
- no flashing content or autoplay.

## Privacy and child safety

The application collects no personal information.

It has no:

- login;
- name or email collection;
- wallet or payment request;
- analytics;
- advertising;
- purchases;
- social or chat features;
- file uploads;
- runtime generative AI.

Progress exists only in the current page session.

## Limitations

This is an educational model, not an ecological forecasting system.

Real ecosystems include many additional variables such as weather, disease, migration, decomposition, competition, soil conditions, and biodiversity.

## License

MIT License. See LICENSE.
