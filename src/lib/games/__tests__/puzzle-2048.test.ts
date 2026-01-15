import {
  initGame,
  move,
  createEmptyGrid,
  tilesToGrid,
  addRandomTile,
  getTileColor,
  getTileFontSize,
  Tile,
} from '../puzzle-2048';

describe('2048 Game', () => {
  describe('createEmptyGrid', () => {
    it('should create a 4x4 grid with null values', () => {
      const grid = createEmptyGrid();

      expect(grid.length).toBe(4);
      grid.forEach((row) => {
        expect(row.length).toBe(4);
        row.forEach((cell) => {
          expect(cell).toBeNull();
        });
      });
    });
  });

  describe('initGame', () => {
    it('should initialize game with 2 tiles', () => {
      const state = initGame();

      expect(state.tiles.length).toBe(2);
      expect(state.score).toBe(0);
      expect(state.isGameOver).toBe(false);
    });

    it('should initialize with bestScore if provided', () => {
      const state = initGame(1000, 512);

      expect(state.bestScore).toBe(1000);
      expect(state.bestTile).toBe(512);
    });

    it('should create tiles with value 2 or 4', () => {
      const state = initGame();

      state.tiles.forEach((tile) => {
        expect([2, 4]).toContain(tile.value);
      });
    });
  });

  describe('tilesToGrid', () => {
    it('should convert tiles array to grid', () => {
      const tiles: Tile[] = [
        { id: 1, value: 2, row: 0, col: 0, isNew: false, isMerged: false },
        { id: 2, value: 4, row: 1, col: 2, isNew: false, isMerged: false },
      ];

      const grid = tilesToGrid(tiles);

      expect(grid[0][0]?.value).toBe(2);
      expect(grid[1][2]?.value).toBe(4);
      expect(grid[0][1]).toBeNull();
    });
  });

  describe('addRandomTile', () => {
    it('should add a new tile', () => {
      const tiles: Tile[] = [];
      const newTiles = addRandomTile(tiles);

      expect(newTiles.length).toBe(1);
      expect(newTiles[0].isNew).toBe(true);
    });

    it('should not add tile if grid is full', () => {
      // Create a full grid (16 tiles)
      const fullTiles: Tile[] = [];
      let id = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          fullTiles.push({
            id: ++id,
            value: 2,
            row,
            col,
            isNew: false,
            isMerged: false,
          });
        }
      }

      const result = addRandomTile(fullTiles);
      expect(result.length).toBe(16); // No new tile added
    });
  });

  describe('move', () => {
    it('should not move if game is over', () => {
      const state = initGame();
      state.isGameOver = true;

      const result = move(state, 'left');
      expect(result).toEqual(state);
    });

    it('should merge tiles when moving', () => {
      const state = initGame();
      // Set up a scenario where tiles can merge
      state.tiles = [
        { id: 1, value: 2, row: 0, col: 0, isNew: false, isMerged: false },
        { id: 2, value: 2, row: 0, col: 1, isNew: false, isMerged: false },
      ];

      const result = move(state, 'left');

      // Should have merged into value 4
      const mergedTile = result.tiles.find((t) => t.value === 4);
      expect(mergedTile).toBeDefined();
    });

    it('should increase score when merging', () => {
      const state = initGame();
      state.tiles = [
        { id: 1, value: 2, row: 0, col: 0, isNew: false, isMerged: false },
        { id: 2, value: 2, row: 0, col: 1, isNew: false, isMerged: false },
      ];

      const result = move(state, 'left');

      expect(result.score).toBe(4); // 2 + 2 = 4
    });

    it('should add new tile after valid move', () => {
      const state = initGame();
      state.tiles = [
        { id: 1, value: 2, row: 0, col: 3, isNew: false, isMerged: false },
      ];

      const result = move(state, 'left');

      // Should have 2 tiles now (original moved + new one)
      expect(result.tiles.length).toBe(2);
    });

    it('should not change state if no valid move', () => {
      const state = initGame();
      // All tiles on left edge
      state.tiles = [
        { id: 1, value: 2, row: 0, col: 0, isNew: false, isMerged: false },
        { id: 2, value: 4, row: 1, col: 0, isNew: false, isMerged: false },
      ];

      const result = move(state, 'left');

      // State should be unchanged
      expect(result.tiles.length).toBe(state.tiles.length);
    });
  });

  describe('getTileColor', () => {
    it('should return correct colors for known values', () => {
      expect(getTileColor(2).bg).toBe('bg-amber-100');
      expect(getTileColor(4).bg).toBe('bg-amber-200');
      expect(getTileColor(2048).bg).toBe('bg-amber-600');
    });

    it('should return default color for unknown values', () => {
      expect(getTileColor(999999).bg).toBe('bg-gray-800');
    });
  });

  describe('getTileFontSize', () => {
    it('should return larger font for smaller numbers', () => {
      expect(getTileFontSize(2)).toBe('text-3xl sm:text-4xl');
      expect(getTileFontSize(64)).toBe('text-3xl sm:text-4xl');
    });

    it('should return smaller font for larger numbers', () => {
      expect(getTileFontSize(1024)).toBe('text-xl sm:text-2xl');
      expect(getTileFontSize(16384)).toBe('text-lg sm:text-xl');
    });
  });
});
