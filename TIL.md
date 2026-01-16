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

---

### 6. 전체 너비 배경과 제한된 콘텐츠 너비 정렬 문제

**문제**: 그라데이션 헤더가 전체 뷰포트 너비로 펼쳐지면서 `max-w-lg` 콘텐츠와 시각적으로 정렬되지 않음

**원인**: 헤더 배경은 전체 너비, 내부 콘텐츠는 `max-w-lg`로 서로 다른 컨테이너에 속함

**해결**: 그라데이션 헤더를 `max-w-lg` 컨테이너 안에 둥근 카드(`rounded-2xl`)로 변경

```tsx
// Before - 정렬 안 맞음
<div className="bg-gradient-to-r from-blue-500 to-purple-600"> {/* 전체 너비 */}
  <div className="max-w-lg mx-auto">...</div>
</div>

// After - 정렬 맞음
<div className="max-w-lg mx-auto px-4">
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mt-4">...</div>
</div>
```

---

### 7. 공통 레이아웃 컴포넌트 패턴 (GamePlayLayout)

**배운 것**: 13개 게임 페이지에서 반복되는 구조를 추상화하여 UI 일관성과 유지보수성 향상

**적용**:
- Props: `gameId`, `title`, `icon`, `onBack`, `children`
- 게임별 테마 컬러 자동 적용 (GAMES 배열의 gradient 속성)
- 뒤로가기 버튼 자동 포함

---

### 8. JSX 닫는 태그 누락 디버깅

**배운 것**: TypeScript/JSX 파서는 닫는 태그 누락 시 **다음 닫는 태그**를 오류 위치로 표시

**디버깅**: 오류 줄 번호 **이전**부터 역순으로 탐색, 에디터 괄호 매칭 활용

---

### 9. TypeScript catch 블록 에러 변수 생략

**배운 것**: TypeScript 4.0+ 에서는 catch 블록에서 에러 변수를 사용하지 않을 때 생략 가능

```typescript
// Before
try { ... } catch (error) { /* error 사용 안 함 */ }

// After (cleaner)
try { ... } catch { /* 변수 생략 */ }
```

**적용**: 에러를 로깅하지 않고 단순히 기본값을 반환하는 경우에 유용

---

### 10. cn() 유틸리티 함수 (clsx + tailwind-merge)

**배운 것**: shadcn/ui 스타일의 className 병합 유틸리티

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**장점**:
- `clsx`: 조건부 클래스 처리 (`isActive && 'active'`)
- `twMerge`: Tailwind 클래스 충돌 해결 (`bg-red-500 bg-blue-500` → `bg-blue-500`)

---

### 11. Next.js 14 + Jest 설정

**배운 것**: App Router 환경에서 Jest 설정 방법

```javascript
// jest.config.js
const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
});
```

**핵심**: `next/jest`가 `tsconfig.json` 및 `.env` 로딩을 자동 처리

---

### 12. Jest에서 localStorage Mock 패턴

**배운 것**: 테스트 간 격리를 위한 localStorage mock 구현

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 각 테스트 전 초기화
beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});
```

**장점**: 실제 저장소가 아닌 메모리에서 동작, 테스트 격리 보장

---

### 13. 다크모드 완전성 검증 패턴

**배운 것**: Tailwind 다크모드 적용 여부를 효율적으로 검증하는 방법

```bash
# dark: 클래스 검색
grep -r "dark:" src/components --include="*.tsx" | wc -l

# 특정 패턴(배경, 텍스트)이 dark: 없이 사용된 곳 찾기
grep -rE "bg-(white|gray-[0-9]+)[^\"]*\"" src/components --include="*.tsx" | grep -v "dark:"
```

**결과**: 모든 컴포넌트에 이미 `dark:` 클래스가 적용되어 있음을 확인
