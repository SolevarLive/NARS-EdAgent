import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Tooltip,
  TablePagination,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Person as HumanIcon,
  SmartToy as BotIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { classifyService } from '../../services/api';
import { ReplyOut } from '../../shared/types';
import { getIntentColor } from '../../shared/const';

export default function AnswersLogs() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Запрос логов с пагинацией
  const {
    data: logs,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['system-logs', page, rowsPerPage],
    queryFn: () => classifyService.getLogs(page * rowsPerPage, rowsPerPage),
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
            Логи системы
          </Typography>
          <Typography color='text.secondary'>
            История принятых решений и классификаций (FR-4.3)
          </Typography>
        </Box>
        <Button
          variant='outlined'
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
        >
          Обновить
        </Button>
      </Box>

      <Paper
        sx={{ width: '100%', mb: 2, borderRadius: 3, overflow: 'hidden' }}
        elevation={0}
        variant='outlined'
      >
        {isLoading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity='error' sx={{ m: 2 }}>
            Ошибка загрузки логов. Проверьте соединение с бэкендом.
          </Alert>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Компания</TableCell>
                    <TableCell>Входящий текст (Фрагмент)</TableCell>
                    <TableCell>Распознанный Интент</TableCell>
                    <TableCell>Уверенность (AI Confidence)</TableCell>
                    <TableCell align='center'>Обработка</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs?.map((log: ReplyOut, index: number) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {log.company}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Tooltip title={log.reply_text}>
                          <Typography variant='body2' noWrap>
                            {log.reply_text}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.predicted_intent}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          color={getIntentColor(log.predicted_intent) as any}
                          size='small'
                          variant='outlined'
                          icon={<BrainIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <LinearProgress
                            variant='determinate'
                            value={log.confidence * 100}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                            color={log.confidence > 0.8 ? 'success' : 'warning'}
                          />
                          <Typography variant='caption' fontWeight='bold'>
                            {(log.confidence * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        {log.human_involved ? (
                          <Tooltip title='Эскалировано на человека'>
                            <Chip
                              icon={<HumanIcon />}
                              label='Human'
                              color='warning'
                              size='small'
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title='Автоматический ответ'>
                            <Chip
                              icon={<BotIcon />}
                              label='Auto'
                              size='small'
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align='center' sx={{ py: 3 }}>
                        <Typography color='text.secondary'>
                          Нет записей в журнале
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Пагинация (Визуальная, т.к. бэкенд возвращает просто список) */}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component='div'
              count={-1} // API не возвращает total count, ставим -1 или скрываем
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage='Строк на странице:'
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
