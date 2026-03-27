import React, { useRef, useEffect } from 'react';

const COLS = 10;
const ROWS = 20;
const CELL = 24;

const NEON_COLORS = [
  'hsl(185, 100%, 55%)',  // cyan
  'hsl(330, 100%, 55%)',  // magenta
  'hsl(50, 100%, 55%)',   // yellow
  'hsl(185, 100%, 40%)',  // darker cyan
  'hsl(330, 100%, 40%)',  // darker magenta
];

const SHAPES = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,0],[1,0],[1,1]],
  [[0,1],[0,1],[1,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]],
];

interface Block {
  x: number;
  y: number;
  shape: number[][];
  color: string;
}

const HeroMiniGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = COLS * CELL;
    const height = ROWS * CELL;
    canvas.width = width;
    canvas.height = height;

    const grid: (string | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    let block: Block = spawnBlock();
    let lastDrop = 0;
    const DROP_INTERVAL = 800;
    let animId: number;

    function spawnBlock(): Block {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
      return { x: Math.floor((COLS - shape[0].length) / 2), y: -shape.length, shape, color };
    }

    function collides(b: Block, dx: number, dy: number): boolean {
      for (let r = 0; r < b.shape.length; r++) {
        for (let c = 0; c < b.shape[r].length; c++) {
          if (!b.shape[r][c]) continue;
          const nx = b.x + c + dx;
          const ny = b.y + r + dy;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
          if (ny >= 0 && grid[ny][nx]) return true;
        }
      }
      return false;
    }

    function lock(b: Block) {
      for (let r = 0; r < b.shape.length; r++) {
        for (let c = 0; c < b.shape[r].length; c++) {
          if (!b.shape[r][c]) continue;
          const ny = b.y + r;
          const nx = b.x + c;
          if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
            grid[ny][nx] = b.color;
          }
        }
      }
      // Clear full rows
      for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r].every(c => c !== null)) {
          grid.splice(r, 1);
          grid.unshift(Array(COLS).fill(null));
          r++;
        }
      }
    }

    function draw(time: number) {
      if (time - lastDrop > DROP_INTERVAL) {
        lastDrop = time;
        if (!collides(block, 0, 1)) {
          block.y++;
        } else {
          lock(block);
          block = spawnBlock();
          // If new block spawns in collision, clear bottom half of grid
          if (collides(block, 0, 0)) {
            for (let r = Math.floor(ROWS / 2); r < ROWS; r++) {
              grid[r].fill(null);
            }
          }
        }
      }

      ctx.clearRect(0, 0, width, height);

      // Draw locked cells
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c]) {
            ctx.fillStyle = grid[r][c]!;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
            ctx.globalAlpha = 1;
          }
        }
      }

      // Draw falling block
      for (let r = 0; r < block.shape.length; r++) {
        for (let c = 0; c < block.shape[r].length; c++) {
          if (!block.shape[r][c]) continue;
          const px = (block.x + c) * CELL;
          const py = (block.y + r) * CELL;
          if (py >= 0) {
            ctx.fillStyle = block.color;
            ctx.globalAlpha = 0.4;
            ctx.shadowColor = block.color;
            ctx.shadowBlur = 8;
            ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 mx-auto opacity-20 pointer-events-none"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default HeroMiniGame;
