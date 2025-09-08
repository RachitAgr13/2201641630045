import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import axios from 'axios';

function URLShortener() {
  const [formData, setFormData] = useState({
    originalUrl: '',
    customShortcode: '',
    validityPeriod: 30
  });
  const [shortenedUrl, setShortenedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const validityOptions = [
    { value: 5, label: '5 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 1440, label: '24 hours' }
  ];

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    // Client-side validation
    if (!formData.originalUrl.trim()) {
      setError('Please enter a URL to shorten');
      setLoading(false);
      return;
    }

    if (!validateUrl(formData.originalUrl)) {
      setError('Please enter a valid URL (must start with http:// or https://)');
      setLoading(false);
      return;
    }

    if (formData.customShortcode && !/^[a-zA-Z0-9_-]+$/.test(formData.customShortcode)) {
      setError('Custom shortcode can only contain letters, numbers, hyphens, and underscores');
      setLoading(false);
      return;
    }

    if (formData.customShortcode && (formData.customShortcode.length < 3 || formData.customShortcode.length > 20)) {
      setError('Custom shortcode must be between 3 and 20 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/shorten', formData);
      
      if (response.data.success) {
        setShortenedUrl(response.data.data);
        setFormData({
          originalUrl: '',
          customShortcode: '',
          validityPeriod: 30
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create short URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({ open: true, message: 'Copied to clipboard!' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to copy to clipboard' });
    }
  };

  const formatExpiryDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Shortener
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Create short links with custom codes and expiry management. Maximum 5 concurrent URLs allowed.
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Original URL"
                placeholder="https://example.com/very-long-url"
                value={formData.originalUrl}
                onChange={handleInputChange('originalUrl')}
                error={!!error && error.includes('URL')}
                helperText="Enter the URL you want to shorten"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Custom Shortcode (Optional)"
                placeholder="my-custom-code"
                value={formData.customShortcode}
                onChange={handleInputChange('customShortcode')}
                helperText="3-20 characters: letters, numbers, hyphens, underscores"
                error={!!error && error.includes('shortcode')}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Validity Period</InputLabel>
                <Select
                  value={formData.validityPeriod}
                  onChange={handleInputChange('validityPeriod')}
                  label="Validity Period"
                >
                  {validityOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Creating Short URL...' : 'Shorten URL'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {shortenedUrl && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              URL Successfully Shortened!
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Short URL:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  value={shortenedUrl.shortUrl}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                  size="small"
                />
                <IconButton
                  onClick={() => copyToClipboard(shortenedUrl.shortUrl)}
                  color="primary"
                  title="Copy to clipboard"
                >
                  <CopyIcon />
                </IconButton>
                <IconButton
                  onClick={() => window.open(shortenedUrl.shortUrl, '_blank')}
                  color="primary"
                  title="Open in new tab"
                >
                  <LaunchIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Original URL:
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {shortenedUrl.originalUrl}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<TimeIcon />}
                label={`Expires: ${formatExpiryDate(shortenedUrl.expiryDate)}`}
                color="warning"
                variant="outlined"
              />
              <Chip
                label={`Valid for: ${shortenedUrl.validityPeriod} minutes`}
                color="info"
                variant="outlined"
              />
              <Chip
                label={`Code: ${shortenedUrl.shortCode}`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  );
}

export default URLShortener;
