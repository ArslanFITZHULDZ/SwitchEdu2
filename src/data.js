export const subjects = [
  {
    id: 'math', name: 'Математика', short: 'Математика', icon: '∑', color: 'violet', progress: 78, lessons: 24, total: 32,
    description: 'Функции, уравнения и геометрия — шаг за шагом к уверенному решению.',
    current: 'Квадратные уравнения', teacher: 'Айгуль Нурлановна',
    topics: [
      { name: 'Квадратные уравнения', type: 'Текущая тема', duration: '18 мин', done: false, detail: 'Дискриминант, корни и проверка ответа на примерах.' },
      { name: 'Квадратичная функция', type: 'Конспект', duration: '12 мин', done: true, detail: 'График параболы, вершина и направление ветвей.' },
      { name: 'Арифметическая прогрессия', type: 'Видеоурок', duration: '15 мин', done: true, detail: 'Формулы n-го члена и суммы первых членов.' },
      { name: 'Теорема Пифагора', type: 'Практика', duration: '10 мин', done: false, detail: 'Прямоугольные треугольники и задачи на стороны.' }
    ],
    practice: { question: 'Решите уравнение: x² − 5x + 6 = 0', options: ['x = 2 и x = 3', 'x = −2 и x = −3', 'x = 1 и x = 6'], correct: 0, explain: 'Разложим на множители: (x − 2)(x − 3) = 0.' }
  },
  {
    id: 'english', name: 'Английский язык', short: 'Английский', icon: 'Aa', color: 'blue', progress: 64, lessons: 18, total: 28,
    description: 'Грамматика, словарный запас и уверенная речь в реальных ситуациях.',
    current: 'Present Perfect', teacher: 'Динара Ермековна',
    topics: [
      { name: 'Present Perfect', type: 'Текущая тема', duration: '16 мин', done: false, detail: 'Связь прошлого с настоящим, ever, never, already, yet.' },
      { name: 'Conditionals: Type 1', type: 'Конспект', duration: '11 мин', done: true, detail: 'Реальные условия: If + Present Simple, will + verb.' },
      { name: 'Environment vocabulary', type: 'Карточки', duration: '8 мин', done: true, detail: 'Слова и выражения по теме защиты окружающей среды.' }
    ],
    practice: { question: 'Выберите правильную форму: I ___ my homework already.', options: ['have finished', 'finished', 'has finished'], correct: 0, explain: 'С I в Present Perfect используется have + третья форма глагола.' }
  },
  {
    id: 'physics', name: 'Физика', short: 'Физика', icon: '⚛', color: 'cyan', progress: 56, lessons: 14, total: 25,
    description: 'Понимай явления вокруг себя через эксперименты и понятные формулы.',
    current: 'Законы Ньютона', teacher: 'Марат Серикович',
    topics: [
      { name: 'Законы Ньютона', type: 'Текущая тема', duration: '20 мин', done: false, detail: 'Инерция, сила, ускорение и взаимодействие тел.' },
      { name: 'Равномерное движение', type: 'Видеоурок', duration: '14 мин', done: true, detail: 'Скорость, путь и время на графиках движения.' },
      { name: 'Работа и мощность', type: 'Практика', duration: '12 мин', done: false, detail: 'Решение задач с формулами A = Fs и P = A/t.' }
    ],
    practice: { question: 'На тело массой 2 кг действует сила 6 Н. Чему равно ускорение?', options: ['3 м/с²', '12 м/с²', '4 м/с²'], correct: 0, explain: 'По второму закону Ньютона a = F/m = 6/2 = 3 м/с².' }
  },
  {
    id: 'chemistry', name: 'Химия', short: 'Химия', icon: '◈', color: 'pink', progress: 71, lessons: 17, total: 24,
    description: 'Реакции, вещества и закономерности химии без лишней сложности.',
    current: 'Окислительно-восстановительные реакции', teacher: 'Жанар Болатовна',
    topics: [
      { name: 'Окислительно-восстановительные реакции', type: 'Текущая тема', duration: '18 мин', done: false, detail: 'Степени окисления и электронный баланс.' },
      { name: 'Периодическая таблица', type: 'Конспект', duration: '13 мин', done: true, detail: 'Группы, периоды и свойства элементов.' },
      { name: 'Кислоты и основания', type: 'Практика', duration: '11 мин', done: true, detail: 'Характерные свойства и индикаторы.' }
    ],
    practice: { question: 'Какой газ выделяется при реакции цинка с соляной кислотой?', options: ['Водород', 'Кислород', 'Азот'], correct: 0, explain: 'Zn + 2HCl → ZnCl₂ + H₂↑. Выделяется водород.' }
  },
  {
    id: 'history', name: 'История Казахстана', short: 'История Казахстана', icon: '✦', color: 'amber', progress: 83, lessons: 25, total: 30,
    description: 'Свяжи даты, события и людей в ясную историческую картину.',
    current: 'Казахское ханство', teacher: 'Алия Рахимовна',
    topics: [
      { name: 'Казахское ханство', type: 'Текущая тема', duration: '17 мин', done: false, detail: 'Образование ханства, Керей и Жанибек.' },
      { name: 'Великий шёлковый путь', type: 'Видеоурок', duration: '14 мин', done: true, detail: 'Города, торговля и культурный обмен.' },
      { name: 'Независимость Казахстана', type: 'Конспект', duration: '12 мин', done: true, detail: 'Ключевые события и государственные символы.' }
    ],
    practice: { question: 'Кто считается основателями Казахского ханства?', options: ['Керей и Жанибек', 'Абылай и Тауке', 'Касым и Есим'], correct: 0, explain: 'Основателями Казахского ханства считаются султаны Керей и Жанибек.' }
  }
]

