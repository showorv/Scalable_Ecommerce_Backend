import User, { IUser } from "../user/User.model"

export const authRepository = {

    async findByEmail(email: string): Promise<IUser | null>{
        return User.findOne({email}).select("+passwordHash +refreshToken")
    },

    async findById(id: string): Promise<IUser | null> {
        return User.findById(id);
      },

      async findByIdWithSensitive(id: string): Promise<IUser | null> {
        return User.findById(id).select("+passwordHash +refreshToken");
      },

      async create(data: {
        name: string;
        email: string;
        passwordHash: string;
      }): Promise<IUser> {
        const user = new User(data);
        return user.save();
      },
      async saveRefreshToken(userId: string, token: string): Promise<void> {
        await User.findByIdAndUpdate(userId, { refreshToken: token });
      },

      async clearRefreshToken(userId: string): Promise<void> {
        await User.findByIdAndUpdate(userId, { refreshToken: null });
      },

      async findByGoogleId(googleId: string): Promise<IUser | null> {
        return User.findOne({ googleId });
      },

      async upsertGoogleUser(data: {
        googleId: string;
        email: string;
        name: string;
        avatar?: string;
      }): Promise<IUser> {
        const user = await User.findOneAndUpdate(
          { $or: [{ googleId: data.googleId }, { email: data.email }] },
          {
            $set: {
              googleId: data.googleId,
              name: data.name,
              avatar: data.avatar,
              isVerified: true, // Google accounts are pre-verified
            },
            $setOnInsert: { email: data.email },
          },
          { upsert: true, new: true, runValidators: false }
        );
        return user!;
      },


}

