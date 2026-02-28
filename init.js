import { GameController } from './controller/GameController.js';

const initGame = (gridSize = 3) => {
  return new GameController(gridSize >= 3 && gridSize <= 10 ? gridSize : 3);
};
export { initGame };
