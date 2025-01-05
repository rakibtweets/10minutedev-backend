"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopWebServer = exports.startWebServer = exports.createExpressApp = void 0;
const configs_1 = __importDefault(require("./configs"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const passport_1 = __importDefault(require("passport"));
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./libraries/log/logger"));
const request_context_1 = require("./middlewares/request-context");
const db_1 = require("./libraries/db");
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./auth");
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const error_handling_1 = require("./libraries/error-handling");
let connection;
const handleAuthCallback = (strategy) => {
    return [
        function (req, res, next) {
            passport_1.default.authenticate(strategy, {
                failureRedirect: `${configs_1.default.CLIENT_HOST}/sign-in`
            }, (err, user) => {
                if (err || !user) {
                    console.log('Failed to authenticate user', err);
                    logger_1.default.error('Failed to authenticate user', err);
                    return res.redirect(`${configs_1.default.CLIENT_HOST}/sign-in?error=${err?.message}`);
                }
                req.logIn(user, function (err) {
                    if (err) {
                        console.log('Failed to log in', err);
                        return res.redirect(`${configs_1.default.CLIENT_HOST}/sign-in?error=failed-to-authenticate`);
                    }
                    // @ts-ignore
                    req.session.userId = user._id;
                    req.session.sessionId = req.sessionID;
                    req.session.save((err) => {
                        if (err) {
                            logger_1.default.error('Failed to save session', err);
                        }
                        else {
                            logger_1.default.info('Session saved');
                        }
                    });
                    next();
                });
            })(req, res, next);
        },
        function (req, res) {
            if (strategy === 'github') {
                logger_1.default.info('/api/auth/github/callback', {
                    //@ts-ignore
                    username: req?.user?.username
                });
            }
            //@ts-ignore
            // const userId = req?.user?._id.toString();
            const userCookieValue = JSON.stringify({
                userId: req.user?._id.toString(),
                isAdmin: req.user?.isAdmin
            });
            res.cookie('user', userCookieValue, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax'
            });
            res.redirect(`${configs_1.default.CLIENT_HOST}/login-success`);
        }
    ];
};
const createExpressApp = () => {
    const expressApp = (0, express_1.default)();
    // Use middlewares
    expressApp.use(request_context_1.addRequestIdMiddleware);
    expressApp.use((0, helmet_1.default)());
    expressApp.use(express_1.default.urlencoded({ extended: true }));
    expressApp.use(express_1.default.json({ limit: '5mb' }));
    expressApp.use(body_parser_1.default.json());
    expressApp.use((0, cors_1.default)({
        origin: configs_1.default.CLIENT_HOST, // Your frontend origin
        credentials: true
    }));
    // passport js
    passport_1.default.use((0, auth_1.getGithubStrategy)());
    passport_1.default.use((0, auth_1.getGoogleStrategy)());
    const sessionStore = connect_mongo_1.default.create({ mongoUrl: configs_1.default.MONGODB_URI });
    // Session middleware
    expressApp.use((0, express_session_1.default)({
        secret: configs_1.default.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: sessionStore
    }));
    expressApp.use(passport_1.default.initialize());
    expressApp.use(passport_1.default.session());
    passport_1.default.serializeUser(function (user, done) {
        done(null, user);
    });
    passport_1.default.deserializeUser(function (user, done) {
        done(null, user);
    });
    // Middleware to log an info message for each incoming request
    expressApp.use((req, res, next) => {
        logger_1.default.info(`${req.method} ${req.originalUrl}`);
        next();
    });
    logger_1.default.info('Express middlewares are set up');
    // Authentication Routes
    // Github authentication
    expressApp.get('/api/auth/github', passport_1.default.authenticate('github'));
    // Add Google auth routes
    expressApp.get('/api/auth/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
    // Replace the GitHub callback route with:
    expressApp.get('/api/auth/github/callback', ...handleAuthCallback('github'));
    // Replace the Google callback route with:
    expressApp.get('/api/auth/google/callback', ...handleAuthCallback('google'));
    // get current logged in user data from req.user object
    expressApp.get('/api/user', (req, res) => {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }
        const user = req.user;
        console.log('expressApp.get  user:', user);
        res.json(user);
    });
    // Logout route
    expressApp.get('/api/logout', async (req, res, next) => {
        const email = req.user?.email;
        const userId = req.user?._id;
        req.logout(async function (err) {
            // Passport.js logout function
            if (err) {
                logger_1.default.error('Failed to log out user', err);
                return next(err);
            }
            req.session.destroy(function (err) {
                // Handle potential errors during session destruction
                if (err) {
                    logger_1.default.error('Failed to destroy session', err);
                }
                else {
                    logger_1.default.info('Session destroyed');
                }
            });
            res.cookie('user', '', {
                expires: new Date(0), // Set expiry date to a time in the past
                httpOnly: true,
                secure: true, // Use secure in production (HTTPS)
                sameSite: 'lax' // Adjust depending on deployment
            });
            if (userId)
                await (0, auth_1.clearAuthInfo)(userId);
            logger_1.default.info('User logged out', { email });
            res.redirect(`${configs_1.default.CLIENT_HOST}/sign-in`);
        });
    });
    // Define routes
    (0, app_1.default)(expressApp);
    // Error handling middleware
    defineErrorHandlingMiddleware(expressApp);
    return expressApp;
};
exports.createExpressApp = createExpressApp;
const startWebServer = async () => {
    logger_1.default.info('Starting web server...');
    // Create Express application
    const expressApp = createExpressApp();
    // Open connection (assuming openConnection returns an object with address and port)
    const APIAddress = await openConnection(expressApp);
    // Log server info
    logger_1.default.info(`Server is running on ${APIAddress.address}:${APIAddress.port}`);
    // Connect to MongoDB
    await (0, db_1.connectWithMongoDb)();
    return expressApp;
};
exports.startWebServer = startWebServer;
const stopWebServer = async () => {
    return new Promise((resolve) => {
        if (connection !== undefined) {
            connection.close(() => {
                resolve();
            });
        }
    });
};
exports.stopWebServer = stopWebServer;
const openConnection = async (expressApp) => {
    return new Promise((resolve) => {
        const webServerPort = configs_1.default.PORT;
        logger_1.default.info(`Server is about to listen to port ${webServerPort}`);
        connection = expressApp.listen(webServerPort, () => {
            //@ts-ignore
            error_handling_1.errorHandler.listenToErrorEvents(connection);
            const addressInfo = connection.address();
            if (typeof addressInfo === 'string') {
                resolve({ address: addressInfo, port: webServerPort });
            }
            else if (addressInfo && 'port' in addressInfo) {
                resolve({ address: addressInfo.address, port: addressInfo.port });
            }
            else {
                resolve({ address: null, port: webServerPort });
            }
        });
    });
};
const defineErrorHandlingMiddleware = (expressApp) => {
    expressApp.use(async (error, req, res, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next) => {
        // Ensure next is included for Express error handlers
        if (error && typeof error === 'object') {
            if (error && error.isTrusted === undefined) {
                error.isTrusted = true;
            }
        }
        const resErr = (0, error_handling_1.errorHandlerMiddleware)(error);
        // Handle error and send response
        // const appError = errorHandler.handleError(error);
        // console.log('defineErrorHandlingMiddleware  appError:', appError);
        // logger.info('Error occurred:', appError);
        // // @ts-ignore
        // const response = { ...appError, errorMessage: appError.message };
        // console.log('error response', response);
        res
            .status(resErr?.HTTPStatus || 500)
            .json(
        // @ts-ignore
        resErr)
            .end();
    });
};
