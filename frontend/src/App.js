import React, { useState, Suspense, lazy } from 'react';
import { 
    Container, 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Paper,
    CircularProgress,
    Alert,
    ThemeProvider,
    createTheme,
    CssBaseline,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Chip,
    LinearProgress,
    Fade,
    Slide,
    Autocomplete,
    Skeleton,
    IconButton,
    Tooltip
} from '@mui/material';
import { 
    Security as SecurityIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    Lock as LockIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import CryptoJS from 'crypto-js';
import axios from 'axios';

// Lazy load components for code splitting
const Confetti = lazy(() => import('react-confetti'));

// Zengin renk paleti ve modern font kombinasyonları
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#5c6bc0',
            light: '#7986cb',
            dark: '#3949ab',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ffd54f',
            light: '#fff176',
            dark: '#f9a825',
            contrastText: '#ffffffff',
        },
        success: {
            main: '#66bb6a',
            light: '#81c784',
            dark: '#4caf50',
        },
        warning: {
            main: '#ffb74d',
            light: '#ffcc80',
            dark: '#ff9800',
        },
        error: {
            main: '#ef5350',
            light: '#e57373',
            dark: '#d32f2f',
        },
        background: {
            default: '#0a0a0a',
            paper: 'rgba(45, 45, 45, 0.8)',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b3b3b3',
        },
    },
    typography: {
        fontFamily: '"Inter", "Poppins", "Segoe UI", system-ui, -apple-system, sans-serif',
        h1: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            fontSize: '3.5rem',
            background: 'linear-gradient(135deg, #5c6bc0, #ffd54f)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        h2: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
        },
        h3: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
        },
        h4: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500,
        },
        h5: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500,
        },
        h6: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500,
        },
        body1: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 400,
        },
        body2: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 400,
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    background: 'rgba(45, 45, 45, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(45, 45, 45, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '12px 24px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(92, 107, 192, 0.4)',
                    },
                },
            },
        },
    },
});

// E-posta önerileri için popüler domainler
const emailSuggestions = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'protonmail.com',
    'tutanota.com',
    'yandex.com',
    'mail.ru',
    'zoho.com'
];

