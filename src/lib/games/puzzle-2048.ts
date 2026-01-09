// 2048 게임 로직

export type Direction = 'up' | 'down' | 'left' | 'right';

export type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
};

export type GameState = {
  tiles: Tile[];
  score: number;
  bestScore: number;
  bestTile: number;
  isGameOver: boolean;
  milestoneReached: number | null; // 새로 달성한 마일스톤 (2048, 4096, ...)
};

let tileIdCounter = 0;

// 새 타일 ID 생성
function generateTileId(): number {
  return ++tileIdCounter;
}

// 빈 보드 생성 (4x4 그리드)
export function createEmptyGrid(): (Tile | null)[][] {
  return Array(4).fill(null).map(() => Array(4).fill(null));
}

// 타일 배열을 그리드로 변환
export function tilesToGrid(tiles: Tile[]): (Tile | null)[][] {
  const grid = createEmptyGrid();
  tiles.forEach(tile => {
    grid[tile.row][tile.col] = tile;
  });
  return grid;
}

// 빈 셀 찾기
function getEmptyCells(grid: (Tile | null)[][]): { row: number; col: number }[] {
  const emptyCells: { row: number; col: number }[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!grid[row][col]) {
        emptyCells.push({ row, col });
      }
    }
  }
  return emptyCells;
}

// 랜덤 빈 셀에 타일 추가
export function addRandomTile(tiles: Tile[]): Tile[] {
  const grid = tilesToGrid(tiles);
  const emptyCells = getEmptyCells(grid);

  if (emptyCells.length === 0) return tiles;

  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  return [
    ...tiles.map(t => ({ ...t, isNew: false, isMerged: false })),
    {
      id: generateTileId(),
      value,
      row,
      col,
      isNew: true,
      isMerged: false,
    },
  ];
}

// 마일스톤 목록 (축하할 타일 값)
const MILESTONES = [2048, 4096, 8192, 16384, 32768, 65536, 131072];

// 초기 게임 상태
export function initGame(bestScore: number = 0, bestTile: number = 0): GameState {
  tileIdCounter = 0;
  let tiles: Tile[] = [];
  tiles = addRandomTile(tiles);
  tiles = addRandomTile(tiles);

  return {
    tiles,
    score: 0,
    bestScore,
    bestTile,
    isGameOver: false,
    milestoneReached: null,
  };
}

// 한 줄 이동 및 병합 (왼쪽으로)
function slideRow(row: (Tile | null)[]): { tiles: (Tile | null)[]; score: number } {
  // null 제거
  const filtered = row.filter((t): t is Tile => t !== null);
  const result: (Tile | null)[] = [];
  let score = 0;
  let skipNext = false;

  for (let i = 0; i < filtered.length; i++) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    if (i < filtered.length - 1 && filtered[i].value === filtered[i + 1].value) {
      // 병합
      const mergedValue = filtered[i].value * 2;
      result.push({
        ...filtered[i],
        value: mergedValue,
        isMerged: true,
      });
      score += mergedValue;
      skipNext = true;
    } else {
      result.push({ ...filtered[i], isMerged: false });
    }
  }

  // 빈 공간 채우기
  while (result.length < 4) {
    result.push(null);
  }

  return { tiles: result, score };
}

// 그리드 회전 (방향 처리용)
function rotateGrid(grid: (Tile | null)[][], times: number): (Tile | null)[][] {
  let result = grid.map(row => [...row]);

  for (let t = 0; t < times; t++) {
    const rotated = createEmptyGrid();
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        rotated[col][3 - row] = result[row][col];
      }
    }
    result = rotated;
  }

  return result;
}

