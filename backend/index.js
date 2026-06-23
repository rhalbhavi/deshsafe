require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./db');

// Routes
const geocodeRoutes = require('./routes/geocode');
const reportRoutes  = require('./routes/reports');
const alertRoutes   = require('./routes/alerts');
const userRoutes    = require('./routes/users');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'deshsafe-api', timestamp: new Date() });
});

app.use('/api', geocodeRoutes);          // /api/geocode, /api/reverse-geocode
app.use('/api/reports', reportRoutes);   // /api/reports
app.use('/api/alerts', alertRoutes);     // /api/alerts
app.use('/api/users', userRoutes);       // /api/users

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    console.error('[API Error]', err.message);
    res.status(status).json({ error: err.message || 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`DeshSafe API listening on http://localhost:${PORT}`);
        console.log(`  GET  /api/health`);
        console.log(`  GET  /api/reports`);
        console.log(`  POST /api/reports       (auth required)`);
        console.log(`  GET  /api/alerts`);
        console.log(`  POST /api/alerts        (admin only)`);
        console.log(`  GET  /api/users/me      (auth required)`);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});
