import { createRabbitCharacter } from './character-rabbit.js';

// Character factory: all playable avatars use the same rounded sticker-art language.
export function createCharacterModel(THREE, gender = 'female') {
  return createRabbitCharacter(THREE, gender);
}
