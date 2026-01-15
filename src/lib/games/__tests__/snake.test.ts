import {
  initGame,
  startGame,
  changeDirection,
  updateGame,
  calculateScore,
  getGrade,
  GameState,
  CONSTANTS,
} from '../snake';

describe('Snake Game', () => {
  describe('initGame', () => {
    it('should initialize game with default grid size', () => {
      const state = initGame();

      expect(state.isPlaying).toBe(false);
      expect(state.isGameOver).toBe(false);
      expect(state.score).toBe(0);
      expect(state.snake.length).toBe(3);
      expect(state.direction).toBe('right');
      expect(state.gridSize).toBe(CONSTANTS.DEFAULT_GRID_SIZE);
    });

    it('should initialize game with custom grid size', () => {
      const state = initGame(20);

      expect(state.gridSize).toBe(20);
      // Snake should be centered
      expect(state.snake[0].x).toBe(10);
      expect(state.snake[0].y).toBe(10);
    });

    it('should place food on valid position', () => {
      const state = initGame();

      // Food should be within grid
      expect(state.food.x).toBeGreaterThanOrEqual(0);
      expect(state.food.x).toBeLessThan(state.gridSize);
      expect(state.food.y).toBeGreaterThanOrEqual(0);
      expect(state.food.y).toBeLessThan(state.gridSize);

      // Food should not be on snake
      const foodOnSnake = state.snake.some(
        (segment) => segment.x === state.food.x && segment.y === state.food.y
      );
      expect(foodOnSnake).toBe(false);
    });
  });

  describe('startGame', () => {
    it('should set isPlaying to true', () => {
      const state = initGame();
      const started = startGame(state);

      expect(started.isPlaying).toBe(true);
      expect(started.isGameOver).toBe(false);
    });
  });

  describe('changeDirection', () => {
    it('should change direction', () => {
      const state = initGame();
      const changed = changeDirection(state, 'up');

      expect(changed.nextDirection).toBe('up');
    });

    it('should not allow opposite direction (right to left)', () => {
      const state = initGame(); // default direction is 'right'
      const changed = changeDirection(state, 'left');

      expect(changed.nextDirection).toBe('right'); // unchanged
    });

    it('should not allow opposite direction (up to down)', () => {
      let state = initGame();
      state = changeDirection(state, 'up');
      state = { ...state, direction: 'up' }; // simulate actual direction change

      const changed = changeDirection(state, 'down');
      expect(changed.nextDirection).toBe('up'); // unchanged
    });
  });

  describe('updateGame', () => {
    it('should not update if game is not playing', () => {
      const state = initGame();
      const updated = updateGame(state);

      expect(updated).toEqual(state);
    });

    it('should move snake in current direction', () => {
      let state = initGame();
      state = startGame(state);

      const headBefore = state.snake[0];
      const updated = updateGame(state);

      // Moving right, x should increase
      expect(updated.snake[0].x).toBe(headBefore.x + 1);
      expect(updated.snake[0].y).toBe(headBefore.y);
    });

    it('should end game when hitting wall', () => {
      let state = initGame(5);
      state = startGame(state);

      // Move snake to right edge
      state = {
        ...state,
        snake: [
          { x: 4, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 2 },
        ],
      };

      const updated = updateGame(state);
      expect(updated.isGameOver).toBe(true);
    });

    it('should end game when hitting itself', () => {
      let state = initGame(10);
      state = startGame(state);

      // Create a snake that will hit itself
      state = {
        ...state,
        direction: 'down',
        nextDirection: 'down',
        snake: [
          { x: 5, y: 4 },
          { x: 5, y: 3 },
          { x: 4, y: 3 },
          { x: 4, y: 4 },
          { x: 4, y: 5 },
          { x: 5, y: 5 }, // This segment will be hit
        ],
      };

      const updated = updateGame(state);
      expect(updated.isGameOver).toBe(true);
    });

    it('should increase score when eating food', () => {
      let state = initGame(10);
      state = startGame(state);

      // Place food right in front of snake
      const headX = state.snake[0].x;
      const headY = state.snake[0].y;
      state = {
        ...state,
        food: { x: headX + 1, y: headY },
      };

      const updated = updateGame(state);

      expect(updated.score).toBe(1);
      expect(updated.snake.length).toBe(4); // Snake should grow
    });
  });

  describe('calculateScore', () => {
    it('should calculate score correctly', () => {
      // applesEaten * 100 + (snakeLength - 3) * 50
      expect(calculateScore(5, 8)).toBe(5 * 100 + (8 - 3) * 50); // 500 + 250 = 750
      expect(calculateScore(0, 3)).toBe(0); // 0 + 0 = 0
      expect(calculateScore(10, 13)).toBe(1000 + 500); // 1500
    });
  });

  describe('getGrade', () => {
    it('should return correct grades', () => {
      expect(getGrade(30).grade).toBe('S+');
      expect(getGrade(25).grade).toBe('S');
      expect(getGrade(20).grade).toBe('A+');
      expect(getGrade(15).grade).toBe('A');
      expect(getGrade(10).grade).toBe('B+');
      expect(getGrade(7).grade).toBe('B');
      expect(getGrade(4).grade).toBe('C');
      expect(getGrade(2).grade).toBe('D');
    });
  });
});
