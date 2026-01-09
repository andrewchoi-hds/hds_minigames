// 국가 데이터 (국기 이모지 포함)
export type Country = {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  nameKo: string;
  flag: string;
};

export const COUNTRIES: Country[] = [
  { code: 'KR', name: 'South Korea', nameKo: '대한민국', flag: '🇰🇷' },
  { code: 'US', name: 'United States', nameKo: '미국', flag: '🇺🇸' },
  { code: 'JP', name: 'Japan', nameKo: '일본', flag: '🇯🇵' },
  { code: 'CN', name: 'China', nameKo: '중국', flag: '🇨🇳' },
  { code: 'GB', name: 'United Kingdom', nameKo: '영국', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', nameKo: '독일', flag: '🇩🇪' },
  { code: 'FR', name: 'France', nameKo: '프랑스', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', nameKo: '캐나다', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', nameKo: '호주', flag: '🇦🇺' },
  { code: 'BR', name: 'Brazil', nameKo: '브라질', flag: '🇧🇷' },
  { code: 'IN', name: 'India', nameKo: '인도', flag: '🇮🇳' },
  { code: 'RU', name: 'Russia', nameKo: '러시아', flag: '🇷🇺' },
  { code: 'IT', name: 'Italy', nameKo: '이탈리아', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', nameKo: '스페인', flag: '🇪🇸' },
  { code: 'MX', name: 'Mexico', nameKo: '멕시코', flag: '🇲🇽' },
  { code: 'NL', name: 'Netherlands', nameKo: '네덜란드', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', nameKo: '스웨덴', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', nameKo: '노르웨이', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', nameKo: '덴마크', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', nameKo: '핀란드', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', nameKo: '폴란드', flag: '🇵🇱' },
  { code: 'TW', name: 'Taiwan', nameKo: '대만', flag: '🇹🇼' },
  { code: 'SG', name: 'Singapore', nameKo: '싱가포르', flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand', nameKo: '태국', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', nameKo: '베트남', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', nameKo: '필리핀', flag: '🇵🇭' },
  { code: 'MY', name: 'Malaysia', nameKo: '말레이시아', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', nameKo: '인도네시아', flag: '🇮🇩' },
  { code: 'AR', name: 'Argentina', nameKo: '아르헨티나', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', nameKo: '칠레', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', nameKo: '콜롬비아', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', nameKo: '페루', flag: '🇵🇪' },
  { code: 'ZA', name: 'South Africa', nameKo: '남아프리카', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', nameKo: '이집트', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', nameKo: '나이지리아', flag: '🇳🇬' },
  { code: 'AE', name: 'UAE', nameKo: 'UAE', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', nameKo: '사우디아라비아', flag: '🇸🇦' },
  { code: 'TR', name: 'Turkey', nameKo: '터키', flag: '🇹🇷' },
  { code: 'IL', name: 'Israel', nameKo: '이스라엘', flag: '🇮🇱' },
  { code: 'NZ', name: 'New Zealand', nameKo: '뉴질랜드', flag: '🇳🇿' },
  { code: 'IE', name: 'Ireland', nameKo: '아일랜드', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal', nameKo: '포르투갈', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', nameKo: '그리스', flag: '🇬🇷' },
  { code: 'AT', name: 'Austria', nameKo: '오스트리아', flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', nameKo: '스위스', flag: '🇨🇭' },
  { code: 'BE', name: 'Belgium', nameKo: '벨기에', flag: '🇧🇪' },
  { code: 'CZ', name: 'Czech Republic', nameKo: '체코', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', nameKo: '헝가리', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', nameKo: '루마니아', flag: '🇷🇴' },
  { code: 'UA', name: 'Ukraine', nameKo: '우크라이나', flag: '🇺🇦' },
];

// 국가 코드로 국가 정보 가져오기
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

// 기본 국가 (한국)
export const DEFAULT_COUNTRY_CODE = 'KR';
