import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/api';
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  Email as EmailIcon,
  RateReview as RateReviewIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import StatCard from './components/StatCard';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { COLORS } from '../../shared/const';

export default function Dashboard() {
  // 1. Запрос общей статистики
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  // 2. Запрос истории за 30 дней для графиков
  const detailsQuery = useQuery({
    queryKey: ['dashboard-details'],
    queryFn: () => dashboardService.getDetails(30),
  });

  if (statsQuery.isLoading || detailsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (statsQuery.isError || detailsQuery.isError) {
    return (
      <Alert severity='error'>
        Ошибка загрузки данных аналитики. Проверьте, запущен ли бэкенд.
      </Alert>
    );
  }

  const stats = statsQuery.data!;
  const details = detailsQuery.data!;

  // Подготовка данных для Pie Chart (Распределение ответов)
  const pieData = [
    { name: 'Интерес', value: stats.interest_count },
    { name: 'Отказ', value: stats.decline_count },
    { name: 'FAQ', value: stats.faq_count },
    { name: 'Другое', value: stats.other_count },
  ].filter((item) => item.value > 0);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
          Обзор коммуникаций
        </Typography>
        <Typography color='text.secondary'>
          Мониторинг эффективности outreach-кампаний и работы агента
        </Typography>
      </Box>

      {/* KPI Секция */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Отправлено писем'
            value={stats.total_emails_sent}
            icon={<EmailIcon fontSize='large' />}
            color='#2196f3'
            subtitle='Email & LinkedIn'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Получено ответов'
            value={stats.total_responses}
            icon={<RateReviewIcon fontSize='large' />}
            color='#9c27b0'
            subtitle={`Response Rate: ${stats.response_rate}%`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Лиды (Интерес)'
            value={stats.interest_count}
            icon={<TrendingUpIcon fontSize='large' />}
            color='#00c49f'
            subtitle='Потенциальные партнеры'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title='Эскалации'
            value={stats.escalations}
            icon={<WarningIcon fontSize='large' />}
            color='#ff9800'
            subtitle='Требуют внимания человека'
          />
        </Grid>
      </Grid>

      {/* Графики */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{ p: 3, borderRadius: 3, height: 400 }}
            elevation={0}
            variant='outlined'
          >
            <Typography variant='h6' sx={{ mb: 3 }}>
              Динамика ответов (30 дней)
            </Typography>
            <ResponsiveContainer width='100%' height='90%'>
              <BarChart data={details.daily_stats}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis
                  dataKey='date'
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey='interest'
                  name='Интерес'
                  stackId='a'
                  fill='#00C49F'
                />
                <Bar
                  dataKey='decline'
                  name='Отказ'
                  stackId='a'
                  fill='#FF8042'
                />
                <Bar dataKey='faq' name='Вопросы' stackId='a' fill='#FFBB28' />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{ p: 3, borderRadius: 3, height: 400 }}
            elevation={0}
            variant='outlined'
          >
            <Typography variant='h6' sx={{ mb: 1 }}>
              Структура ответов
            </Typography>
            <Box
              sx={{ height: '85%', display: 'flex', justifyContent: 'center' }}
            >
              {pieData.length > 0 ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign='bottom' height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                  }}
                >
                  Нет данных
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{ p: 3, borderRadius: 3 }}
            elevation={0}
            variant='outlined'
          >
            <Typography variant='h6' sx={{ mb: 2 }}>
              Компании с высоким интересом
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {stats.top_companies.length > 0 ? (
                stats.top_companies.map((company, index) => (
                  <Chip
                    key={index}
                    label={company}
                    color='success'
                    variant='outlined'
                    icon={<TrendingUpIcon />}
                  />
                ))
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  Пока нет компаний с подтвержденным интересом
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
