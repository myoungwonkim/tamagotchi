import { clamp } from "./pet.js";

const ACTION_COOLDOWN_MS = 800;
const SLEEP_TOGGLE_GUARD_MS = 50;

const lastActionAtByKey = {
  feed: 0,
  play: 0,
  clean: 0,
};

let lastSleepToggleAt = 0;

function canPerformAction(actionKey) {
  return Date.now() - lastActionAtByKey[actionKey] >= ACTION_COOLDOWN_MS;
}

function markActionPerformed(actionKey) {
  lastActionAtByKey[actionKey] = Date.now();
}

export function feed(pet) {
  if (!canPerformAction("feed") || pet.isSleeping) return false;

  pet.hunger = clamp(pet.hunger + 30);
  pet.cleanliness = clamp(pet.cleanliness - 5);
  markActionPerformed("feed");
  return true;
}

export function play(pet) {
  if (!canPerformAction("play") || pet.isSleeping) return false;

  pet.happiness = clamp(pet.happiness + 25);
  pet.hunger = clamp(pet.hunger - 10);
  markActionPerformed("play");
  return true;
}

export function clean(pet) {
  if (!canPerformAction("clean") || pet.isSleeping) return false;

  pet.cleanliness = clamp(pet.cleanliness + 40);
  markActionPerformed("clean");
  return true;
}

export function toggleSleep(pet) {
  const now = Date.now();
  if (now - lastSleepToggleAt < SLEEP_TOGGLE_GUARD_MS) return false;

  lastSleepToggleAt = now;
  pet.isSleeping = !pet.isSleeping;
  return true;
}

export function resetActionCooldown() {
  for (const key of Object.keys(lastActionAtByKey)) {
    lastActionAtByKey[key] = 0;
  }
  lastSleepToggleAt = 0;
}
