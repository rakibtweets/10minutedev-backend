"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateUserFromGoogleProfile = exports.getGoogleStrategy = exports.getOrCreateUserFromGitHubProfile = exports.getGithubStrategy = exports.encryptToken = exports.decryptToken = exports.clearAuthInfo = void 0;
const utils_1 = require("./utils");
Object.defineProperty(exports, "decryptToken", { enumerable: true, get: function () { return utils_1.decryptToken; } });
Object.defineProperty(exports, "encryptToken", { enumerable: true, get: function () { return utils_1.encryptToken; } });
const githubStategy_1 = require("./githubStategy");
Object.defineProperty(exports, "getGithubStrategy", { enumerable: true, get: function () { return githubStategy_1.getGithubStrategy; } });
Object.defineProperty(exports, "getOrCreateUserFromGitHubProfile", { enumerable: true, get: function () { return githubStategy_1.getOrCreateUserFromGitHubProfile; } });
const googleStrategy_1 = require("./googleStrategy");
Object.defineProperty(exports, "getGoogleStrategy", { enumerable: true, get: function () { return googleStrategy_1.getGoogleStrategy; } });
Object.defineProperty(exports, "getOrCreateUserFromGoogleProfile", { enumerable: true, get: function () { return googleStrategy_1.getOrCreateUserFromGoogleProfile; } });
const service_1 = require("../domains/user/service");
// clear the accessToken value from database after logout
const clearAuthInfo = async (userId) => {
    return await (0, service_1.updateById)(userId, {
        accessToken: null,
        accessTokenIV: null,
        updatedAt: new Date()
    });
};
exports.clearAuthInfo = clearAuthInfo;
