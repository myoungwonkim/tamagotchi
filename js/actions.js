import { clamp } from "./pet.js";

const ACTION_COOLDOWN_MS = 1500;

let lastActionAt = 0;

export function canPerformAction(pet) {
  if (!pet.isAlive) return false;
  return Date.now() - lastActionAt >= ACTION_COOLDOWN_MS;
}

export function feed(pet) {
  if (!canPerformAction(pet) || pet.isSleeping) return false;

  pet.hunger = clamp(pet.hunger + 30);
  pet.cleanliness = clamp(pet.cleanliness - 5);
  lastActionAt = Date.now();
  return true;
}

export function play(pet) {
  if (!canPerformAction(pet) || pet.isSleeping) return false;

  pet.happiness = clamp(pet.happiness + 25);
  pet.hunger = clamp(pet.hunger - 10);
  lastActionAt = Date.now();
  return true;
}

export function clean(pet) {
  if (!canPerformAction(pet) || pet.isSleeping) return false;

  pet.cleanliness = clamp(pet.cleanliness + 40);
  lastActionAt = Date.now();
  return true;
}

export function toggleSleep(pet) {
  if (!canPerformAction(pet)) return false;

  pet.isSleeping = !pet.isSleeping;
  lastActionAt = Date.now();
  return true;
}

export function resetActionCooldown() {
  lastActionAt = 0;
}
