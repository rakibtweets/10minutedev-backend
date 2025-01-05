"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateUserFromGitHubProfile = exports.getGithubStrategy = void 0;
const configs_1 = __importDefault(require("../configs"));
const passport_github2_1 = require("passport-github2");
const service_1 = require("../domains/user/service");
const AppError_1 = require("../libraries/error-handling/AppError");
const utils_1 = require("./utils");
const getGithubStrategy = () => {
    return new passport_github2_1.Strategy({
        clientID: configs_1.default.GITHUB_CLIENT_ID,
        clientSecret: configs_1.default.GITHUB_CLIENT_SECRET,
        callbackURL: `${configs_1.default.HOST}/api/auth/github/callback`
    }, async (accessToken, refreshToken, profile, cb) => {
        try {
            const trimmedPayloadForSession = await getOrCreateUserFromGitHubProfile({
                profile,
                accessToken
            });
            cb(null, trimmedPayloadForSession); // Pass the user object to the session
        }
        catch (error) {
            cb(error, null);
        }
    });
};
exports.getGithubStrategy = getGithubStrategy;
const getOrCreateUserFromGitHubProfile = async ({ profile, accessToken }) => {
    const isAdmin = configs_1.default.ADMIN_EMAILS.includes(profile?._json.email);
    const payload = {
        name: profile.displayName,
        email: profile._json.email,
        authType: 'github',
        role: isAdmin ? 'admin' : 'user',
        github: {
            id: profile.id,
            avatarUrl: profile?._json.avatar_url
        },
        isAdmin
    };
    const tokenInfo = (0, utils_1.encryptToken)(accessToken);
    // Update query to use github.id instead of githubId
    let user = await (0, service_1.getByGitHubId)(profile.id);
    //Token information
    if (user) {
        if (user.isDeactivated) {
            throw new AppError_1.AppError('user-is-deactivated', 'User is deactivated', 401);
        }
        // Note: Using spread to maintain other fields while updating github subdocument
        user = Object.assign(user, payload, {
            github: {
                ...payload.github
            },
            accessToken: tokenInfo.token,
            accessTokenIV: tokenInfo.iv,
            updatedAt: new Date()
        });
        await (0, service_1.updateById)(user._id.toString(), user);
    }
    else {
        // Create a new user
        user = await (0, service_1.create)({
            ...payload,
            github: {
                ...payload.github
            },
            accessToken: tokenInfo.token,
            accessTokenIV: tokenInfo.iv
        });
    }
    if (!user) {
        throw new AppError_1.AppError('user-not-found', 'User not found', 404);
    }
    const userObj = user.toObject();
    const trimmedPayloadForSession = {
        _id: userObj._id,
        email: userObj.email,
        authType: userObj.authType,
        isAdmin: userObj.isAdmin,
        isDeactivated: userObj.isDeactivated,
        // UI info
        displayName: userObj.name,
        avatarUrl: userObj.github?.avatarUrl,
        accessToken: userObj.accessToken,
        accessTokenIV: userObj.accessTokenIV
    };
    return trimmedPayloadForSession;
};
exports.getOrCreateUserFromGitHubProfile = getOrCreateUserFromGitHubProfile;
