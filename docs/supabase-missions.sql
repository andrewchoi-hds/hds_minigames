-- Mini Games 미션 시스템 Supabase 테이블 스키마
-- 이 SQL은 나중에 서버 측 미션 시스템 구현 시 사용됩니다.

-- 1. 사용자 포인트 테이블
CREATE TABLE IF NOT EXISTS user_points (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points INT DEFAULT 0,
  total_earned INT DEFAULT 0,  -- 총 획득 포인트
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 미션 정의 테이블 (관리자가 미션 추가/수정)
CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'achievement')),
  target_type TEXT NOT NULL CHECK (target_type IN ('play_count', 'score', 'win', 'streak', 'total_score')),
  target_value INT NOT NULL,
  game_type TEXT,  -- NULL이면 모든 게임
  reward_points INT NOT NULL DEFAULT 0,
  icon TEXT DEFAULT '🎯',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 사용자 미션 진행 테이블
CREATE TABLE IF NOT EXISTS user_missions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  mission_id TEXT REFERENCES missions(id) ON DELETE CASCADE,
  progress INT DEFAULT 0,
  completed_at TIMESTAMP,
  claimed_at TIMESTAMP,
  reset_date DATE,  -- 일일 미션 리셋 날짜
  reset_week INT,   -- 주간 미션 리셋 주차
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, mission_id, reset_date)
);

-- 4. 포인트 히스토리 테이블
CREATE TABLE IF NOT EXISTS point_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  mission_id TEXT REFERENCES missions(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. 플레이 로그 테이블 (미션 진행 추적용)
CREATE TABLE IF NOT EXISTS play_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  score INT DEFAULT 0,
  won BOOLEAN DEFAULT false,
  played_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_missions_user ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_date ON user_missions(reset_date);
CREATE INDEX IF NOT EXISTS idx_point_history_user ON point_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_logs_user_date ON play_logs(user_id, played_at);

-- 기본 일일 미션 데이터 삽입
INSERT INTO missions (id, title, description, type, target_type, target_value, game_type, reward_points, icon)
VALUES
  ('daily-play-3', '게임 3회 플레이', '아무 게임이나 3회 플레이하세요', 'daily', 'play_count', 3, NULL, 50, '🎮'),
  ('daily-2048-500', '2048 도전', '2048에서 500점 이상 달성하세요', 'daily', 'score', 500, 'puzzle2048', 30, '🔢'),
  ('daily-memory-win', '메모리 클리어', '메모리 게임을 클리어하세요', 'daily', 'win', 1, 'memory', 40, '🧠'),
  ('daily-typing-100', '타이핑 마스터', '타이핑 게임에서 100점 이상 달성', 'daily', 'score', 100, 'typing', 30, '⌨️'),
  ('daily-reaction-300', '번개 반응', '반응속도 테스트에서 평균 300ms 이하 달성', 'daily', 'score', 7000, 'reaction', 50, '⚡')
ON CONFLICT (id) DO NOTHING;

-- 기본 주간 미션 데이터 삽입
INSERT INTO missions (id, title, description, type, target_type, target_value, game_type, reward_points, icon)
VALUES
  ('weekly-play-20', '주간 게이머', '이번 주에 20회 게임 플레이', 'weekly', 'play_count', 20, NULL, 200, '🏆'),
  ('weekly-all-games', '올라운더', '5개 이상의 다른 게임 플레이', 'weekly', 'play_count', 5, NULL, 150, '🌟'),
  ('weekly-score-10000', '점수왕', '주간 누적 점수 10,000점 달성', 'weekly', 'total_score', 10000, NULL, 300, '👑')
ON CONFLICT (id) DO NOTHING;

-- 포인트 추가 함수
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id TEXT,
  p_amount INT,
  p_reason TEXT,
  p_mission_id TEXT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  new_points INT;
BEGIN
  -- 포인트 업데이트
  INSERT INTO user_points (user_id, points, total_earned)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET
    points = user_points.points + p_amount,
    total_earned = user_points.total_earned + p_amount,
    updated_at = NOW();

  -- 히스토리 기록
  INSERT INTO point_history (user_id, amount, reason, mission_id)
  VALUES (p_user_id, p_amount, p_reason, p_mission_id);

  -- 새 포인트 반환
  SELECT points INTO new_points FROM user_points WHERE user_id = p_user_id;
  RETURN new_points;
END;
$$ LANGUAGE plpgsql;

-- 미션 진행 업데이트 함수
CREATE OR REPLACE FUNCTION update_mission_progress(
  p_user_id TEXT,
  p_mission_id TEXT,
  p_progress INT,
  p_reset_date DATE DEFAULT CURRENT_DATE
)
RETURNS BOOLEAN AS $$
DECLARE
  mission_record RECORD;
  completed BOOLEAN;
BEGIN
  -- 미션 정보 조회
  SELECT * INTO mission_record FROM missions WHERE id = p_mission_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- 완료 여부 확인
  completed := p_progress >= mission_record.target_value;

  -- 진행 상황 업데이트
  INSERT INTO user_missions (user_id, mission_id, progress, reset_date, completed_at)
  VALUES (
    p_user_id,
    p_mission_id,
    p_progress,
    p_reset_date,
    CASE WHEN completed THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, mission_id, reset_date) DO UPDATE
  SET
    progress = GREATEST(user_missions.progress, p_progress),
    completed_at = CASE
      WHEN p_progress >= mission_record.target_value AND user_missions.completed_at IS NULL
      THEN NOW()
      ELSE user_missions.completed_at
    END;

  RETURN completed;
END;
$$ LANGUAGE plpgsql;
