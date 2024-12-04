import { decryptToken, encryptToken } from './utils';

import {
  getGithubStrategy,
  getOrCreateUserFromGitHubProfile
} from './githubStategy';
import {
  getGoogleStrategy,
  getOrCreateUserFromGoogleProfile
} from './googleStrategy';
import { updateById } from '../domains/user/service';

// clear the accessToken value from database after logout
const clearAuthInfo = async (userId: string) => {
  return await updateById(userId, {
    accessToken: null,
    accessTokenIV: null,
    updatedAt: new Date()
  });
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
