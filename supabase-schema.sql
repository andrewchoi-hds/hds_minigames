-- 미니게임 플랫폼 DB 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 게임 점수 테이블
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_type VARCHAR(30) NOT NULL,
  difficulty VARCHAR(20),
  score INTEGER NOT NULL,
  time_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_scores_game_type ON scores(game_type);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scores_ranking ON scores(game_type, difficulty, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);

-- 4. RLS (Row Level Security) 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- 익명 사용자도 삽입 가능
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (true);

-- 점수는 모든 사용자가 읽기 가능
CREATE POLICY "Scores are viewable by everyone" ON scores
  FOR SELECT USING (true);

-- 점수 삽입은 모든 사용자 가능
CREATE POLICY "Anyone can insert scores" ON scores
  FOR INSERT WITH CHECK (true);

-- 5. 랭킹 조회 함수
CREATE OR REPLACE FUNCTION get_ranking(
  p_game_type VARCHAR,
  p_difficulty VARCHAR DEFAULT NULL,
  p_period VARCHAR DEFAULT 'all',
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  nickname VARCHAR,
  score INTEGER,
  time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_scores AS (
    SELECT
      s.user_id,
      s.score,
      s.time_seconds,
      s.created_at
    FROM scores s
    WHERE s.game_type = p_game_type
      AND (p_difficulty IS NULL OR s.difficulty = p_difficulty)
      AND (
        CASE p_period
          WHEN 'daily' THEN s.created_at > NOW() - INTERVAL '1 day'
          WHEN 'weekly' THEN s.created_at > NOW() - INTERVAL '7 days'
          ELSE true
        END
      )
  ),
  best_scores AS (
    SELECT
      fs.user_id,
      MAX(fs.score) as best_score,
      MIN(fs.time_seconds) as best_time,
      MAX(fs.created_at) as last_played
    FROM filtered_scores fs
    GROUP BY fs.user_id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY bs.best_score DESC, bs.best_time ASC) as rank,
    bs.user_id,
    u.nickname,
    bs.best_score as score,
    bs.best_time as time_seconds,
    bs.last_played as created_at
  FROM best_scores bs
  JOIN users u ON bs.user_id = u.id
  ORDER BY bs.best_score DESC, bs.best_time ASC
  LIMIT p_limit;
END;
$$;

-- 6. 사용자 순위 조회 함수
CREATE OR REPLACE FUNCTION get_user_rank(
  p_user_id UUID,
  p_game_type VARCHAR,
  p_difficulty VARCHAR DEFAULT NULL,
  p_period VARCHAR DEFAULT 'all'
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  WITH filtered_scores AS (
    SELECT
      s.user_id,
      s.score
    FROM scores s
    WHERE s.game_type = p_game_type
      AND (p_difficulty IS NULL OR s.difficulty = p_difficulty)
      AND (
        CASE p_period
          WHEN 'daily' THEN s.created_at > NOW() - INTERVAL '1 day'
          WHEN 'weekly' THEN s.created_at > NOW() - INTERVAL '7 days'
          ELSE true
        END
      )
  ),
  best_scores AS (
    SELECT
      fs.user_id,
      MAX(fs.score) as best_score
    FROM filtered_scores fs
    GROUP BY fs.user_id
  ),
  ranked AS (
    SELECT
      bs.user_id,
      ROW_NUMBER() OVER (ORDER BY bs.best_score DESC) as rank
    FROM best_scores bs
  )
  SELECT r.rank INTO v_rank
  FROM ranked r
  WHERE r.user_id = p_user_id;

  RETURN COALESCE(v_rank, 0);
END;
$$;