// 이동 처리
export function move(state: GameState, direction: Direction): GameState {
  if (state.isGameOver) return state;

  const grid = tilesToGrid(state.tiles);

  // 방향에 따라 회전
  const rotations: Record<Direction, number> = {
    left: 0,
    down: 1,
    right: 2,
    up: 3,
  };

  let rotatedGrid = rotateGrid(grid, rotations[direction]);

  // 각 행 슬라이드
  let totalScore = 0;
  const newGrid: (Tile | null)[][] = [];

  for (let row = 0; row < 4; row++) {
    const { tiles, score } = slideRow(rotatedGrid[row]);
    newGrid.push(tiles);
    totalScore += score;
  }

  // 원래 방향으로 되돌리기
  const reverseRotations: Record<Direction, number> = {
    left: 0,
    down: 3,
    right: 2,
    up: 1,
  };

  const finalGrid = rotateGrid(newGrid, reverseRotations[direction]);

  // 타일 위치 업데이트
  const newTiles: Tile[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tile = finalGrid[row][col];
      if (tile) {
        newTiles.push({
          ...tile,
          row,
          col,
          isNew: false,
        });
      }
    }
  }

  // 이동이 있었는지 확인
  const hasMoved = !tilesEqual(state.tiles, newTiles);

  if (!hasMoved) {
    return state;
  }

  // 새 타일 추가
  const tilesWithNew = addRandomTile(newTiles);
  const newScore = state.score + totalScore;
  const newBestScore = Math.max(state.bestScore, newScore);

  // 최고 타일 확인
  const maxTileValue = Math.max(...tilesWithNew.map(t => t.value));
  const newBestTile = Math.max(state.bestTile, maxTileValue);

  // 새 마일스톤 달성 확인
  let milestoneReached: number | null = null;
  for (const milestone of MILESTONES) {
    if (maxTileValue >= milestone && state.bestTile < milestone) {
      milestoneReached = milestone;
    }
  }

  // 게임 오버 확인
  const isGameOver = checkGameOver(tilesWithNew);

  return {
    tiles: tilesWithNew,
    score: newScore,
    bestScore: newBestScore,
    bestTile: newBestTile,
    isGameOver,
    milestoneReached,
  };
}

// 타일 배열 비교
function tilesEqual(a: Tile[], b: Tile[]): boolean {
  if (a.length !== b.length) return false;

  const gridA = tilesToGrid(a);
  const gridB = tilesToGrid(b);

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tileA = gridA[row][col];
      const tileB = gridB[row][col];

      if (!tileA && !tileB) continue;
      if (!tileA || !tileB) return false;
      if (tileA.value !== tileB.value) return false;
    }
  }

  return true;
}

// 게임 오버 확인
function checkGameOver(tiles: Tile[]): boolean {
  const grid = tilesToGrid(tiles);

  // 빈 셀이 있으면 게임 오버 아님
  if (getEmptyCells(grid).length > 0) return false;

  // 인접한 같은 숫자가 있으면 게임 오버 아님
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const current = grid[row][col]?.value;
      if (current === undefined) continue;

      // 오른쪽 확인
      if (col < 3 && grid[row][col + 1]?.value === current) return false;
      // 아래 확인
      if (row < 3 && grid[row + 1][col]?.value === current) return false;
    }
  }

  return true;
}

// 타일 값에 따른 색상
export function getTileColor(value: number): { bg: string; text: string } {
  const colors: Record<number, { bg: string; text: string }> = {
    2: { bg: 'bg-amber-100', text: 'text-amber-900' },
    4: { bg: 'bg-amber-200', text: 'text-amber-900' },
    8: { bg: 'bg-orange-300', text: 'text-white' },
    16: { bg: 'bg-orange-400', text: 'text-white' },
    32: { bg: 'bg-orange-500', text: 'text-white' },
    64: { bg: 'bg-orange-600', text: 'text-white' },
    128: { bg: 'bg-yellow-400', text: 'text-white' },
    256: { bg: 'bg-yellow-500', text: 'text-white' },
    512: { bg: 'bg-yellow-600', text: 'text-white' },
    1024: { bg: 'bg-amber-500', text: 'text-white' },
    2048: { bg: 'bg-amber-600', text: 'text-white' },
    4096: { bg: 'bg-rose-500', text: 'text-white' },
    8192: { bg: 'bg-rose-600', text: 'text-white' },
    16384: { bg: 'bg-purple-500', text: 'text-white' },
    32768: { bg: 'bg-purple-600', text: 'text-white' },
    65536: { bg: 'bg-indigo-500', text: 'text-white' },
    131072: { bg: 'bg-indigo-600', text: 'text-white' },
  };

  return colors[value] || { bg: 'bg-gray-800', text: 'text-white' };
}

// 타일 폰트 크기
export function getTileFontSize(value: number): string {
  if (value < 100) return 'text-3xl sm:text-4xl';
  if (value < 1000) return 'text-2xl sm:text-3xl';
  if (value < 10000) return 'text-xl sm:text-2xl';
  if (value < 100000) return 'text-lg sm:text-xl';
  return 'text-base sm:text-lg';
}
