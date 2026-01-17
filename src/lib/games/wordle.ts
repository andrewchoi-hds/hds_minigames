// 워들 게임 로직

// 5글자 영단어 목록 (일반적인 단어들)
const WORD_LIST = [
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again',
  'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alike', 'alive', 'allow', 'alone',
  'along', 'alter', 'among', 'anger', 'angle', 'angry', 'apart', 'apple', 'apply', 'arena',
  'argue', 'arise', 'armor', 'array', 'arrow', 'asset', 'avoid', 'award', 'aware', 'awful',
  'backs', 'bacon', 'badge', 'badly', 'baker', 'bases', 'basic', 'basis', 'beach', 'beast',
  'began', 'begin', 'begun', 'being', 'belly', 'below', 'bench', 'berry', 'birth', 'black',
  'blade', 'blame', 'blank', 'blast', 'blaze', 'bleed', 'blend', 'bless', 'blind', 'blink',
  'block', 'blood', 'blown', 'board', 'boast', 'bonus', 'boost', 'booth', 'bound', 'brain',
  'brand', 'brave', 'bread', 'break', 'breed', 'brick', 'bride', 'brief', 'bring', 'broad',
  'broke', 'brook', 'brown', 'brush', 'build', 'built', 'bunch', 'burst', 'buyer', 'cabin',
  'cable', 'camel', 'canal', 'candy', 'carry', 'catch', 'cause', 'chain', 'chair', 'chaos',
  'charm', 'chart', 'chase', 'cheap', 'check', 'cheek', 'cheer', 'chess', 'chest', 'chief',
  'child', 'china', 'chord', 'chose', 'chunk', 'claim', 'class', 'clean', 'clear', 'clerk',
  'click', 'cliff', 'climb', 'clock', 'close', 'cloth', 'cloud', 'coach', 'coast', 'coral',
  'couch', 'count', 'court', 'cover', 'craft', 'crane', 'crash', 'crawl', 'crazy', 'cream',
  'crime', 'crisp', 'cross', 'crowd', 'crown', 'crude', 'cruel', 'crush', 'curve', 'cycle',
  'daily', 'dairy', 'dance', 'death', 'debut', 'decay', 'delay', 'delta', 'dense', 'depth',
  'devil', 'diary', 'dirty', 'disco', 'ditch', 'doubt', 'dough', 'dozen', 'draft', 'drain',
  'drama', 'drank', 'drawn', 'dread', 'dream', 'dress', 'dried', 'drift', 'drill', 'drink',
  'drive', 'drown', 'drunk', 'dying', 'eager', 'early', 'earth', 'eight', 'elbow', 'elder',
  'elect', 'elite', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'equip', 'error',
  'essay', 'ethic', 'event', 'every', 'exact', 'exams', 'exist', 'extra', 'faint', 'faith',
  'false', 'fancy', 'fatal', 'fault', 'favor', 'feast', 'fence', 'ferry', 'fever', 'fiber',
  'field', 'fifth', 'fifty', 'fight', 'final', 'first', 'fixed', 'flame', 'flash', 'fleet',
  'flesh', 'float', 'flood', 'floor', 'flour', 'fluid', 'flush', 'focus', 'force', 'forge',
  'forth', 'forty', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'fried', 'front',
  'frost', 'fruit', 'fully', 'funny', 'ghost', 'giant', 'given', 'glass', 'gleam', 'globe',
  'gloom', 'glory', 'glove', 'goose', 'grace', 'grade', 'grain', 'grand', 'grant', 'grape',
  'grasp', 'grass', 'grave', 'great', 'greed', 'green', 'greet', 'grief', 'grill', 'grind',
  'groan', 'groom', 'gross', 'group', 'grove', 'grown', 'guard', 'guess', 'guest', 'guide',
  'guild', 'guilt', 'habit', 'happy', 'harsh', 'haste', 'haven', 'hazel', 'heart', 'heavy',
  'hedge', 'hello', 'hence', 'herbs', 'hobby', 'honey', 'honor', 'horse', 'hotel', 'hound',
  'house', 'human', 'humor', 'hurry', 'ideal', 'image', 'imply', 'inbox', 'index', 'indie',
  'inner', 'input', 'inter', 'intro', 'issue', 'ivory', 'japan', 'jeans', 'jelly', 'jewel',
  'joint', 'joker', 'jolly', 'judge', 'juice', 'juicy', 'jumbo', 'jumpy', 'karma', 'kayak',
  'kebab', 'keeps', 'kicks', 'kings', 'kiosk', 'kites', 'knack', 'knead', 'kneel', 'knife',
  'knock', 'label', 'labor', 'lance', 'large', 'laser', 'later', 'laugh', 'layer', 'learn',
  'lease', 'least', 'leave', 'legal', 'lemon', 'level', 'lever', 'light', 'limit', 'linen',
  'links', 'lions', 'lists', 'liver', 'lobby', 'local', 'lodge', 'logic', 'login', 'loner',
  'loose', 'lorry', 'loser', 'lotus', 'lousy', 'lover', 'lower', 'loyal', 'lucky', 'lumpy',
  'lunch', 'lunar', 'lying', 'lyric', 'macho', 'macro', 'magic', 'major', 'maker', 'manor',
  'march', 'marry', 'marsh', 'match', 'maybe', 'mayor', 'medal', 'media', 'melon', 'mercy',
  'merge', 'merit', 'merry', 'messy', 'metal', 'meter', 'micro', 'midst', 'might', 'minor',
  'minus', 'mirth', 'mixed', 'mixer', 'model', 'modem', 'moist', 'money', 'month', 'moral',
  'motif', 'motor', 'mould', 'mount', 'mouse', 'mouth', 'moved', 'mover', 'movie', 'muddy',
  'multi', 'mural', 'music', 'musty', 'naive', 'naked', 'nasty', 'naval', 'needs', 'nerve',
  'never', 'newer', 'newly', 'night', 'ninja', 'ninth', 'noble', 'noise', 'noisy', 'nomad',
  'north', 'notch', 'noted', 'novel', 'nudge', 'nurse', 'nutty', 'nylon', 'oasis', 'occur',
  'ocean', 'offer', 'often', 'olive', 'omega', 'onion', 'onset', 'opera', 'optic', 'orbit',
  'order', 'organ', 'other', 'ought', 'ounce', 'outer', 'outgo', 'owned', 'owner', 'oxide',
  'ozone', 'paint', 'panda', 'panel', 'panic', 'paper', 'party', 'pasta', 'paste', 'patch',
  'pause', 'peace', 'peach', 'pearl', 'penny', 'perch', 'peril', 'petty', 'phase', 'phone',
  'photo', 'piano', 'piece', 'pilot', 'pinch', 'pitch', 'pizza', 'place', 'plain', 'plane',
  'plant', 'plate', 'plaza', 'plead', 'pleat', 'pluck', 'plumb', 'plump', 'plunk', 'plush',
  'point', 'poise', 'poker', 'polar', 'polls', 'polyp', 'poppy', 'porch', 'poser', 'pouch',
  'pound', 'power', 'prank', 'prawn', 'press', 'price', 'pride', 'prime', 'print', 'prior',
  'prism', 'prize', 'probe', 'prone', 'proof', 'prose', 'proud', 'prove', 'proxy', 'prune',
  'pulse', 'punch', 'pupil', 'puppy', 'purse', 'quack', 'qualm', 'quart', 'queen', 'query',
  'quest', 'queue', 'quick', 'quiet', 'quilt', 'quirk', 'quota', 'quote', 'rabbi', 'racer',
  'radar', 'radio', 'rainy', 'raise', 'rally', 'ranch', 'range', 'rapid', 'ratio', 'razor',
  'reach', 'react', 'ready', 'realm', 'rebel', 'refer', 'reign', 'relax', 'relay', 'relic',
  'remit', 'repay', 'reply', 'resin', 'retro', 'rider', 'ridge', 'rifle', 'right', 'rigid',
  'rigor', 'rinse', 'ripen', 'risen', 'risky', 'rival', 'river', 'roast', 'robot', 'rocky',
  'rogue', 'roman', 'roomy', 'roots', 'rotor', 'rouge', 'rough', 'round', 'route', 'rover',
  'royal', 'rugby', 'ruler', 'rumor', 'rural', 'rusty', 'sadly', 'safer', 'saint', 'salad',
  'salon', 'salsa', 'salty', 'sandy', 'sassy', 'sauce', 'sauna', 'saved', 'saver', 'savvy',
  'scale', 'scare', 'scarf', 'scary', 'scene', 'scent', 'scoop', 'scope', 'score', 'scout',
  'scrap', 'seize', 'sense', 'serve', 'setup', 'seven', 'shade', 'shaft', 'shake', 'shall',
  'shame', 'shape', 'share', 'shark', 'sharp', 'shave', 'sheep', 'sheer', 'sheet', 'shelf',
  'shell', 'shift', 'shine', 'shiny', 'shire', 'shirt', 'shock', 'shoot', 'shore', 'short',
  'shout', 'shown', 'shrub', 'shrug', 'sight', 'sigma', 'signs', 'silly', 'since', 'sixth',
  'sixty', 'sized', 'skate', 'skill', 'skull', 'slack', 'slain', 'slate', 'slave', 'sleek',
  'sleep', 'slice', 'slide', 'slime', 'slimy', 'sling', 'slope', 'sloth', 'small', 'smart',
  'smash', 'smell', 'smile', 'smoke', 'snack', 'snake', 'snare', 'sneak', 'sober', 'solar',
  'solid', 'solve', 'sonic', 'sorry', 'sound', 'south', 'space', 'spare', 'spark', 'speak',
  'spear', 'speed', 'spell', 'spend', 'spent', 'spice', 'spicy', 'spill', 'spine', 'spite',
  'split', 'spoke', 'spoon', 'sport', 'spray', 'squad', 'stack', 'staff', 'stage', 'stain',
  'stair', 'stake', 'stale', 'stall', 'stamp', 'stand', 'stare', 'stark', 'start', 'state',
  'stave', 'stays', 'steak', 'steal', 'steam', 'steel', 'steep', 'steer', 'stern', 'stick',
  'stiff', 'still', 'sting', 'stock', 'stomp', 'stone', 'stool', 'store', 'storm', 'story',
  'stout', 'stove', 'strap', 'straw', 'stray', 'strip', 'stuck', 'study', 'stuff', 'stump',
  'stung', 'stunk', 'style', 'sugar', 'suite', 'sunny', 'super', 'surge', 'swamp', 'swarm',
  'swear', 'sweat', 'sweep', 'sweet', 'swell', 'swept', 'swift', 'swing', 'swiss', 'sword',
  'swore', 'sworn', 'swung', 'table', 'tacky', 'taken', 'tally', 'tango', 'tangy', 'tardy',
  'taste', 'tasty', 'taxes', 'teach', 'teeth', 'tempo', 'tenor', 'tense', 'tenth', 'terms',
  'terry', 'tests', 'thank', 'theft', 'their', 'theme', 'there', 'these', 'thick', 'thief',
  'thigh', 'thing', 'think', 'third', 'thorn', 'those', 'three', 'threw', 'throw', 'thumb',
  'tiger', 'tight', 'timer', 'times', 'tipsy', 'tired', 'title', 'toast', 'today', 'token',
  'tonal', 'torch', 'total', 'touch', 'tough', 'towel', 'tower', 'toxic', 'trace', 'track',
  'trade', 'trail', 'train', 'trait', 'trash', 'tread', 'treat', 'trend', 'trial', 'tribe',
  'trick', 'tried', 'troop', 'trout', 'truck', 'truly', 'trump', 'trunk', 'trust', 'truth',
  'tulip', 'tumor', 'tuned', 'tuner', 'tuple', 'tutor', 'tweed', 'tweet', 'twice', 'twirl',
  'twist', 'udder', 'ultra', 'uncut', 'under', 'undid', 'undue', 'unfed', 'unfit', 'unhip',
  'union', 'unite', 'units', 'unity', 'unmet', 'unwed', 'upper', 'upset', 'urban', 'usher',
  'using', 'usual', 'utter', 'vague', 'valid', 'value', 'valve', 'vapor', 'vault', 'vegan',
  'venue', 'verge', 'verse', 'video', 'vigil', 'vigor', 'vinyl', 'viola', 'viral', 'virus',
  'visit', 'visor', 'vista', 'vital', 'vivid', 'vocal', 'vodka', 'vogue', 'voice', 'voted',
  'voter', 'vouch', 'vowel', 'wagon', 'waist', 'walks', 'walls', 'waltz', 'waste', 'watch',
  'water', 'waved', 'waver', 'waves', 'weary', 'weave', 'wedge', 'weeds', 'weigh', 'weird',
  'wheat', 'wheel', 'where', 'which', 'while', 'whine', 'whirl', 'white', 'whole', 'whose',
  'widen', 'wider', 'widow', 'width', 'wield', 'willy', 'windy', 'witch', 'witty', 'woken',
  'woman', 'women', 'woods', 'woozy', 'world', 'worry', 'worse', 'worst', 'worth', 'would',
  'wound', 'woven', 'wrack', 'wrath', 'wreck', 'wrist', 'write', 'wrong', 'wrote', 'yacht',
  'yearn', 'yeast', 'yield', 'young', 'yours', 'youth', 'zebra', 'zesty', 'zloty', 'zonal',
];