export const examQuestions = [
  { topic: 'Квадратные уравнения', q: 'Решите уравнение x² − 5x + 6 = 0.', options: ['2 и 3', '−2 и −3', '1 и 6', 'Нет корней'], correct: 0, explanation: '(x − 2)(x − 3) = 0, поэтому корни 2 и 3.' },
  { topic: 'Линейные уравнения', q: 'Найдите x: 3x − 7 = 11.', options: ['4', '5', '6', '7'], correct: 2, explanation: '3x = 18, значит x = 6.' },
  { topic: 'Степени', q: 'Чему равно 2³ · 2²?', options: ['16', '32', '64', '10'], correct: 1, explanation: 'При умножении степеней с одинаковым основанием показатели складываются: 2⁵ = 32.' },
  { topic: 'Функции', q: 'Чему равно значение функции y = 2x − 3 при x = 4?', options: ['3', '5', '7', '11'], correct: 1, explanation: 'Подставляем x = 4: y = 2 · 4 − 3 = 5.' },
  { topic: 'Геометрия', q: 'Сумма углов треугольника равна…', options: ['90°', '120°', '180°', '360°'], correct: 2, explanation: 'Сумма внутренних углов любого треугольника равна 180°.' },
  { topic: 'Прогрессии', q: 'Найдите пятый член прогрессии 3, 7, 11, …', options: ['15', '17', '19', '23'], correct: 2, explanation: 'Разность равна 4. a₅ = 3 + 4 · 4 = 19.' },
  { topic: 'Проценты', q: 'Сколько составляет 20% от 150?', options: ['15', '20', '30', '35'], correct: 2, explanation: '150 · 0,2 = 30.' },
  { topic: 'Корни', q: 'Найдите √81 + √16.', options: ['9', '11', '13', '17'], correct: 2, explanation: '√81 = 9 и √16 = 4. Сумма равна 13.' },
  { topic: 'Системы уравнений', q: 'Если x + y = 10 и x − y = 2, чему равен x?', options: ['4', '5', '6', '8'], correct: 2, explanation: 'Сложим уравнения: 2x = 12, значит x = 6.' },
  { topic: 'Неравенства', q: 'Решите неравенство 2x + 1 > 7.', options: ['x > 2', 'x > 3', 'x < 3', 'x ≥ 3'], correct: 1, explanation: '2x > 6, значит x > 3.' },
  { topic: 'Теорема Пифагора', q: 'Катеты прямоугольного треугольника 6 и 8. Найдите гипотенузу.', options: ['10', '12', '14', '16'], correct: 0, explanation: 'c = √(6² + 8²) = √100 = 10.' },
  { topic: 'Вероятность', q: 'В коробке 3 красных и 2 синих шара. Какова вероятность достать синий?', options: ['1/5', '2/5', '3/5', '1/2'], correct: 1, explanation: 'Благоприятных исходов 2 из 5, вероятность равна 2/5.' },
  { topic: 'Квадратные уравнения', q: 'Чему равен дискриминант уравнения x² − 4x + 4 = 0?', options: ['0', '4', '8', '16'], correct: 0, explanation: 'D = b² − 4ac = 16 − 16 = 0.' },
  { topic: 'Площадь', q: 'Найдите площадь прямоугольника со сторонами 7 см и 9 см.', options: ['16 см²', '32 см²', '63 см²', '126 см²'], correct: 2, explanation: 'Площадь равна произведению сторон: 7 · 9 = 63 см².' },
  { topic: 'Функции', q: 'Какая точка лежит на графике y = x²?', options: ['(2; 2)', '(2; 4)', '(3; 6)', '(4; 8)'], correct: 1, explanation: 'При x = 2 получаем y = 2² = 4.' }
]

export const colorClasses = {
  violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', bar: 'bg-violet-500', text: 'text-violet-600', soft: 'from-violet-50 to-indigo-50' },
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', bar: 'bg-blue-500', text: 'text-blue-600', soft: 'from-blue-50 to-cyan-50' },
  cyan: { bg: 'bg-cyan-50', icon: 'bg-cyan-100 text-cyan-600', bar: 'bg-cyan-500', text: 'text-cyan-600', soft: 'from-cyan-50 to-sky-50' },
  pink: { bg: 'bg-pink-50', icon: 'bg-pink-100 text-pink-600', bar: 'bg-pink-500', text: 'text-pink-600', soft: 'from-pink-50 to-rose-50' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', bar: 'bg-amber-500', text: 'text-amber-600', soft: 'from-amber-50 to-orange-50' }
}
