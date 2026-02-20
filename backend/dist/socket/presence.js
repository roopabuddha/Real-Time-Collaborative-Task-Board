"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineUsers = void 0;
exports.addUser = addUser;
exports.removeUser = removeUser;
exports.getUsers = getUsers;
exports.onlineUsers = {};
/**
 * Add a user to presence list
 */
function addUser(socketId, user) {
    exports.onlineUsers[socketId] = user;
}
/**
 * Remove user when disconnected
 */
function removeUser(socketId) {
    delete exports.onlineUsers[socketId];
}
/**
 * Get all online users
 */
function getUsers() {
    return Object.values(exports.onlineUsers);
}
