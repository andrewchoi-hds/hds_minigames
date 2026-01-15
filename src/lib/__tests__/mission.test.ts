import {
  getUserPoints,
  addPoints,
  claimMissionReward,
} from '../mission';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Mission System', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('getUserPoints', () => {
    it('should return 0 when no points saved', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const points = getUserPoints();

      expect(points).toBe(0);
    });

    it('should return saved points', () => {
      localStorageMock.getItem.mockReturnValue('500');

      const points = getUserPoints();

      expect(points).toBe(500);
    });
  });

  describe('addPoints', () => {
    it('should add points to current total', () => {
      localStorageMock.getItem.mockReturnValue('100');

      const newTotal = addPoints(50);

      expect(newTotal).toBe(150);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mini_games_user_points',
        '150'
      );
    });

    it('should start from 0 if no existing points', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const newTotal = addPoints(100);

      expect(newTotal).toBe(100);
    });
  });

  describe('claimMissionReward', () => {
    it('should fail for non-existent mission', () => {
      const result = claimMissionReward('non-existent-mission');

      expect(result.success).toBe(false);
      expect(result.error).toBe('미션을 찾을 수 없습니다');
    });

    it('should fail for incomplete mission', () => {
      // Mock user missions with incomplete mission
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'mini_games_user_missions') {
          return JSON.stringify({
            'daily-play-3': { missionId: 'daily-play-3', progress: 1, completed: false },
          });
        }
        return null;
      });

      const result = claimMissionReward('daily-play-3');

      expect(result.success).toBe(false);
      expect(result.error).toBe('미션이 완료되지 않았습니다');
    });

    it('should fail if reward already claimed', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'mini_games_user_missions') {
          return JSON.stringify({
            'daily-play-3': {
              missionId: 'daily-play-3',
              progress: 3,
              completed: true,
              claimedAt: '2026-01-15T00:00:00.000Z',
            },
          });
        }
        return null;
      });

      const result = claimMissionReward('daily-play-3');

      expect(result.success).toBe(false);
      expect(result.error).toBe('이미 보상을 수령했습니다');
    });
  });
});
