import { decryptToken, encryptToken } from './utils';

import {
  getGithubStrategy,
  getOrCreateUserFromGitHubProfile
} from './githubStategy';
import {
  getGoogleStrategy,
  getOrCreateUserFromGoogleProfile
} from './googleStrategy';

// clear the accessToken value from database after logout
const clearAuthInfo = async (userId: string) => {
  return `Clearing auth info for user: ${userId}`;
};

// export the functions
export {
  clearAuthInfo,
  decryptToken,
  encryptToken,
  getGithubStrategy,
  getOrCreateUserFromGitHubProfile,
  getGoogleStrategy,
  getOrCreateUserFromGoogleProfile
};