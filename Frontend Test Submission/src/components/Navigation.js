import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import LinkIcon from '@mui/icons-material/Link';
import BarChartIcon from '@mui/icons-material/BarChart';

function Navigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={currentPath} aria-label="navigation tabs">
        <Tab
          icon={<LinkIcon />}
          label="URL Shortener"
          value="/"
          component={RouterLink}
          to="/"
        />
        <Tab
          icon={<BarChartIcon />}
          label="Statistics"
          value="/statistics"
          component={RouterLink}
          to="/statistics"
        />
      </Tabs>
    </Box>
  );
}

export default Navigation;
