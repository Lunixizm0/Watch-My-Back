import React, { useState } from 'react';
import { 
    Container, 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import CryptoJS from 'crypto-js';
import axios from 'axios';

function App() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

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
        
        try {
            // Hash the password using SHA-256
            const passwordHash = CryptoJS.SHA256(formData.password).toString();
            
            const response = await axios.post('http://localhost:3001/api/check-breach', {
                email: formData.email,
                username: formData.username,
                passwordHash
            });
            
            setResults(response.data.results);
        } catch (error) {
            setError('Error checking for data breaches. Please try again later.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    Watch My Back
                </Typography>
                <Typography variant="h6" gutterBottom align="center" color="text.secondary">
                    Check if your data has been compromised
                </Typography>

                <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            helperText="Password is hashed before sending"
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Check for Breaches'}
                        </Button>
                    </form>
                </Paper>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {results && (
                    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Results
                        </Typography>
                        {results.map((result, index) => (
                            <Box key={index} sx={{ mb: 3 }}>
                                <Typography variant="h6" color="primary">
                                    {result.source}
                                </Typography>
                                {result.breaches.length > 0 ? (
                                    result.breaches.map((breach, i) => (
                                        <Box key={i} sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1">
                                                Breach Name: {breach.Name || breach.title}
                                            </Typography>
                                            <Typography variant="body2">
                                                Date: {breach.BreachDate || breach.date}
                                            </Typography>
                                            <Typography variant="body2">
                                                Exposed Data: {breach.DataClasses?.join(', ') || breach.data_types}
                                            </Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Alert severity="success" sx={{ mt: 1 }}>
                                        No breaches found in {result.source}
                                    </Alert>
                                )}
                            </Box>
                        ))}
                    </Paper>
                )}
            </Box>
        </Container>
    );
}

export default App;