function App() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [shakeError, setShakeError] = useState(false);
    const [emailSuggestionsOpen, setEmailSuggestionsOpen] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setLoadingProgress(0);
        setShowConfetti(false);
        setShakeError(false);
        
        try {
            // Progress simulation
            const progressInterval = setInterval(() => {
                setLoadingProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + Math.random() * 15;
                });
            }, 200);

            // Hash the password using SHA-256
            const passwordHash = CryptoJS.SHA256(formData.password).toString();
            
            const response = await axios.post('http://localhost:3001/api/check-breach', {
                email: formData.email,
                username: formData.username,
                passwordHash
            });
            
            setLoadingProgress(100);
            setResults(response.data.results);
            
            // Success effect
            setTimeout(() => {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
            }, 500);
            
        } catch (error) {
            setError('Veri ihlalleri kontrol edilirken hata oluştu. Lütfen daha sonra tekrar deneyin.');
            setShakeError(true);
            setTimeout(() => setShakeError(false), 1000);
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setLoadingProgress(0);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            
            {/* Confetti Effect */}
            {showConfetti && (
                <Suspense fallback={null}>
                    <Confetti
                        width={window.innerWidth}
                        height={window.innerHeight}
                        recycle={false}
                        numberOfPieces={200}
                    />
                </Suspense>
            )}

            {/* Hero Banner */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
                    minHeight: '100vh',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 20% 80%, rgba(92, 107, 192, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 213, 79, 0.1) 0%, transparent 50%)',
                        pointerEvents: 'none',
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <Fade in timeout={1000}>
                        <Box sx={{ pt: 8, pb: 4, textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <img 
                                    src="/security-icon.svg" 
                                    alt="Security Icon" 
                                    style={{ width: '80px', height: '80px' }}
                                />
                            </Box>
                            <Typography variant="h1" component="h1" gutterBottom>
                                Watch My Back
                            </Typography>
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
                                Verilerinizin ele geçirilip geçirilmediğini kontrol edin. 
                                Güvenliğinizi sağlayın, gizliliğinizi koruyun.
                            </Typography>
                        </Box>
                    </Fade>

                    {/* Main Form */}
                    <Slide direction="up" in timeout={1500}>
                        <Paper elevation={0} sx={{ p: 6, mb: 6 }}>
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ position: 'relative' }}>
                                            <EmailIcon sx={{ position: 'absolute', left: 12, top: 16, color: 'text.secondary', zIndex: 1 }} />
                                            <Autocomplete
                                                freeSolo
                                                options={emailSuggestions}
                                                value={formData.email}
                                                onInputChange={(event, newValue) => {
                                                    setFormData({ ...formData, email: newValue });
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="E-posta Adresi"
                                                        name="email"
                                                        type="email"
                                                        fullWidth
                                                        sx={{ 
                                                            '& .MuiOutlinedInput-root': { 
                                                                pl: 5,
                                                                borderRadius: '12px',
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: 'primary.main',
                                                                },
                                                            }
                                                        }}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ position: 'relative' }}>
                                            <PersonIcon sx={{ position: 'absolute', left: 12, top: 16, color: 'text.secondary', zIndex: 1 }} />
                                            <TextField
                                                fullWidth
                                                label="Kullanıcı Adı"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                sx={{ 
                                                    '& .MuiOutlinedInput-root': { 
                                                        pl: 5,
                                                        borderRadius: '12px',
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ position: 'relative' }}>
                                            <LockIcon sx={{ position: 'absolute', left: 12, top: 16, color: 'text.secondary', zIndex: 1 }} />
                                            <TextField
                                                fullWidth
                                                label="Şifre"
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                helperText="Şifre gönderilmeden önce SHA-256 ile hash'lenir"
                                                sx={{ 
                                                    '& .MuiOutlinedInput-root': { 
                                                        pl: 5,
                                                        borderRadius: '12px',
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            type="submit"
                                            disabled={loading}
                                            size="large"
                                            startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
                                            sx={{ 
                                                py: 2,
                                                fontSize: '1.1rem',
                                                background: 'linear-gradient(135deg, #5c6bc0, #3949ab)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #3949ab, #5c6bc0)',
                                                }
                                            }}
                                        >
                                            {loading ? 'Kontrol Ediliyor...' : 'Veri İhlallerini Kontrol Et'}
                                        </Button>
                                    </Grid>
                                </Grid>

                                {/* Progress Bar */}
                                {loading && (
                                    <Box sx={{ mt: 3 }}>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={loadingProgress}
                                            sx={{ 
                                                height: 8, 
                                                borderRadius: 4,
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    background: 'linear-gradient(90deg, #5c6bc0, #ffd54f)',
                                                }
                                            }}
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                                            Veri kaynakları taranıyor... {Math.round(loadingProgress)}%
                                        </Typography>
                                    </Box>
                                )}
                            </form>
                        </Paper>
                    </Slide>

                    {/* Error Alert */}
                    {error && (
                        <Slide direction="down" in timeout={500}>
                            <Box sx={{ mb: 4 }}>
                                <Alert 
                                    severity="error" 
                                    sx={{ 
                                        borderRadius: '12px',
                                        animation: shakeError ? 'shake 0.5s ease-in-out' : 'none',
                                        '@keyframes shake': {
                                            '0%, 100%': { transform: 'translateX(0)' },
                                            '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                                            '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                                        }
                                    }}
                                >
                                    <ErrorIcon sx={{ mr: 1 }} />
                                    {error}
                                </Alert>
                            </Box>
                        </Slide>
                    )}

                    {/* Results */}
                    {results && (
                        <Slide direction="up" in timeout={1000}>
                            <Paper elevation={0} sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h4" component="h2">
                                        Tarama Sonuçları
                                    </Typography>
                                </Box>
                                
                                <Grid container spacing={3}>
                                    {results.map((result, index) => (
                                        <Grid item xs={12} md={6} key={index}>
                                            <Card 
                                                sx={{ 
                                                    height: '100%',
                                                    animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
                                                }}
                                            >
                                                <CardHeader
                                                    title={
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                            {result.source}
                                                        </Box>
                                                    }
                                                    action={
                                                        <Chip 
                                                            label={result.breaches.length > 0 ? `${result.breaches.length} İhlal` : 'Güvenli'}
                                                            color={result.breaches.length > 0 ? 'error' : 'success'}
                                                            variant="outlined"
                                                        />
                                                    }
                                                />
                                                <CardContent>
                                                    {result.breaches.length > 0 ? (
                                                        <Box>
                                                            {result.breaches.map((breach, i) => (
                                                                <Card key={i} sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 1)' }}>
                                                                    <CardContent sx={{ py: 2 }}>
                                                                        <Typography variant="h6" color="error.main" gutterBottom>
                                                                            {breach.Name || breach.title}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                            <strong>Tarih:</strong> {breach.BreachDate || breach.date}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            <strong>Ele Geçirilen Veriler:</strong> {breach.DataClasses?.join(', ') || breach.data_types}
                                                                        </Typography>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        <Alert severity="success" sx={{ borderRadius: '12px' }}>
                                                            <CheckIcon sx={{ mr: 1 }} />
                                            {result.source} kaynağında hiçbir ihlal bulunamadı
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Slide>
    )}

    {/* Loading Skeleton */}
    {loading && !results && (
        <Box sx={{ mt: 4 }}>
            {[...Array(3)].map((_, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                            <Skeleton variant="text" width="60%" height={32} />
                        </Box>
                        <Skeleton variant="text" width="100%" height={24} />
                        <Skeleton variant="text" width="80%" height={24} />
                        <Skeleton variant="text" width="60%" height={24} />
                    </CardContent>
                </Card>
            ))}
        </Box>
    )}
</Container>
</Box>
</ThemeProvider>
);
}

export default App;