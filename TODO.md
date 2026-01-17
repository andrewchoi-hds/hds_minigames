# TODO - 다음 작업 목록

> 마지막 업데이트: 2026-01-17

## P0 - 긴급 (즉시 수행)

### [x] console.log 제거 ✅
- **파일**: `src/lib/share.ts`, `src/lib/ranking.ts`, `src/components/KonamiCodeProvider.tsx`
- **완료**: 2026-01-15

---

## P1 - 높음 (조속히 수행)

### [ ] MiniRanking 레벨 뱃지 추가
- GameLobby의 MiniRanking에 현재 사용자 레벨 뱃지 표시
- RankingBoard와 동일한 패턴 적용
- **예상 시간**: 30분

### [ ] 신규 게임 4개 테스트 코드 작성
- tic-tac-toe, simon, high-low, lucky-dice 게임 로직 테스트
- 각 게임당 최소 5개 이상 테스트 케이스
- **예상 시간**: 4시간

### [x] 테스트 코드 작성 ✅
- Jest + React Testing Library 설치 완료
- snake, puzzle-2048 게임 로직 테스트 (29개)
- 미션 시스템 테스트 (8개)
- **완료**: 2026-01-15 (37개 테스트 통과)

### [x] 다크모드 완전성 개선 ✅
- 게임 컴포넌트 `dark:` 클래스 검토 완료
- 모든 컴포넌트에 이미 적용됨
- **완료**: 2026-01-15

### [x] 에러 바운더리 추가 ✅
- `src/components/ErrorBoundary.tsx` 생성
- `src/app/error.tsx`, `src/app/not-found.tsx` 생성
- **완료**: 2026-01-15

### [x] 로딩 상태 개선 ✅
- 스켈레톤 컴포넌트 생성 (`src/components/ui/Skeleton.tsx`)
- MiniRanking, RankingBoard 스켈레톤 적용
- **완료**: 2026-01-15

### [~] 게임별 튜토리얼 모달 (스킵)
- 게임 내 도움말 섹션으로 대체됨

---

## P2 - 중간 (수행 권장)

### [ ] 다른 사용자 레벨 표시 시스템
- Supabase users 테이블에 level, points 컬럼 추가
- 점수 제출 시 레벨 정보 자동 업데이트
- 랭킹 보드에서 모든 사용자 레벨 뱃지 표시
- **예상 시간**: 3시간

### [ ] 레벨 업 알림 모달
- 레벨 업 시 축하 모달 표시
- 레전더리 티어는 confetti 애니메이션
- `checkLevelUp()` 함수로 레벨 변화 감지
- **예상 시간**: 2시간

### [ ] 프로필 페이지 성능 최적화
- `getStatsSummary()`, `getPlayedGames()` useMemo 적용
- 통계 업데이트 시점에만 재계산
- **예상 시간**: 30분

### [ ] 랭킹 페이지 게임 검색 기능
- 17개 게임에서 원하는 게임 빠른 검색
- 즐겨찾기 기능 추가
- **예상 시간**: 1.5시간

### [ ] 신규 게임 4개 업적 추가
- 틱택토, 사이먼, 하이로우, 럭키다이스 관련 업적
- 각 게임당 최소 2개 이상 업적
- **예상 시간**: 1.5시간

### [ ] 게임 결과 공유 시 레벨 정보 포함
- 공유 이미지에 레벨 뱃지 추가
- 캡처 전 애니메이션 비활성화 처리
- **예상 시간**: 45분

### [x] 환경 변수 검증 ✅
- `.env.example` 생성
- `isSupabaseConfigured` 검증 활용
- **완료**: 2026-01-15

### [x] 접근성(A11y) 개선 ✅
- `aria-label` 추가 (버튼, 링크, 아이콘)
- 키보드 네비게이션 지원 (focus-visible:ring)
- 시맨틱 HTML (header, main, nav, section, article)
- role 속성 (tab, tablist, progressbar, list)
- aria-live 동적 콘텐츠 업데이트
- **완료**: 2026-01-16

### [x] 성능 최적화 ✅
- React.memo 적용: GameCard, MissionCard, CategoryTabs, MiniRanking, RankingRow
- useCallback 적용: loadRanking, handleClaim, onChange 핸들러
- useMemo 적용: 미션 진행도 계산
- 유틸 함수 컴포넌트 외부 분리: formatTime, getRankIcon
- **완료**: 2026-01-16

