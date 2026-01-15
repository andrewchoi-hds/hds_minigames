# 미니게임 플랫폼 프로젝트

## 프로젝트 개요

Next.js 14 기반의 미니게임 플랫폼으로, 우리은행 WON PLAY를 벤치마크하여 개선한 사용자 참여형 게임 서비스입니다.

### 기술 스택
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: TailwindCSS
- **백엔드**: Supabase (랭킹 시스템)
- **상태 관리**: localStorage (미션, 포인트, 통계, 업적)
- **아이콘**: lucide-react

### 주요 기능
- **13개 미니게임**: 스도쿠, 2048, 메모리, 지뢰찾기, 워들, 슬라이딩퍼즐, 타이핑, 반응속도, 숫자야구, 플래피버드, 뱀, 벽돌깨기, 색상맞추기
- **미션 시스템**: 일일/주간 미션 및 포인트 보상
- **레벨 시스템**: 20레벨 + 칭호 시스템
- **업적 시스템**: 희귀도별 업적 (일반/레어/에픽/전설)
- **출석 체크**: 연속 출석 보너스
- **통계 대시보드**: 플레이 기록, 승률, 최애 게임 분석
- **랭킹 시스템**: 게임별 글로벌 랭킹

---

## 디렉토리 구조

```
/Users/hirediversity/game/
├── src/
│   ├── app/                          # Next.js 14 App Router 페이지
│   │   ├── page.tsx                  # 메인 페이지 (게임 목록)
│   │   ├── missions/page.tsx         # 미션 페이지
│   │   ├── profile/page.tsx          # 프로필 페이지 (통계/업적)
│   │   ├── ranking/page.tsx          # 랭킹 페이지
│   │   └── [game-type]/page.tsx      # 개별 게임 페이지
│   ├── components/
│   │   ├── home/                     # 메인 페이지 컴포넌트
│   │   │   ├── GameCard.tsx          # 게임 카드
│   │   │   ├── CategoryTabs.tsx      # 카테고리 필터
│   │   │   └── HeroBanner.tsx        # 상단 배너
│   │   ├── game-lobby/               # 게임 대기 화면
│   │   │   ├── GameLobby.tsx         # 게임 시작 화면
│   │   │   └── MiniRanking.tsx       # 미니 랭킹
│   │   ├── mission/                  # 미션 관련
│   │   │   ├── MissionCard.tsx       # 미션 카드
│   │   │   └── MissionWidget.tsx     # 홈 미션 위젯
│   │   ├── attendance/               # 출석 체크
│   │   ├── game-result/              # 게임 결과 모달
│   │   └── games/                    # 게임별 컴포넌트
│   │       ├── sudoku/
│   │       ├── memory/
│   │       └── ...
│   └── lib/                          # 핵심 비즈니스 로직
│       ├── mission.ts                # 미션 시스템 (localStorage)
│       ├── achievements.ts           # 업적 시스템
│       ├── level.ts                  # 레벨 시스템
│       ├── stats.ts                  # 통계 시스템
│       ├── attendance.ts             # 출석 시스템
│       ├── supabase.ts               # Supabase 클라이언트
│       ├── auth.ts                   # 로컬 사용자 인증
│       └── data/
│           ├── games.ts              # 게임 메타데이터
│           ├── missions.ts           # 미션 정의
│           └── countries.ts          # 국가 데이터
├── context.md                        # 프로젝트 컨텍스트 (개선 로드맵)
└── .claude/                          # Claude 에이전트 설정
```

---

## 구현 완료 기능

### Phase 1: UI/UX 리뉴얼 ✅

- ✅ 카테고리 필터 탭 (전체, 퍼즐, 액션, 두뇌, 인기)
- ✅ 게임 카드 디자인 리뉴얼
- ✅ 섹션 구분 (인기 게임, 신규 게임, 전체 게임)
- ✅ 게임 시작 대기 화면 (GameLobby 컴포넌트)
- ✅ 게임별 아이콘 및 메타데이터 정의
- ✅ 미니 랭킹 표시 (Top 3)

### Phase 2: 미션 & 리워드 시스템 ✅

