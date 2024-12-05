import config from '../configs';
import { Strategy as GitHubStrategy, StrategyOptions } from 'passport-github2';
import { create, getByGitHubId, updateById } from '../domains/user/service';
import { AppError } from '../libraries/error-handling/AppError';
import { encryptToken } from './utils';

const getGithubStrategy = () => {
  return new GitHubStrategy(
    {
      clientID: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_CLIENT_SECRET,
      callbackURL: `${config.HOST}/api/auth/github/callback`
    } as StrategyOptions,
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      cb: (error: any, user?: any) => void
    ) => {
      try {
        const trimmedPayloadForSession = await getOrCreateUserFromGitHubProfile(
          {
            profile,
            accessToken
          }
        );
        cb(null, trimmedPayloadForSession); // Pass the user object to the session
      } catch (error) {
        cb(error, null);
      }
    }
  );
};

const getOrCreateUserFromGitHubProfile = async ({
  profile,
  accessToken
}: {
  profile: any;
  accessToken: string;
}) => {
  // console.log({ profile, accessToken });
  const payload = {
    name: profile.displayName,
    email: profile._json.email,
    authType: 'github',
    github: {
      id: profile.id,
      avatarUrl: profile?._json.avatar_url
    }
  };

  const tokenInfo = encryptToken(accessToken);
  console.log('tokenInfo:', tokenInfo);

  // Update query to use github.id instead of githubId
  let user = await getByGitHubId(profile.id);
  //Token information
  if (user) {
    if (user.isDeactivated) {
      throw new AppError('user-is-deactivated', 'User is deactivated', 401);
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
    await updateById(user._id.toString(), user);
  } else {
    // Create a new user
    user = await create({
      ...payload,
      github: {
        ...payload.github
      },
      accessToken: tokenInfo.token,
      accessTokenIV: tokenInfo.iv
    });
  }

  if (!user) {
    throw new AppError('user-not-found', 'User not found', 404);
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

export { getGithubStrategy, getOrCreateUserFromGitHubProfile };
