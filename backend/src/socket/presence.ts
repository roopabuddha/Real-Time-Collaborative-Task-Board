type UserMap = Record<string, { userId: string; name?: string }>;
export const onlineUsers: UserMap = {};

export function addUser(socketId: string, user: { userId: string; name?: string }) {
  onlineUsers[socketId] = user;
}

export function removeUser(socketId: string) {
  delete onlineUsers[socketId];
}

export function getUsers() {
  return Object.values(onlineUsers);
}
