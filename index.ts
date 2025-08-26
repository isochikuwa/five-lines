const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum RawTile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE, FALLING_STONE,
  BOX, FALLING_BOX,
  KEY1, LOCK1,
  KEY2, LOCK2
}

interface Tile {
  isAir(): boolean;
  isLock1(): boolean;
  isLock2(): boolean;
  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
  moveHorizontal(player: Player, dx: number): void;
  moveVertical(player: Player, dy: number): void;
  update(x: number, y: number): void;
  getBlockOnTopState(): FallingState;
}

class Air implements Tile { 
  isAir(): boolean { return true; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }

  draw(_g: CanvasRenderingContext2D, _x: number, _y: number) {}

  moveHorizontal(player: Player, dx: number) {
    player.move(dx, 0);
  }

  moveVertical(player: Player, dy: number) {
    player.move(0, dy);
  }

  update(_x: number, _y: number) {}
  getBlockOnTopState(): FallingState { return new Falling(); }
}

class Flux implements Tile {
  isAir(): boolean { return false; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(player: Player, dx: number) {
    player.move(dx, 0);
  }

  moveVertical(player: Player, dy: number) {
    player.move(0, dy);
  }

  update(_x: number, _y: number) {}
  getBlockOnTopState(): FallingState { return new Resting(); }
}

class Unbreakable implements Tile {
  isAir(): boolean { return false; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(_player: Player, _dx: number) {}
  moveVertical(_player: Player, _dy: number) {}

  update(_x: number, _y: number) {}
  getBlockOnTopState(): FallingState { return new Resting(); }
}

class PlayerTile implements Tile {
  isAir(): boolean { return false; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }

  color(_g: CanvasRenderingContext2D) {}
  draw(_g: CanvasRenderingContext2D, _x: number, _y: number) {}

  moveHorizontal(_player: Player, _dx: number) {}
  moveVertical(_player: Player, _dy: number) {}

  update(_x: number, _y: number) {}
  getBlockOnTopState(): FallingState { return new Resting(); }
}

interface FallingState {
  isFalling(): boolean;
  moveHorizontal(player: Player, dx: number): void;
  drop(tile: Tile, x: number, y: number): void;
}

class Falling implements FallingState {
  isFalling(): boolean { return true; }
  moveHorizontal(_player: Player, _dx: number) {}
  drop(tile: Tile, x: number, y: number) {
    map.drop(tile, x, y);
  }
}

class Resting implements FallingState {
  isFalling(): boolean { return false; }

  moveHorizontal(player: Player, dx: number) {
    player.pushHorizontal(dx);
  }

  drop(_tile: Tile, _x: number, _y: number) {}
}

class FallStrategy {
  constructor(private falling: FallingState) {}

  update(tile: Tile, x: number, y:number) {
    this.falling = map.getBlockOnTopState(x, y + 1);
    this.falling.drop(tile, x, y);
  }

  moveHorizontal(player: Player, dx: number) {
    this.falling.moveHorizontal(player, dx);
  }
}

class Stone implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }

  isAir(): boolean { return false; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(player: Player, dx: number) {
    this.fallStrategy.moveHorizontal(player, dx);
  }

  moveVertical(_player: Player, _dy: number) {}

  update(x: number, y: number) {
    this.fallStrategy.update(this, x, y);
  }

  getBlockOnTopState(): FallingState { return new Resting(); }
}

class Box implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }

  isAir(): boolean { return false; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(player: Player, dx: number) {
    this.fallStrategy.moveHorizontal(player, dx);
  }

  moveVertical(_player: Player, _dy: number) {}

  update(x: number, y: number) {
    this.fallStrategy.update(this, x, y);
  }

  getBlockOnTopState(): FallingState { return new Resting(); }
}

class KeyConfiguration {
  constructor(
    private color: string,
    private _1: boolean,
    private removeStrategy: RemoveStrategy
  ) {}

  is1() { return this._1; }

  setColor(g: CanvasRenderingContext2D) {
    g.fillStyle = this.color;
  }

  removeLock() {
    map.removeLock(this.removeStrategy);
  }
}

class Key implements Tile {
  constructor(private keyConf: KeyConfiguration) {}

  isAir(): boolean { return false; }
  isLock1(): boolean { return false; }
  isLock2(): boolean { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(player: Player, dx: number) {
    this.keyConf.removeLock();
    player.move(dx, 0);
  }

  moveVertical(player: Player, dy: number) {
    this.keyConf.removeLock();
    player.move(0, dy);
  }

  update(_x: number, _y: number) {}

  getBlockOnTopState(): FallingState { return new Resting(); }
}

class CommonLock implements Tile {
  constructor(private keyConf: KeyConfiguration) {}

