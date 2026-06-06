import { supabase } from '@/shared/lib/supabase';
import { normalizeGeorgianPhoneNumber } from '../utils/georgian-phone-number';

type RegisterInput = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export async function registerWithEmail({
  email,
  firstName,
  lastName,
  password,
  phoneNumber,
}: RegisterInput) {
  const displayName = `${firstName} ${lastName}`.trim();
  const normalizedPhoneNumber = normalizeGeorgianPhoneNumber(phoneNumber);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        phone_number: normalizedPhoneNumber,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        location: 'Georgia',
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function loginWithEmail({ email, password }: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