### [x] PWA 지원 ✅
- `@ducanh2912/next-pwa` 설치 및 설정
- `manifest.json` 생성 (앱 이름, 아이콘, 테마 컬러)
- 192x192, 512x512 앱 아이콘 자동 생성
- 오프라인 페이지 (`/offline`) 생성
- layout.tsx에 PWA 메타데이터 추가
- **완료**: 2026-01-16

### [x] 게임 결과 공유 기능 개선 ✅
- `html2canvas`로 결과 영역 이미지 캡처
- Web Share API로 이미지 파일 공유
- 미지원 브라우저 이미지 다운로드 폴백
- GameResultModal에 "이미지 저장" 버튼 추가
- **완료**: 2026-01-16

### [x] 국가 선택 UI 개선 ✅
- `CountrySelectModal` 컴포넌트 생성
- 검색 기능 (국가명/코드 필터링)
- 프로필 페이지에서 국가 변경 기능
- `updateLocalUser()` 함수 추가
- **완료**: 2026-01-16

### [x] 랭킹 시스템 캐싱 ✅
- SWR 적용 (stale-while-revalidate)
- `src/hooks/useRanking.ts` 커스텀 훅 생성
- RankingBoard, MiniRanking 컴포넌트 적용
- 중복 요청 방지 (dedupingInterval)
- 자동 재검증 (revalidateOnFocus)
- **완료**: 2026-01-16

### [x] 게임 일시정지 기능 ✅
- 액션 게임(뱀, 플래피, 벽돌깨기)에 Esc 키 토글
- 일시정지 오버레이 표시
- 모바일용 일시정지/재개 버튼 추가
- **완료**: 2026-01-16

---

## P3 - 낮음 (선택 사항)

### [ ] 레벨 뱃지 애니메이션 최적화
- 랭킹 100명 표시 시 FPS 측정
- `will-change: transform` 또는 Intersection Observer 적용
- **예상 시간**: 30분

### [ ] 레벨 시스템 문서화
- `/docs/level-system.md` 생성
- 레벨 1-20 경험치 테이블, 칭호 목록, 티어별 특징
- **예상 시간**: 45분

### [ ] 새 게임 추가
- 테트리스, 크로스워드 등 검토
- **예상 시간**: 게임당 4시간

### [ ] 애니메이션 개선
- Framer Motion 도입
- 페이지 전환, 카드 리스트 애니메이션
- **예상 시간**: 3시간

### [ ] 관리자 대시보드
- `/admin` 라우트 생성
- 게임별 통계, 사용자 관리
- **예상 시간**: 6시간

### [ ] 다국어 지원 (i18n)
- `next-intl` 또는 `react-i18next` 설치
- 한국어/영어 번역 파일
- **예상 시간**: 8시간

---

## Quick Wins (1시간 미만, 높은 효과)

1. ~~**console.log 제거** (P0)~~ ✅
2. ~~**에러 바운더리 추가** (P1)~~ ✅
3. ~~**환경 변수 검증** (P2)~~ ✅
4. ~~**게임 일시정지 기능** (P2)~~ ✅
5. ~~**랭킹 캐싱 (SWR)** (P2)~~ ✅

---

## 알려진 이슈 / 기술 부채

| 이슈 | 영향 | 노력 | 우선순위 |
|------|------|------|----------|
| ~~console.log 남아있음~~ | ~~높음~~ | ~~낮음~~ | ~~P0~~ ✅ |
| ~~테스트 코드 없음~~ | ~~높음~~ | ~~높음~~ | ~~P1~~ ✅ |
| ~~다크모드 불완전~~ | ~~중간~~ | ~~중간~~ | ~~P1~~ ✅ |
| ~~에러 바운더리 없음~~ | ~~높음~~ | ~~낮음~~ | ~~P1~~ ✅ |
| ~~랭킹 캐싱 없음~~ | ~~높음~~ | ~~중간~~ | ~~P2~~ ✅ |
| ~~접근성 미흡~~ | ~~중간~~ | ~~중간~~ | ~~P2~~ ✅ |
