import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import axios from 'axios';

function URLStatistics() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchURLs();
  }, []);

  const fetchURLs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/urls');
      
      if (response.data.success) {
        setUrls(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusChip = (url) => {
    if (url.isExpired) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  const getTotalClicks = () => {
    return urls.reduce((total, url) => total + url.totalClicks, 0);
  };

  const getActiveUrls = () => {
    return urls.filter(url => !url.isExpired).length;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Shortener Statistics
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Analytics and insights for all shortened URLs with detailed click tracking and geographical data.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} className="stats-card">
            <CardContent>
              <Box display="flex" alignItems="center">
                <LinkIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary" className="stats-number">
                    {urls.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total URLs Created
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3} className="stats-card">
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="success.main" className="stats-number">
                    {getTotalClicks()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Clicks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3} className="stats-card">
            <CardContent>
              <Box display="flex" alignItems="center">
                <TimeIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="info.main" className="stats-number">
                    {getActiveUrls()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active URLs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {urls.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No URLs have been created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create your first shortened URL to see statistics here
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3} className="stats-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Short URL</strong></TableCell>
                <TableCell><strong>Original URL</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell><strong>Expires</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Clicks</strong></TableCell>
                <TableCell><strong>Recent Locations</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {url.shortCode}
                      </Typography>
                      <Tooltip title="Copy short URL">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(`http://localhost:3001/${url.shortCode}`)}
                          sx={{ ml: 1 }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={url.originalUrl}
                    >
                      {url.originalUrl}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(url.createdAt)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(url.expiryDate)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusChip(url)}
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={url.totalClicks} 
                      color={url.totalClicks > 0 ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      {url.clickHistory && url.clickHistory.length > 0 ? (
                        <Box>
                          {url.clickHistory.slice(-3).map((click, index) => (
                            <Chip
                              key={index}
                              label={click.location}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                          {url.clickHistory.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{url.clickHistory.length - 3} more
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No clicks yet
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Tooltip title="Open original URL">
                        <IconButton
                          size="small"
                          onClick={() => window.open(url.originalUrl, '_blank')}
                          color="primary"
                        >
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {!url.isExpired && (
                        <Tooltip title="Visit short URL">
                          <IconButton
                            size="small"
                            onClick={() => window.open(`http://localhost:3001/${url.shortCode}`, '_blank')}
                            color="secondary"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default URLStatistics;
