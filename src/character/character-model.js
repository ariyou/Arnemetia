import { createAlienCharacter } from './character-alien.js';

export function createCharacterModel(THREE, gender = 'male') {
  return createAlienCharacter(THREE, gender);
}
