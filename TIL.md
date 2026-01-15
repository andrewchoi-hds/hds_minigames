# TIL (Today I Learned)

## 2026-01-15

### 1. 무한 재귀 패턴과 해결법

**문제**: localStorage 기반 함수에서 무한 재귀 호출 발생
- `getUserMissions()` → `checkAndResetMissions()` → `getUserMissions()` 순환

**해결**: 순수 데이터 접근 함수 분리

```typescript
// Before (재귀 발생)
function checkAndResetMissions() {
  const missions = getUserMissions(); // 재귀!
}
export function getUserMissions() {
  checkAndResetMissions();
  return JSON.parse(localStorage.getItem(KEY));
}

// After (재귀 방지)
function getRawUserMissions() {
  return JSON.parse(localStorage.getItem(KEY) || '{}');
}
function checkAndResetMissions() {
  const missions = getRawUserMissions(); // 안전
}
export function getUserMissions() {
  checkAndResetMissions();
  return getRawUserMissions();
}
```

**교훈**:
- 함수 설계 시 호출 그래프를 먼저 그려보기
- 데이터 접근(Read)과 비즈니스 로직을 분리
- localStorage 같은 외부 저장소는 단일 접근 포인트 유지

---

### 2. React 컴포넌트 레이아웃 일관성 패턴

**문제**: 페이지별 컨테이너 너비 불일치로 네비게이션 시 레이아웃이 튀는 현상

**해결**: Tailwind의 `max-w-lg mx-auto` 조합으로 모든 페이지 컨테이너 통일

```tsx
// 표준화된 페이지 구조
export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-lg mx-auto">
        {/* 페이지 콘텐츠 */}
      </div>
    </div>
  );
}
```

**교훈**:
- `max-w-lg` = 32rem (512px) - 모바일/태블릿에 최적
- Design System의 핵심은 "예측 가능성"
- 신규 페이지 추가 시 반드시 레이아웃 가이드 참조

---

### 3. Grep을 활용한 전역 패턴 검색

**기존 방식**: 페이지를 하나씩 열어서 확인 (시간 소모, 누락 위험)

**개선된 방식**:
```bash
# 패턴 검색
grep -r "max-w-" src/app --include="*.tsx"

# 불일치 발견
grep "max-w-md|max-w-xl" src/app
```

**결과**: 검색 시간 30분 → 2분, 누락 위험 거의 제거

---

### 4. localStorage 상태 관리의 함정

**이전 이해**: localStorage는 단순 key-value 저장소라 복잡도가 낮다

**새로운 이해**:
- 주변 로직(초기화, 검증, 마이그레이션)이 복잡해질 수 있음
- 시간 기반 리셋 로직이 들어가면 재귀 위험 증가
- Raw 데이터 접근과 비즈니스 로직을 명확히 분리해야 함

---

### 5. 함수 책임 분리로 재귀 방지 (Success Pattern)

**문제**: `checkAndResetMissions()`에서 미션 데이터를 읽기 위해 `getUserMissions()`를 호출

**접근법**:
1. 순수 데이터 접근 함수 `getRawUserMissions()` 생성 (로직 없음)
2. `checkAndResetMissions()`에서 `getRawUserMissions()` 사용
3. Public API는 체크 후 Raw 함수 호출

**왜 효과적이었나**:
- 의존성 방향이 단방향: `getUserMissions` → `checkAndResetMissions` → `getRawUserMissions`
- 각 함수가 단일 책임 원칙(SRP) 준수
