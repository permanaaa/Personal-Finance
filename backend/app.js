const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet  = require("helmet");
const compression = require("compression");
const connectDB = require("./libs/mongoose");
const logRequest = require('./middlewares/logger');
const http = require("http");
const IndexRoutes = require('./routes/indexRoutes');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
const { init } = require('./libs/socketIo')
const { notificationWorker } =require('./jobs/notificationWorker')
const client = require('prom-client');

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code'],
    registers: [register],
});

const corsOptions = {
    origin: ['http://localhost:3000','http://192.168.1.146:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API for personal finance application',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

init(server);
app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(logRequest);
app.use(cookieParser());
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        httpRequestTotal.inc({
            method: req.method,
            route: req.originalUrl,
            code: res.statusCode,
        });
    });

    next();
});

app.use('/auth', IndexRoutes.AuthRoutes);
app.use('/allocation', IndexRoutes.AllocationRoutes);
app.use('/dashboard', IndexRoutes.DashboardRoutes);
app.use('/transaction', IndexRoutes.TransactionRoutes);
app.use('/reminder', IndexRoutes.ReminderRoutes);
app.use('/notification', IndexRoutes.NotificationRoutes);

app.get('/', (req, res) => {
    res.send({status: true, message: "Welcome to Personal Finance API."});
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

server.listen(port, '0.0.0.0',() => {
   console.log(`Server running on port ${port}`);
    connectDB();
   notificationWorker();
});

