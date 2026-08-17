import { profileMock } from '../mocks/profile.mock';

import type {
  Profile,
  UpdateProfileInput,
  UpdateProfileResponse,
} from '../model/profile.types';

export async function getProfile(): Promise<Profile> {
  return profileMock;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UpdateProfileResponse> {
  profileMock.name = input.name;
  profileMock.email = input.email;
  profileMock.telegram = input.telegram;

  return {
    success: true,
    data: profileMock,
  };
}