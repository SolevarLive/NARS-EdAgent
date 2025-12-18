// Данные из файла top_20_companies_for_review.xlsx
export const POTENTIAL_LEADS = [
  { name: 'RedLab', email: 'hr@redlab.dev', stack: 'SQL, TypeScript' },
  { name: 'SkillStaff', email: 'hello@skillstaff.ru', stack: 'Fullstack' },
  { name: 'Кибертех', email: 'jobs@cyberprod.ru', stack: 'Python, Git' },
  { name: 'Optimax Dev', email: 'career@optimax.dev', stack: 'React, PHP' },
  { name: 'Правительство Москвы', email: 'grad@mos.ru', stack: 'GovTech' },
  {
    name: 'Positive Technologies',
    email: 'edu@ptsecurity.com',
    stack: 'Python, Go, SQL',
  },
  { name: 'Haulmont', email: 'hr@haulmont.com', stack: 'Java, Jmix' },
  { name: 'Т1', email: 'job@t1.ru', stack: 'Big Data, Java' },
];

// Вспомогательная функция для цвета интента (та же, что в симуляторе)
export const getIntentColor = (intent: string) => {
  switch (intent) {
    case 'INTEREST':
      return 'success';
    case 'DECLINE':
      return 'error';
    case 'FAQ_REQUEST':
      return 'warning';
    case 'OWN_INTERNSHIP':
      return 'info';
    default:
      return 'default';
  }
};

export const COLORS = ['#00C49F', '#FF8042', '#FFBB28', '#0088FE']; // Interest, Decline, FAQ, Other

// Шаблоны для быстрого теста
export const SCENARIOS = [
  {
    label: 'Интерес (Позитив)',
    text: 'Здравствуйте! Нам интересно ваше предложение. Давайте созвонимся во вторник.',
  },
  {
    label: 'Отказ (Нет времени)',
    text: 'Добрый день. Сейчас у нас нет ресурсов на менторство студентов. Спасибо.',
  },
  {
    label: 'Своя стажировка',
    text: 'У нас уже есть своя программа стажировок, мы набираем людей туда.',
  },
  {
    label: 'Запрос FAQ',
    text: 'А кто владеет правами на код? И нужно ли платить студентам?',
  },
];

// Этапы "мышления" (для визуализации NARS/RFT)
export const STEPS = [
  'Получение сигнала',
  'NLP Анализ (RFT)',
  'Поиск паттернов',
  'Формирование вывода',
];