// 정답 후보 단어 (더 일반적인 단어들)
const ANSWER_LIST = [
  'about', 'above', 'actor', 'adult', 'after', 'again', 'agent', 'agree', 'ahead', 'alarm',
  'album', 'alert', 'alive', 'allow', 'alone', 'along', 'angry', 'apple', 'apply', 'arena',
  'argue', 'armor', 'array', 'arrow', 'avoid', 'award', 'aware', 'awful', 'bacon', 'badge',
  'basic', 'beach', 'beast', 'began', 'begin', 'being', 'below', 'bench', 'birth', 'black',
  'blade', 'blame', 'blank', 'blast', 'blaze', 'blend', 'blind', 'block', 'blood', 'board',
  'bonus', 'boost', 'bound', 'brain', 'brand', 'brave', 'bread', 'break', 'brick', 'bride',
  'brief', 'bring', 'broad', 'broke', 'brown', 'brush', 'build', 'built', 'bunch', 'burst',
  'buyer', 'cabin', 'cable', 'candy', 'carry', 'catch', 'cause', 'chain', 'chair', 'charm',
  'chart', 'chase', 'cheap', 'check', 'chest', 'chief', 'child', 'claim', 'class', 'clean',
  'clear', 'clerk', 'click', 'climb', 'clock', 'close', 'cloth', 'cloud', 'coach', 'coast',
  'count', 'court', 'cover', 'craft', 'crane', 'crash', 'crazy', 'cream', 'crime', 'cross',
  'crowd', 'crown', 'cruel', 'crush', 'cycle', 'daily', 'dance', 'death', 'delay', 'depth',
  'dirty', 'doubt', 'dozen', 'draft', 'drain', 'drama', 'drank', 'dream', 'dress', 'drift',
  'drill', 'drink', 'drive', 'drown', 'drunk', 'eager', 'early', 'earth', 'eight', 'elect',
  'elite', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'essay', 'event',
  'every', 'exact', 'exist', 'extra', 'faith', 'false', 'fancy', 'fatal', 'fault', 'favor',
  'feast', 'fence', 'fever', 'fiber', 'field', 'fifty', 'fight', 'final', 'first', 'flame',
  'flash', 'fleet', 'flesh', 'float', 'flood', 'floor', 'flour', 'fluid', 'focus', 'force',
  'forth', 'forty', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'front', 'frost',
  'fruit', 'funny', 'ghost', 'giant', 'given', 'glass', 'globe', 'glory', 'glove', 'goose',
  'grace', 'grade', 'grain', 'grand', 'grant', 'grape', 'grasp', 'grass', 'grave', 'great',
  'green', 'greet', 'grief', 'grill', 'grind', 'gross', 'group', 'grown', 'guard', 'guess',
  'guest', 'guide', 'guilt', 'habit', 'happy', 'harsh', 'heart', 'heavy', 'hello', 'hence',
  'hobby', 'honey', 'honor', 'horse', 'hotel', 'house', 'human', 'humor', 'ideal', 'image',
  'imply', 'index', 'inner', 'input', 'issue', 'jeans', 'jelly', 'jewel', 'joint', 'judge',
  'juice', 'jumpy', 'knife', 'knock', 'label', 'labor', 'large', 'laser', 'later', 'laugh',
  'layer', 'learn', 'lease', 'least', 'leave', 'legal', 'lemon', 'level', 'lever', 'light',
  'limit', 'links', 'liver', 'lobby', 'local', 'lodge', 'logic', 'loose', 'lower', 'loyal',
  'lucky', 'lunch', 'magic', 'major', 'maker', 'march', 'marry', 'match', 'maybe', 'mayor',
  'media', 'melon', 'mercy', 'merge', 'merit', 'merry', 'metal', 'meter', 'might', 'minor',
  'mixed', 'model', 'money', 'month', 'moral', 'motor', 'mount', 'mouse', 'mouth', 'movie',
  'music', 'naked', 'nasty', 'naval', 'nerve', 'never', 'night', 'ninth', 'noble', 'noise',
  'north', 'noted', 'novel', 'nurse', 'occur', 'ocean', 'offer', 'often', 'olive', 'onion',
  'opera', 'orbit', 'order', 'organ', 'other', 'ought', 'outer', 'owned', 'owner', 'paint',
  'panel', 'panic', 'paper', 'party', 'pasta', 'patch', 'pause', 'peace', 'peach', 'penny',
  'phase', 'phone', 'photo', 'piano', 'piece', 'pilot', 'pitch', 'pizza', 'place', 'plain',
  'plane', 'plant', 'plate', 'plaza', 'plead', 'point', 'polar', 'pound', 'power', 'press',
  'price', 'pride', 'prime', 'print', 'prior', 'prize', 'proof', 'proud', 'prove', 'pulse',
  'punch', 'pupil', 'puppy', 'queen', 'query', 'quest', 'queue', 'quick', 'quiet', 'quote',
  'radar', 'radio', 'rainy', 'raise', 'rally', 'ranch', 'range', 'rapid', 'ratio', 'razor',
  'reach', 'react', 'ready', 'realm', 'rebel', 'refer', 'reign', 'relax', 'relay', 'reply',
  'rider', 'ridge', 'rifle', 'right', 'rigid', 'rival', 'river', 'roast', 'robot', 'rocky',
  'roman', 'rough', 'round', 'route', 'royal', 'rugby', 'ruler', 'rumor', 'rural', 'sadly',
  'saint', 'salad', 'salon', 'salty', 'sandy', 'sauce', 'scale', 'scare', 'scary', 'scene',
  'scent', 'scope', 'score', 'scout', 'sense', 'serve', 'setup', 'seven', 'shade', 'shake',
  'shall', 'shame', 'shape', 'share', 'shark', 'sharp', 'sheep', 'sheet', 'shelf', 'shell',
  'shift', 'shine', 'shiny', 'shirt', 'shock', 'shoot', 'shore', 'short', 'shout', 'shown',
  'sight', 'silly', 'since', 'sixth', 'sixty', 'skill', 'skull', 'slave', 'sleep', 'slice',
  'slide', 'slope', 'small', 'smart', 'smash', 'smell', 'smile', 'smoke', 'snack', 'snake',
  'sober', 'solar', 'solid', 'solve', 'sorry', 'sound', 'south', 'space', 'spare', 'spark',
  'speak', 'speed', 'spell', 'spend', 'spent', 'spice', 'spicy', 'spill', 'spine', 'spite',
  'split', 'spoke', 'spoon', 'sport', 'spray', 'squad', 'stack', 'staff', 'stage', 'stain',
  'stair', 'stake', 'stand', 'stare', 'start', 'state', 'steak', 'steal', 'steam', 'steel',
  'steep', 'stern', 'stick', 'stiff', 'still', 'stock', 'stone', 'stool', 'store', 'storm',
  'story', 'stove', 'strap', 'straw', 'strip', 'stuck', 'study', 'stuff', 'style', 'sugar',
  'suite', 'sunny', 'super', 'swamp', 'swear', 'sweat', 'sweep', 'sweet', 'swell', 'swept',
  'swift', 'swing', 'sword', 'table', 'taken', 'taste', 'tasty', 'teach', 'teeth', 'tempo',
  'tense', 'tenth', 'thank', 'theft', 'their', 'theme', 'there', 'these', 'thick', 'thief',
  'thing', 'think', 'third', 'thorn', 'those', 'three', 'threw', 'throw', 'thumb', 'tiger',
  'tight', 'timer', 'tired', 'title', 'toast', 'today', 'token', 'torch', 'total', 'touch',
  'tough', 'towel', 'tower', 'trace', 'track', 'trade', 'trail', 'train', 'trash', 'treat',
  'trend', 'trial', 'tribe', 'trick', 'tried', 'troop', 'truck', 'truly', 'trunk', 'trust',
  'truth', 'tulip', 'tumor', 'tutor', 'twice', 'twist', 'ultra', 'under', 'union', 'unite',
  'unity', 'upper', 'upset', 'urban', 'using', 'usual', 'value', 'video', 'virus', 'visit',
  'vital', 'vivid', 'vocal', 'voice', 'voted', 'voter', 'wagon', 'waste', 'watch', 'water',
  'weary', 'weave', 'wheat', 'wheel', 'where', 'which', 'while', 'white', 'whole', 'whose',
  'wider', 'width', 'windy', 'witch', 'woman', 'women', 'world', 'worry', 'worse', 'worst',
  'worth', 'would', 'wound', 'woven', 'wreck', 'wrist', 'write', 'wrong', 'wrote', 'yearn',
  'yield', 'young', 'youth', 'zebra',
];

