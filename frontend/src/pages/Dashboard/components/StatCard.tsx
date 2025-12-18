import { Paper, Box, Typography, Avatar } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box>
        <Typography
          variant='subtitle2'
          color='text.secondary'
          sx={{ fontWeight: 600 }}
        >
          {title}
        </Typography>
        <Typography variant='h4' sx={{ mt: 1, fontWeight: 700 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ mt: 0.5, display: 'block' }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      <Avatar
        sx={{
          bgcolor: `${color}15`,
          color: color,
          width: 56,
          height: 56,
        }}
      >
        {icon}
      </Avatar>
    </Paper>
  );
}
