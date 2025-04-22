import { IUser } from "../../../user-ms/src/models/User";

const formatUserData = (user: IUser) => {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    bio: user.bio,
    profileImage: user.profileImage,
    currentRole: user.currentRole,
    status: user.status,
    createdAt: user.createdAt,
  };
};

export { formatUserData };