export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export type GuessResult = {
  letter: string;
  state: LetterState;
};

export type GameState = {
  answer: string;
  guesses: string[];
  currentGuess: string;
  maxGuesses: number;
  isGameOver: boolean;
  isWon: boolean;
  usedLetters: Record<string, LetterState>;
};

// 랜덤 단어 선택
export function getRandomWord(): string {
  return ANSWER_LIST[Math.floor(Math.random() * ANSWER_LIST.length)];
}

// 일일 단어 (날짜 기반)
export function getDailyWord(): string {
  const startDate = new Date('2024-01-01').getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  const dayIndex = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  return ANSWER_LIST[dayIndex % ANSWER_LIST.length];
}

// 게임 초기화
export function initGame(mode: 'daily' | 'infinite' = 'infinite'): GameState {
  const answer = mode === 'daily' ? getDailyWord() : getRandomWord();

  return {
    answer,
    guesses: [],
    currentGuess: '',
    maxGuesses: 6,
    isGameOver: false,
    isWon: false,
    usedLetters: {},
  };
}

// 단어 유효성 검사
export function isValidWord(word: string): boolean {
  return WORD_LIST.includes(word.toLowerCase());
}

// 추측 결과 계산
export function evaluateGuess(guess: string, answer: string): GuessResult[] {
  const result: GuessResult[] = [];
  const answerLetters = answer.split('');
  const guessLetters = guess.toLowerCase().split('');

  // 사용된 정답 글자 추적
  const usedIndices = new Set<number>();

  // 1단계: 정확한 위치 확인 (🟩)
  guessLetters.forEach((letter, i) => {
    if (letter === answerLetters[i]) {
      result[i] = { letter, state: 'correct' };
      usedIndices.add(i);
    }
  });

  // 2단계: 다른 위치에 있는 글자 확인 (🟨)
  guessLetters.forEach((letter, i) => {
    if (result[i]) return; // 이미 정확한 위치면 스킵

    const availableIndex = answerLetters.findIndex(
      (ansLetter, ansIdx) => ansLetter === letter && !usedIndices.has(ansIdx)
    );

    if (availableIndex !== -1) {
      result[i] = { letter, state: 'present' };
      usedIndices.add(availableIndex);
    } else {
      result[i] = { letter, state: 'absent' };
    }
  });

  return result;
}

