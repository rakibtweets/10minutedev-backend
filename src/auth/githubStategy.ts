import config from '../configs';
import {
  Strategy as GitHubStrategy,
  StrategyOptions,
  Profile
} from 'passport-github2';

const getGithubStrategy = () => {
  // code here
  return new GitHubStrategy(
    {
      clientID: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_CLIENT_SECRET,
      callbackURL: `${config.HOST}/api/auth/github/callback`
    } as StrategyOptions,
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      cb: (error: any, user?: any) => void
    ) => {
      try {
        console.log('GitHub profile:', profile);
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
  profile: Profile;
  accessToken: string;
}) => {
  console.log({ profile, accessToken });
  // !Todo: If user exists, update the user's access token
  // !Todo: If user does not exist, create a new user
};

export { getGithubStrategy, getOrCreateUserFromGitHubProfile };
