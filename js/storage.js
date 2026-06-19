import { createNewPet } from "./pet.js";

const STORAGE_KEY = "tamagotchi-pet";

export function savePet(pet) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
  } catch {
    // localStorage unavailable or full
  }
}

export function loadPet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const pet = JSON.parse(raw);
    if (!pet || typeof pet !== "object") return null;
    return pet;
  } catch {
    return null;
  }
}

export function clearPet() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function loadOrCreatePet() {
  return loadPet() ?? createNewPet();
}
