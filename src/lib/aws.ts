import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";

const region = import.meta.env.VITE_AWS_REGION?.trim();
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID?.trim();
const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID?.trim();
const apiUrl = import.meta.env.VITE_PICK_API_URL?.trim().replace(/\/$/, "");

export const awsConfigured = Boolean(region && userPoolId && userPoolClientId && apiUrl);

if (awsConfigured) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: userPoolId!,
        userPoolClientId: userPoolClientId!,
      },
    },
  });
}

export type Picks = Record<number, string>;

async function authToken() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("Your sign-in has expired. Please sign in again.");
  }

  return token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!awsConfigured || !apiUrl) {
    throw new Error("AWS pick sync has not been configured yet.");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await authToken()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(data.message || "Pick sync failed. Please try again.");
  }

  return data;
}

export async function loadPicks() {
  const data = await request<{ picks: Array<{ week: number; teamCode: string }> }>("/picks");

  return Object.fromEntries(data.picks.map((pick) => [pick.week, pick.teamCode])) as Picks;
}

export async function savePick(week: number, teamCode: string) {
  return request<{ week: number; teamCode: string }>(`/picks/${week}`, {
    method: "PUT",
    body: JSON.stringify({ teamCode }),
  });
}

export async function removePick(week: number) {
  return request<{ removed: boolean }>(`/picks/${week}`, {
    method: "DELETE",
  });
}
