"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderingService = void 0;
class OrderingService {
    static firstPosition() {
        return 1000;
    }
    static before(firstOrder) {
        return firstOrder / 2;
    }
    static after(lastOrder) {
        return lastOrder + 1000;
    }
    static between(prev, next) {
        if (prev === undefined && next === undefined)
            return this.firstPosition();
        if (prev === undefined)
            return this.before(next);
        if (next === undefined)
            return this.after(prev);
        return (prev + next) / 2;
    }
}
exports.OrderingService = OrderingService;
