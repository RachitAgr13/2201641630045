import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import URLShortener from './components/URLShortener';
import URLStatistics from './components/URLStatistics';
import Navigation from './components/Navigation';

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <LinkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<URLShortener />} />
          <Route path="/statistics" element={<URLStatistics />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
