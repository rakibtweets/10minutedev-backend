"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleStrategy = void 0;
exports.getOrCreateUserFromGoogleProfile = getOrCreateUserFromGoogleProfile;
const passport_google_oauth20_1 = require("passport-google-oauth20");
const AppError_1 = require("../libraries/error-handling/AppError");
const service_1 = require("../domains/user/service");
const configs_1 = __importDefault(require("../configs"));
const utils_1 = require("./utils");
const getGoogleStrategy = () => {
    return new passport_google_oauth20_1.Strategy({
        clientID: configs_1.default.GOOGLE_CLIENT_ID,
        clientSecret: configs_1.default.GOOGLE_CLIENT_SECRET,
        callbackURL: `${configs_1.default.HOST}/api/auth/google/callback`,
        scope: ['profile', 'email'],
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, cb) => {
        try {
            const trimmedPayloadForSession = await getOrCreateUserFromGoogleProfile({
                profile,
                accessToken
            });
            cb(null, trimmedPayloadForSession);
        }
        catch (error) {
            cb(error, null);
        }
    });
};
exports.getGoogleStrategy = getGoogleStrategy;
async function getOrCreateUserFromGoogleProfile({ profile, accessToken }) {
    const isAdmin = configs_1.default.ADMIN_EMAILS.includes(profile.emails[0].value);
    const payload = {
        email: profile.emails[0].value,
        name: profile.displayName,
        authType: 'google',
        role: isAdmin ? 'admin' : 'user',
        google: {
            id: profile.id,
            email: profile.emails[0].value,
            picture: profile.photos[0].value
        },
        isAdmin
    };
    const tokenInfo = (0, utils_1.encryptToken)(accessToken);
    let user = await (0, service_1.getByGoogleId)(profile.id);
    if (user) {
        if (user.isDeactivated) {
            throw new AppError_1.AppError('user-is-deactivated', 'User is deactivated', 401);
        }
        user = Object.assign(user, payload, {
            accessToken: tokenInfo.token,
            accessTokenIV: tokenInfo.iv,
            updatedAt: new Date()
        });
        await (0, service_1.updateById)(user._id.toString(), user);
    }
    else {
        user = await (0, service_1.create)({
            ...payload,
            accessToken: tokenInfo.token,
            accessTokenIV: tokenInfo.iv
        });
    }
    if (!user) {
        throw new AppError_1.AppError('user-not-found', 'User not found', 404);
    }
    const userObj = user.toObject();
    const trimmedPayloadForSession = {
        _id: userObj._id.toString(),
        email: userObj.email,
        authType: userObj.authType,
        isAdmin: userObj.isAdmin,
        isDeactivated: userObj.isDeactivated,
        displayName: userObj.name,
        avatarUrl: userObj.google?.picture,
        accessToken: userObj.accessToken,
        accessTokenIV: userObj.accessTokenIV
    };
    return trimmedPayloadForSession;
}
//# sourceMappingURL=googleStrategy.js.map