#### 미션 시스템 (`src/lib/mission.ts`)
- ✅ 일일 미션 (예: "2048에서 512 타일 만들기", "3개 게임 플레이")
- ✅ 주간 미션 (예: "5개 게임 플레이", "총 10,000점 달성")
- ✅ 미션 자동 리셋 (일일: 자정, 주간: 매주 월요일)
- ✅ 미션 진행도 자동 업데이트
- ✅ 보상 수령 시스템

#### 포인트 시스템
- ✅ localStorage 기반 포인트 관리
- ✅ 미션 완료 시 포인트 지급
- ✅ 업적 해금 시 포인트 지급
- ✅ 출석 체크 포인트 보상

#### 출석 체크 시스템 (`src/lib/attendance.ts`)
- ✅ 일일 출석 체크
- ✅ 연속 출석 카운트 (streak)
- ✅ 연속 출석 보너스 (3일/7일/14일/30일)
- ✅ 월별 출석 현황 조회

### Phase 3: 게이미피케이션 ✅

#### 레벨 시스템 (`src/lib/level.ts`)
- ✅ 20레벨 체계 (0P ~ 36,000P)
- ✅ 레벨별 칭호 (뉴비 → 절대자)
- ✅ 레벨별 아이콘 (이모지)
- ✅ 레벨 진행도 표시

#### 업적 시스템 (`src/lib/achievements.ts`)
- ✅ 다양한 업적 카테고리 (초보자, 마스터, 점수, 연속 플레이, 수집가)
- ✅ 희귀도 시스템 (일반/레어/에픽/전설)
- ✅ 업적 해금 자동 체크
- ✅ 업적 보상 수령

#### 통계 시스템 (`src/lib/stats.ts`)
- ✅ 게임별 통계 (플레이 횟수, 총점, 최고점, 플레이 시간, 승수)
- ✅ 전체 통계 집계
- ✅ 최애 게임 자동 계산
- ✅ 승률 계산

#### UI 컴포넌트
- ✅ 프로필 페이지 (통계/업적 탭)
- ✅ 미션 페이지 (일일/주간 탭)
- ✅ 미션 위젯 (홈 화면)
- ✅ 출석 체크 위젯
- ✅ 게임 결과 모달

---

## 주요 이슈 해결 기록

### 1. 무한 재귀 버그 수정 (2026-01-15)

**문제**: `src/lib/mission.ts`의 `checkAndResetMissions()` 함수에서 무한 재귀 발생
- `checkAndResetMissions()` → `getUserMissions()` → `checkAndResetMissions()` 반복

**해결 방법**:
```typescript
// getRawUserMissions() 함수 분리 (재귀 방지용)
function getRawUserMissions(): Record<string, UserMission> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(STORAGE_KEYS.USER_MISSIONS);
  return data ? JSON.parse(data) : {};
}
```

**교훈**: localStorage 직접 접근 함수와 비즈니스 로직이 포함된 함수를 분리하여 순환 참조 방지

### 2. 레이아웃 너비 일관성 문제 (2026-01-15)

**문제**:
- 메인 페이지: `max-w-lg` 적용됨
- 프로필/미션 페이지: 화면 전체 너비 사용

**해결 방법**: 모든 페이지에 `max-w-lg mx-auto` 일관 적용

**표준 패턴**:
```tsx
<div className="min-h-screen bg-gray-100 dark:bg-gray-900">
  <div className="max-w-lg mx-auto">
    {/* 페이지 콘텐츠 */}
  </div>
</div>
```

---

## 개발 가이드

### 새 게임 추가 시
1. `/src/lib/games/{game-id}.ts` - 게임 로직
2. `/src/components/games/{game-id}/{GameName}Game.tsx` - UI 컴포넌트
3. `/src/app/{game-id}/page.tsx` - 페이지 (GameLobby 통합)
4. `/src/lib/data/games.ts` - 게임 메타데이터 추가

### localStorage 키 목록
| 키 | 설명 | 관리 파일 |
|----|------|-----------|
| `mini_games_user` | 사용자 정보 | auth.ts |
| `mini_games_user_missions` | 미션 진행 상태 | mission.ts |
| `mini_games_user_points` | 보유 포인트 | mission.ts |
| `mini_games_achievements` | 업적 해금 상태 | achievements.ts |
| `mini_games_stats` | 게임별/전체 통계 | stats.ts |
| `mini_games_attendance_log` | 출석 기록 | attendance.ts |
