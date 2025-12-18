import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  MarkEmailRead as ReadIcon,
  MarkEmailUnread as UnreadIcon,
  Schedule as PendingIcon,
  AlarmAdd as FollowupIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { outreachService } from '../../services/api';

// Данные из файла top_20_companies_for_review.xlsx
const POTENTIAL_LEADS = [
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

export default function Outreach() {
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();

  // 1. Получение статусов активных рассылок
  const {
    data: outreachLogs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['outreach-status'],
    queryFn: outreachService.getStatus,
    // Опрашиваем бэкенд каждые 5 секунд, чтобы видеть обновления в реальном времени
    refetchInterval: 5000,
  });

  // 2. Мутация для отправки первого письма
  const sendMutation = useMutation({
    mutationFn: (data: { company: string; email: string }) =>
      outreachService.sendEmail(data.company, data.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach-status'] });
      // Можно добавить "toast" уведомление, но пока хватит рефреша
    },
  });

  // 3. Мутация для фоллоу-апа (заглушка на будущее, если API поддерживает)
  // В текущем API метод send_followup тоже есть
  const followupMutation = useMutation({
    mutationFn: (data: { company: string; email: string }) =>
      // Используем тот же сервис, но подразумеваем логику фоллоу-апа
      // В твоем API есть /followup/send, добавим его поддержку в api.ts если нет
      outreachService.sendEmail(data.company, data.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach-status'] });
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 700 }}>
            Управление рассылками
          </Typography>
          <Typography color='text.secondary'>
            Автоматизация Outreach (FR-4.1) и трекинг статусов (FR-4.2)
          </Typography>
        </Box>
        <Button
          variant='outlined'
          startIcon={<RefreshIcon />}
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ['outreach-status'] })
          }
        >
          Обновить данные
        </Button>
      </Box>

      <Paper
        sx={{ width: '100%', mb: 2, borderRadius: 3 }}
        elevation={0}
        variant='outlined'
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor='primary'
          textColor='primary'
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label='База Лидов (Холодные)' />
          <Tab label='Активные рассылки (В работе)' />
        </Tabs>

        {/* Вкладка 0: Холодные лиды */}
        {tabValue === 0 && (
          <TableContainer sx={{ p: 2 }}>
            <Alert severity='info' sx={{ mb: 2 }}>
              Выберите компании для старта кампании. Агент сгенерирует
              персонализированное письмо и отправит его.
            </Alert>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Компания</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Стек технологий</TableCell>
                  <TableCell align='right'>Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {POTENTIAL_LEADS.map((company) => {
                  // Проверяем, не отправляли ли уже письмо (простое сравнение имен)
                  const isSent = outreachLogs?.some(
                    (log) => log.company === company.name
                  );

                  return (
                    <TableRow key={company.name} hover>
                      <TableCell
                        component='th'
                        scope='row'
                        sx={{ fontWeight: 'bold' }}
                      >
                        {company.name}
                      </TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={company.stack}
                          size='small'
                          variant='outlined'
                        />
                      </TableCell>
                      <TableCell align='right'>
                        {isSent ? (
                          <Chip
                            icon={<SuccessIcon />}
                            label='Уже в работе'
                            color='success'
                            size='small'
                          />
                        ) : (
                          <Button
                            variant='contained'
                            size='small'
                            startIcon={<SendIcon />}
                            onClick={() =>
                              sendMutation.mutate({
                                company: company.name,
                                email: company.email,
                              })
                            }
                            disabled={sendMutation.isPending}
                          >
                            Написать
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Вкладка 1: Статусы */}
        {tabValue === 1 && (
          <TableContainer sx={{ p: 2 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Alert severity='error'>
                Не удалось загрузить статусы рассылок
              </Alert>
            ) : outreachLogs && outreachLogs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                Нет активных рассылок. Перейдите во вкладку "База Лидов" и
                запустите кампанию.
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Компания</TableCell>
                    <TableCell>Статус доставки</TableCell>
                    <TableCell>Открыто?</TableCell>
                    <TableCell>Следующий шаг</TableCell>
                    <TableCell align='right'>Управление</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outreachLogs?.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {log.company}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            log.status === 'sent' ? 'Отправлено' : log.status
                          }
                          color={log.status === 'sent' ? 'primary' : 'default'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        {/* Симуляция статуса открытия (берем из бэкенда) */}
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {log.opened ? (
                            <Tooltip
                              title={`Открыто: ${log.opened_at || 'Недавно'}`}
                            >
                              <ReadIcon color='secondary' />
                            </Tooltip>
                          ) : (
                            <Tooltip title='Еще не прочитано'>
                              <UnreadIcon color='disabled' />
                            </Tooltip>
                          )}
                          <Typography variant='body2'>
                            {log.opened ? 'Прочитано' : 'Не прочитано'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <PendingIcon fontSize='small' color='action' />
                          <Typography variant='caption'>
                            Фоллоу-ап:{' '}
                            {log.followup_scheduled
                              ? new Date(
                                  log.followup_scheduled
                                ).toLocaleDateString()
                              : 'Не запланирован'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='right'>
                        <Tooltip title='Отправить фоллоу-ап принудительно'>
                          <IconButton
                            color='warning'
                            onClick={() =>
                              followupMutation.mutate({
                                company: log.company,
                                email: log.email,
                              })
                            }
                          >
                            <FollowupIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
