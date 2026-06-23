require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const geocodeRoutes = require('./routes/geocode');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'deshsafe-api' });
});

app.use('/api', geocodeRoutes);

app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    console.error('[API]', err.message);
    res.status(status).json({ error: err.message || 'Internal server error' });
});

async function start() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`DeshSafe API listening on http://localhost:${PORT}`);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});
