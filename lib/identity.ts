export function getUserId(): string {
  return process.env.NEXT_PUBLIC_USER_ID ?? 'default'
}
