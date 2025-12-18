import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Code as CodeIcon,
  Business as BusinessIcon,
  Timer as TimeIcon,
  CheckCircle as SkillIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '../../services/api';
import { ProjectCatalogItem } from '../../shared/types';

export default function Projects() {
  const {
    data: projects,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['project-catalog'],
    queryFn: projectService.getCatalog,
  });

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (isError)
    return <Alert severity='error'>Ошибка загрузки каталога проектов</Alert>;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 700 }}>
          Каталог студенческих проектов
        </Typography>
        <Typography color='text.secondary'>
          Сгенерированные ТЗ на основе соглашений с партнерами (Фаза 5)
        </Typography>
      </Box>

      {projects && projects.length === 0 ? (
        <Alert severity='info' variant='outlined' sx={{ mt: 2 }}>
          Каталог пуст. Чтобы проекты появились здесь, необходимо успешно
          завершить переговоры (Simulate -{'>'} Interest) и сгенерировать
          соглашение.
          <br />
          (Либо бэкендер должен запустить генерацию проектов в базе).
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {projects?.map((project: ProjectCatalogItem) => (
            <Grid key={project.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: '0.3s',
                  '&:hover': { boxShadow: 6 },
                }}
                variant='outlined'
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack
                    direction='row'
                    spacing={2}
                    alignItems='center'
                    sx={{ mb: 2 }}
                  >
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <BusinessIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant='h6'
                        sx={{ fontWeight: 'bold', lineHeight: 1.2 }}
                      >
                        {project.title}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        от {project.company}
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    icon={<TimeIcon />}
                    label={`${project.duration_weeks} недель`}
                    size='small'
                    sx={{ mb: 2, mr: 1 }}
                  />

                  <Typography
                    variant='body2'
                    color='text.secondary'
                    paragraph
                    sx={{ mb: 3 }}
                  >
                    {project.description.length > 150
                      ? `${project.description.substring(0, 150)}...`
                      : project.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant='subtitle2' gutterBottom>
                    Роли в команде:
                  </Typography>
                  <Stack direction='row' flexWrap='wrap' gap={1}>
                    {project.roles.map((role, idx) => (
                      <Chip
                        key={idx}
                        label={role.role}
                        color='secondary'
                        variant='outlined'
                        size='small'
                      />
                    ))}
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant='subtitle2' gutterBottom>
                      Стек технологий:
                    </Typography>
                    <Stack direction='row' flexWrap='wrap' gap={0.5}>
                      {project.competencies.map((comp, idx) => (
                        <Chip
                          key={idx}
                          label={comp}
                          size='small'
                          icon={
                            <CodeIcon sx={{ fontSize: '14px !important' }} />
                          }
                          sx={{ bgcolor: '#f5f5f5' }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size='small'
                    variant='contained'
                    fullWidth
                    startIcon={<SkillIcon />}
                  >
                    Подать заявку
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
