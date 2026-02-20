"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictResolver = void 0;
class ConflictResolver {
    static mergeEdit(existing, incoming) {
        return {
            title: incoming.title ?? existing.title,
            description: incoming.description ?? existing.description,
        };
    }
    static resolveMoveWinner(existing, incomingVersion, incomingTime) {
        if (incomingVersion < existing.version)
            return false;
        if (incomingVersion === existing.version) {
            return incomingTime.getTime() > existing.updatedAt.getTime();
        }
        return true;
    }
}
exports.ConflictResolver = ConflictResolver;
