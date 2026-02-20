export class OrderingService {
  static firstPosition(): number {
    return 1000;
  }

  static before(firstOrder: number): number {
    return firstOrder / 2;
  }

  static after(lastOrder: number): number {
    return lastOrder + 1000;
  }

  static between(prev?: number, next?: number): number {
    if (prev === undefined && next === undefined) return this.firstPosition();
    if (prev === undefined) return this.before(next!);
    if (next === undefined) return this.after(prev);
    return (prev + next) / 2;
  }
}