// 추측 제출
export function submitGuess(state: GameState, guess: string): GameState {
  if (state.isGameOver) return state;
  if (guess.length !== 5) return state;
  if (!isValidWord(guess)) return state;

  const normalizedGuess = guess.toLowerCase();
  const results = evaluateGuess(normalizedGuess, state.answer);

  // 사용된 글자 상태 업데이트
  const newUsedLetters = { ...state.usedLetters };
  results.forEach(({ letter, state: letterState }) => {
    const currentState = newUsedLetters[letter];
    // correct > present > absent 순으로 우선순위
    if (
      !currentState ||
      letterState === 'correct' ||
      (letterState === 'present' && currentState === 'absent')
    ) {
      newUsedLetters[letter] = letterState;
    }
  });

  const newGuesses = [...state.guesses, normalizedGuess];
  const isWon = normalizedGuess === state.answer;
  const isGameOver = isWon || newGuesses.length >= state.maxGuesses;

  return {
    ...state,
    guesses: newGuesses,
    currentGuess: '',
    isWon,
    isGameOver,
    usedLetters: newUsedLetters,
  };
}

// 현재 입력 업데이트
export function updateCurrentGuess(state: GameState, letter: string): GameState {
  if (state.isGameOver) return state;
  if (state.currentGuess.length >= 5) return state;

  return {
    ...state,
    currentGuess: state.currentGuess + letter.toLowerCase(),
  };
}

// 글자 삭제
export function deleteLastLetter(state: GameState): GameState {
  if (state.isGameOver) return state;
  if (state.currentGuess.length === 0) return state;

  return {
    ...state,
    currentGuess: state.currentGuess.slice(0, -1),
  };
}

// 글자 상태에 따른 색상 클래스
export function getLetterColorClass(state: LetterState): string {
  switch (state) {
    case 'correct':
      return 'bg-green-500 text-white border-green-500';
    case 'present':
      return 'bg-yellow-500 text-white border-yellow-500';
    case 'absent':
      return 'bg-gray-500 text-white border-gray-500';
    default:
      return 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600';
  }
}

// 키보드 글자 색상 클래스
export function getKeyColorClass(state: LetterState | undefined): string {
  switch (state) {
    case 'correct':
      return 'bg-green-500 text-white';
    case 'present':
      return 'bg-yellow-500 text-white';
    case 'absent':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white';
  }
}
