import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AppError } from '../libraries/error-handling/AppError';
import { getByGoogleId, create, updateById } from '../domains/user/service';
import config from '../configs';
import { Request } from 'express';
import { encryptToken } from './utils';

interface GoogleProfile {
  id: string;
  emails: { value: string }[];
  displayName: string;
  photos: { value: string }[];
}

interface UserPayload {
  email: string;
  name: string;
  authType: 'google';
  role: 'admin' | 'user';
  google: {
    id: string;
    email: string;
    picture: string;
  };
  isAdmin?: boolean;
}

interface SessionPayload {
  _id: string;
  email: string;
  authType: 'google' | 'github';
  isAdmin?: boolean;
  isDeactivated?: boolean;
  displayName: string;
  avatarUrl: string;
  accessToken: string | null | undefined;
  accessTokenIV: string | null | undefined;
}

export const getGoogleStrategy = () => {
  return new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: `${config.HOST}/api/auth/google/callback`,
      scope: ['profile', 'email'],
      passReqToCallback: true
    },
    async (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile: any,
      cb: (error: any, user?: any) => void
    ) => {
      try {
        const trimmedPayloadForSession = await getOrCreateUserFromGoogleProfile(
          {
            profile,
            accessToken
          }
        );
        cb(null, trimmedPayloadForSession);
      } catch (error) {
        cb(error, null);
      }
    }
  );
};

export async function getOrCreateUserFromGoogleProfile({
  profile,
  accessToken
}: {
  profile: GoogleProfile;
  accessToken: string;
}): Promise<SessionPayload> {
  const isAdmin = config.ADMIN_EMAILS.includes(profile.emails[0].value);
  const payload: UserPayload = {
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

  const tokenInfo = encryptToken(accessToken);

  let user = await getByGoogleId(profile.id);

  if (user) {
    if (user.isDeactivated) {
      throw new AppError('user-is-deactivated', 'User is deactivated', 401);
    }

    user = Object.assign(user, payload, {
      accessToken: tokenInfo.token,
      accessTokenIV: tokenInfo.iv,
      updatedAt: new Date()
    });
    await updateById(user._id.toString(), user);
  } else {
    user = await create({
      ...payload,
      accessToken: tokenInfo.token,
      accessTokenIV: tokenInfo.iv
    });
  }

  if (!user) {
    throw new AppError('user-not-found', 'User not found', 404);
  }
  const userObj = user.toObject();
  const trimmedPayloadForSession: SessionPayload = {
    _id: userObj._id.toString(),
    email: userObj.email,
    authType: userObj.authType,
    isAdmin: userObj.isAdmin,
    isDeactivated: userObj.isDeactivated,
    displayName: userObj.name,
    avatarUrl: userObj.google?.picture as string,
    accessToken: userObj.accessToken,
    accessTokenIV: userObj.accessTokenIV
  };
  return trimmedPayloadForSession;
}
