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
- **테스트**: Jest + React Testing Library
- **유틸리티**: clsx, tailwind-merge (cn 함수)

### 주요 기능
- **17개 미니게임**: 스도쿠, 2048, 메모리, 지뢰찾기, 워들, 슬라이딩퍼즐, 타이핑, 반응속도, 숫자야구, 플래피버드, 뱀, 벽돌깨기, 색상맞추기, 틱택토, 사이먼, 하이로우, 럭키다이스
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
│   │   ├── layout/                   # 레이아웃 컴포넌트
│   │   │   └── GamePlayLayout.tsx    # 게임 플레이 화면 래퍼
│   │   ├── ui/                       # 공통 UI 컴포넌트
│   │   │   ├── Skeleton.tsx          # 스켈레톤 로딩
│   │   │   └── LevelBadge.tsx        # 레벨 뱃지 (6티어 시스템)
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
│       ├── utils.ts                  # 유틸리티 함수 (cn)
│       ├── __tests__/                # 테스트 파일
│       │   └── mission.test.ts       # 미션 시스템 테스트
│       ├── games/
│       │   ├── snake.ts              # 뱀 게임 로직
│       │   ├── puzzle-2048.ts        # 2048 게임 로직
│       │   └── __tests__/            # 게임 로직 테스트
│       │       ├── snake.test.ts
│       │       └── puzzle-2048.test.ts
│       └── data/
│           ├── games.ts              # 게임 메타데이터
│           ├── missions.ts           # 미션 정의
│           └── countries.ts          # 국가 데이터
├── context.md                        # 프로젝트 컨텍스트 (개선 로드맵)
├── jest.config.js                    # Jest 설정
├── jest.setup.js                     # Jest 셋업 (localStorage mock)
├── .env.example                      # 환경 변수 템플릿
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
- ✅ GamePlayLayout 컴포넌트 (게임별 테마 컬러 적용)
- ✅ 통일된 헤더 스타일 (max-w-lg + rounded-2xl 카드)

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

## UI 디자인 패턴

### 레이아웃 표준
모든 페이지는 `max-w-lg mx-auto` 컨테이너를 사용합니다.

```tsx
<div className="min-h-screen bg-gray-100 dark:bg-gray-900">
  <div className="max-w-lg mx-auto px-4">
    {/* 헤더 - 둥근 카드 스타일 */}
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl px-4 py-3 mt-4">
      {/* 헤더 내용 */}
    </div>
    {/* 콘텐츠 */}
  </div>
</div>
```

### 게임 페이지 구조
게임 페이지는 `GamePlayLayout` 컴포넌트를 사용합니다.

```tsx
import { GamePlayLayout } from '@/components/layout';

export default function GamePage() {
  const [showLobby, setShowLobby] = useState(true);

  if (showLobby) {
    return <GameLobby gameId="game-id" onStart={() => setShowLobby(false)} />;
  }

  return (
    <GamePlayLayout
      gameId="game-id"
      title="게임 이름"
      icon="🎮"
      onBack={() => setShowLobby(true)}
    >
      <GameComponent />
    </GamePlayLayout>
  );
}
```

**GamePlayLayout 특징**:
- 게임별 테마 컬러 자동 적용 (GAMES 배열의 gradient 속성)
- 헤더가 콘텐츠와 동일한 너비의 둥근 카드 스타일
- 뒤로가기 버튼 자동 포함

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

---

## 테스트

### 테스트 실행
```bash
npm test           # 전체 테스트 실행
npm run test:watch # 파일 변경 시 자동 실행
npm run test:coverage # 커버리지 리포트
```

### 테스트 구조
- **게임 로직 테스트**: `src/lib/games/__tests__/`
  - `snake.test.ts` (16개 테스트): 초기화, 방향 전환, 충돌 감지, 점수 계산
  - `puzzle-2048.test.ts` (13개 테스트): 그리드 생성, 타일 이동/병합, 점수 계산
- **시스템 테스트**: `src/lib/__tests__/`
  - `mission.test.ts` (8개 테스트): 포인트 관리, 미션 보상 수령

### localStorage Mock 패턴
```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

---

## 에러 처리

### ErrorBoundary 컴포넌트
`src/components/ErrorBoundary.tsx` - React 클래스 컴포넌트로 에러를 캐치합니다.

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <SomeComponent />
</ErrorBoundary>
```

### Next.js App Router 에러 페이지
- `src/app/error.tsx` - 전역 에러 페이지 (reset 버튼 포함)
- `src/app/not-found.tsx` - 404 페이지

---

## 유틸리티 함수

### cn() - 클래스네임 병합
`src/lib/utils.ts`에서 제공하는 Tailwind 클래스 병합 유틸리티입니다.

```typescript
import { cn } from '@/lib/utils';

// 조건부 클래스 적용
<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
)} />
```

### 스켈레톤 컴포넌트
`src/components/ui/Skeleton.tsx`에서 로딩 상태 UI를 제공합니다.

```tsx
import { GameCardSkeleton, RankingRowSkeleton } from '@/components/ui/Skeleton';

// 로딩 중일 때
{isLoading ? <GameCardSkeleton /> : <GameCard />}
```

**제공 컴포넌트**: Skeleton, TextSkeleton, CircleSkeleton, CardSkeleton, GameCardSkeleton, RankingRowSkeleton, RankingBoardSkeleton, MiniRankingSkeleton, MissionCardSkeleton, ProfileSkeleton