  isAir(): boolean { return false; }
  isLock1(): boolean { return this.keyConf.is1(); }
  isLock2(): boolean { return !this.keyConf.is1(); }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(_player: Player, _dx: number) {}
  moveVertical(_player: Player, _dy: number) {}
  update(_x: number, _y: number) {}
  getBlockOnTopState(): FallingState { return new Resting(); }
}

interface Input {
  handle(): void;
}

class Right implements Input {
  handle() {
    player.moveHorizontal(1);
  }
}

class Left implements Input {
  handle() {
    player.moveHorizontal(-1);
  }
}

class Up implements Input {
  handle() {
    player.moveVertical(-1);
  }
}

class Down implements Input {
  handle() {
    player.moveVertical(1);
  }
}

interface RemoveStrategy {
  check(tile: Tile): boolean;
}

class RemoveLock1 implements RemoveStrategy {
  check(tile: Tile): boolean {
    return tile.isLock1();
  }
}

class RemoveLock2 implements RemoveStrategy {
  check(tile: Tile): boolean {
    return tile.isLock2();
  }
}

class Player {
  private x = 1;
  private y = 1;

  draw(g: CanvasRenderingContext2D) {
    g.fillStyle = "#ff0000";
    g.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  move(dx: number, dy: number) {
    this.moveToTile(this.x + dx, this.y + dy);
  }

  moveHorizontal(dx: number) {
    map.moveHorizontal(this, this.x, this.y, dx);
  }

  moveVertical(dy: number) {
    map.moveVertical(this, this.x, this.y, dy);
  }

  moveToTile(newx: number, newy: number) {
    map.movePlayer(this.x, this.y, newx, newy);
    this.x = newx;
    this.y = newy;
  }

  pushHorizontal(dx: number) {
    map.pushHorizontal(this, this.x, this.y, dx);
  }
}

class Map {
  private map: Tile[][];

  constructor() {
    this.map = new Array(rawMap.length);
    for (let y = 0; y < rawMap.length; y++) {
      this.map[y] = new Array(rawMap[y].length);
      for (let x = 0; x < rawMap[y].length; x++) {
        this.map[y][x] = transformTile(rawMap[y][x]);
      }
    }
  }

  drop(tile: Tile, x: number, y: number) {
    this.map[y + 1][x] = tile;
    this.map[y][x] = new Air();
  }

  getBlockOnTopState(x: number, y: number): FallingState {
    return this.map[y][x].getBlockOnTopState();
  }

  removeLock(removeStrategy: RemoveStrategy) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (removeStrategy.check(this.map[y][x])) {
          this.map[y][x] = new Air();
        }
      }
    }
  }

  moveHorizontal(player: Player, x: number, y: number, dx: number) {
    this.map[y][x + dx].moveHorizontal(player, dx);
  }

  moveVertical(player: Player, x: number, y: number, dy: number) {
    this.map[y + dy][x].moveVertical(player, dy);
  }

  movePlayer(x: number, y: number, newx: number, newy: number) {
    this.map[y][x] = new Air();
    this.map[newy][newx] = new PlayerTile();
  }

  pushHorizontal(player: Player, x: number, y: number, dx: number) {
    if (this.map[y][x + dx + dx].isAir() && !this.map[y + 1][x + dx].isAir()) {
      this.map[y][x + dx + dx] = this.map[y][x + dx];
      player.moveToTile(x + dx, y);
    }
  }

  update() {
    for (let y = this.map.length - 1; y >= 0; y--) {
      for (let x = 0; x < this.map[y].length; x++) {
        this.map[y][x].update(x, y);
      }
    }
  }

  draw(g: CanvasRenderingContext2D) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        this.map[y][x].draw(g, x, y);
      }
    }
  }
}

let player = new Player();

let rawMap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];
const YELLOW_KEY = new KeyConfiguration("#ffcc00", true, new RemoveLock1());
const CYAN_KEY = new KeyConfiguration("#00ccff", false, new RemoveLock2());

// let map: Tile[][];
let map = new Map();
function assertExhausted(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function transformTile(tile: RawTile) {
  switch (tile) {
    case RawTile.AIR: return new Air();
    case RawTile.FLUX: return new Flux();
    case RawTile.UNBREAKABLE: return new Unbreakable();
    case RawTile.PLAYER: return new PlayerTile();
    case RawTile.STONE: return new Stone(new Resting());
    case RawTile.FALLING_STONE: return new Stone(new Falling());
    case RawTile.BOX: return new Box(new Resting());
    case RawTile.FALLING_BOX: return new Box(new Falling());
    case RawTile.KEY1: return new Key(YELLOW_KEY);
    case RawTile.LOCK1: return new CommonLock(YELLOW_KEY);
    case RawTile.KEY2: return new Key(CYAN_KEY);
    case RawTile.LOCK2: return new CommonLock(CYAN_KEY);
    default: assertExhausted(tile);
  }
}

let inputs: Input[] = [];

function update() {
  handleInputs();
  map.update();
}

function handleInputs() {
  while (inputs.length > 0) {
    let input = inputs.pop();
    input.handle();
  }
}

function draw() {
  let g = createGraphics();
  map.draw(g);
  player.draw(g);
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");

  g.clearRect(0, 0, canvas.width, canvas.height);

  return g;
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
  gameLoop();
}

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", e => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});
