import { supabase } from "@/integrations/supabase/client";

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard/settings` : undefined,
  });
  if (error) throw error;
}

export async function updateEmail(email: string) {
  const { data, error } = await supabase.auth.updateUser({ email });
  if (error) throw error;
  return data.user;
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data.user;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getMfaFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  return data;
}

export async function enrollMfaFactor() {
  const friendlyName = `Authenticator ${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}`;
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName });
  if (error) throw error;
  return data;
}

export async function verifyMfaEnrollment(factorId: string, code: string) {
  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) throw challenge.error;
  const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code });
  if (error) throw error;
  return data;
}

export async function unenrollMfaFactor(factorId: string) {
  const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw error;
  return data;
}

export async function createMfaChallenge(factorId: string) {
  const { data, error } = await supabase.auth.mfa.challenge({ factorId });
  if (error) throw error;
  return data;
}

export async function verifyMfaChallenge(factorId: string, challengeId: string, code: string) {
  const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
  if (error) throw error;
  return data;
}