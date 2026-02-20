"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineUsers = void 0;
exports.addUser = addUser;
exports.removeUser = removeUser;
exports.getUsers = getUsers;
exports.onlineUsers = {};
function addUser(socketId, user) {
    exports.onlineUsers[socketId] = user;
}
function removeUser(socketId) {
    delete exports.onlineUsers[socketId];
}
function getUsers() {
    return Object.values(exports.onlineUsers);
}
