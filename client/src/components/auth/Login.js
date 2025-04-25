import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  Grid,
  CircularProgress,
  Divider
} from '@mui/material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, user, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Kullanıcı zaten giriş yapmışsa, rolüne göre yönlendir
    if (isAuthenticated && user) {
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user]);

  // Rol bazlı yönlendirme
  const redirectBasedOnRole = (role) => {
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'provider') {
      navigate('/provider/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const { email, password } = formData;

  const onChange = e => {
    setLocalError(''); // Kullanıcı form alanını değiştirdiğinde hata mesajını temizle
    clearError(); // Context'teki hata mesajını da temizle
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loginWithDemoAccount = async (role) => {
    setLocalError('');
    clearError();
    setIsSubmitting(true);
    
    try {
      let demoEmail = "";
      let demoPassword = "admin123";
      
      if (role === 'admin') {
        demoEmail = "admin@arabamon.com";
      } else if (role === 'user') {
        demoEmail = "user@arabamon.com";
        demoPassword = "user123";
      } else if (role === 'provider') {
        demoEmail = "provider@arabamon.com";
        demoPassword = "provider123";
      }
      
      console.log(`Demo giriş: ${demoEmail} / ${demoPassword}`);
      await login(demoEmail, demoPassword);
      // login fonksiyonu başarılı olursa, useEffect zaten yönlendirme yapacak
    } catch (err) {
      console.error('Demo giriş hatası:', err);
      setLocalError(err.response?.data?.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLocalError('');
    clearError();
    
    if (!email || !password) {
      setLocalError('Lütfen tüm alanları doldurun');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`Giriş yapılıyor: ${email}`);
      await login(email, password);
      // Giriş başarılı ise useEffect ile yönlendirme yapılacak
    } catch (err) {
      console.error('Giriş hatası:', err);
      setLocalError(err.response?.data?.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Giriş Yap
        </Typography>
        
        {(error || localError) && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error || localError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={onChange}
            disabled={isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Şifre"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={onChange}
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Giriş Yap'}
          </Button>
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Divider>
              <Typography variant="body2" color="textSecondary">
                Veya Demo Hesaplarla Hızlı Giriş
              </Typography>
            </Divider>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => loginWithDemoAccount('admin')}
                disabled={isSubmitting}
              >
                Admin
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={() => loginWithDemoAccount('user')}
                disabled={isSubmitting}
              >
                Kullanıcı
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                color="info"
                onClick={() => loginWithDemoAccount('provider')}
                disabled={isSubmitting}
              >
                Sağlayıcı
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" align="center">
              Hesabınız yok mu? <a href="/register">Kayıt Ol</a>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 