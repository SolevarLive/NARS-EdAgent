import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Send as SendIcon,
  PlayArrow as RunIcon,
  CheckCircle as SuccessIcon,
  DataObject as JsonIcon,
} from '@mui/icons-material';
import { classifyService } from '../../services/api';
import { useMutation } from '@tanstack/react-query';

// Шаблоны для быстрого теста
const SCENARIOS = [
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
const STEPS = [
  'Получение сигнала',
  'NLP Анализ (RFT)',
  'Поиск паттернов',
  'Формирование вывода',
];

export default function Simulator() {
  const [inputText, setInputText] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Мутация для отправки запроса
  const mutation = useMutation({
    mutationFn: (text: string) =>
      classifyService.checkSingle({
        company: 'Test Simulation',
        reply_text: text,
      }),
    onMutate: () => {
      setActiveStep(1);
      setLogs([
        '> Инициализация когнитивного цикла...',
        '> Получен входящий текст...',
      ]);
    },
    onSuccess: (data) => {
      // Имитация задержки для "умного вида"
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          '> Выделение семантических ядер...',
          '> RFT-анализ контекста...',
        ]);
        setActiveStep(2);
      }, 600);

      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          `> Сравнение с базой знаний: ${data.predicted_intent}`,
          `> Уровень уверенности: ${(data.confidence * 100).toFixed(1)}%`,
        ]);
        setActiveStep(3);
      }, 1200);

      setTimeout(() => {
        setLogs((prev) => [...prev, '> Цикл завершен. Решение принято.']);
        setActiveStep(4); // Завершено
      }, 1800);
    },
    onError: (error) => {
      setLogs((prev) => [...prev, `> ОШИБКА ОБРАБОТКИ: ${error}`]);
      setActiveStep(0);
    },
  });

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    setActiveStep(0);
    mutation.reset();
    mutation.mutate(inputText);
  };

  const applyScenario = (text: string) => {
    setInputText(text);
    // Сбрасываем результат при смене текста
    mutation.reset();
    setActiveStep(0);
    setLogs([]);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <BrainIcon fontSize='large' color='primary' />
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 700 }}>
            Симулятор NARS
          </Typography>
          <Typography color='text.secondary'>
            Тестирование когнитивного ядра агента и классификация интентов
            (RFT/NLP)
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Левая колонка: Ввод */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{ p: 3, borderRadius: 3, height: '100%' }}
            elevation={0}
            variant='outlined'
          >
            <Typography
              variant='h6'
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <SendIcon fontSize='small' /> Входящий сигнал (Ответ партнера)
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mb: 1, display: 'block' }}
              >
                Быстрые сценарии:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {SCENARIOS.map((s, i) => (
                  <Chip
                    key={i}
                    label={s.label}
                    onClick={() => applyScenario(s.text)}
                    variant='outlined'
                    clickable
                  />
                ))}
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={6}
              variant='outlined'
              placeholder='Введите текст ответа от компании здесь...'
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              variant='contained'
              size='large'
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={20} color='inherit' />
                ) : (
                  <RunIcon />
                )
              }
              onClick={handleAnalyze}
              disabled={mutation.isPending || !inputText}
              fullWidth
            >
              {mutation.isPending ? 'Обработка...' : 'Запустить анализ'}
            </Button>
          </Paper>
        </Grid>

        {/* Правая колонка: Результат */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            {/* Визуализация процесса */}
            <Paper
              sx={{ p: 3, borderRadius: 3 }}
              elevation={0}
              variant='outlined'
            >
              <Typography
                variant='subtitle2'
                color='text.secondary'
                gutterBottom
              >
                Процесс обработки (NARS Pipeline)
              </Typography>
              <Stepper activeStep={activeStep} alternativeLabel>
                {STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>

            {/* Результат анализа */}
            {mutation.isSuccess && activeStep === 4 && (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: '6px solid',
                  borderColor: getColorByIntent(mutation.data.predicted_intent),
                }}
                elevation={3}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant='overline' color='text.secondary'>
                      Распознанный интент
                    </Typography>
                    <Typography
                      variant='h4'
                      sx={{
                        fontWeight: 'bold',
                        color: getColorByIntent(mutation.data.predicted_intent),
                      }}
                    >
                      {mutation.data.predicted_intent}
                    </Typography>
                  </Box>
                  <Chip
                    icon={
                      mutation.data.human_involved ? (
                        <Alert color='warning' />
                      ) : (
                        <SuccessIcon />
                      )
                    }
                    label={
                      mutation.data.human_involved ? 'Эскалация' : 'Авто-ответ'
                    }
                    color={mutation.data.human_involved ? 'warning' : 'default'}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant='body2'>
                      Уверенность (Confidence)
                    </Typography>
                    <Typography variant='body2' fontWeight='bold'>
                      {(mutation.data.confidence * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={mutation.data.confidence * 100}
                    color={getConfidenceColor(mutation.data.confidence)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                <Alert severity='info' sx={{ mt: 2 }}>
                  {getExplanation(mutation.data.predicted_intent)}
                </Alert>
              </Paper>
            )}

            {/* Лог системы (Terminal style) */}
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: '#1e1e1e',
                color: '#00ff00',
                fontFamily: 'monospace',
                minHeight: 200,
                maxHeight: 300,
                overflowY: 'auto',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                  color: '#fff',
                  opacity: 0.7,
                }}
              >
                <JsonIcon fontSize='small' />
                <Typography variant='caption'>
                  System Logs & Reasoning Trace
                </Typography>
              </Box>
              <Divider sx={{ bgcolor: '#333', mb: 1 }} />
              <List dense disablePadding>
                {logs.map((log, index) => (
                  <ListItem key={index} disablePadding sx={{ py: 0.2 }}>
                    <ListItemText
                      primary={log}
                      primaryTypographyProps={{
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    />
                  </ListItem>
                ))}
                {!mutation.isSuccess &&
                  !mutation.isPending &&
                  logs.length === 0 && (
                    <Typography variant='caption' sx={{ color: '#666' }}>
                      Waiting for input...
                    </Typography>
                  )}
              </List>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

// Вспомогательные функции для UI
function getColorByIntent(intent: string) {
  switch (intent) {
    case 'INTEREST':
      return '#00C49F'; // Green
    case 'DECLINE':
      return '#FF8042'; // Red
    case 'FAQ_REQUEST':
      return '#FFBB28'; // Orange
    case 'OWN_INTERNSHIP':
      return '#0088FE'; // Blue
    default:
      return '#999';
  }
}

function getConfidenceColor(confidence: number) {
  if (confidence > 0.8) return 'success';
  if (confidence > 0.5) return 'warning';
  return 'error';
}

function getExplanation(intent: string) {
  switch (intent) {
    case 'INTEREST':
      return 'Агент распознал высокий интерес. Сработал триггер эскалации на человека.';
    case 'DECLINE':
      return 'Определен отказ. Агент предложит пассивный формат участия (Project-based).';
    case 'FAQ_REQUEST':
      return 'Определен вопрос. Агент отправит файл GENERAL_FAQ.md.';
    case 'OWN_INTERNSHIP':
      return 'У компании своя стажировка. Агент предложит интеграцию (Fast-track).';
    default:
      return 'Интент неясен. Требуется уточнение.';
  }
}
