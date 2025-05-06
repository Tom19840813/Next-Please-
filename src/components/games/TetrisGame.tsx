
import React, { useState, useEffect, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';

// Simplified Tetris with a smaller grid for mobile
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 15;
const BLOCK_SIZE = 20;

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: '#0EA5E9' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#2563EB' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#F97316' },
  O: { shape: [[1, 1], [1, 1]], color: '#FACC15' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#10B981' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#8B5CF6' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#EF4444' }
};

const TetrisGame: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<any>(null);
  const [nextPiece, setNextPiece] = useState<any>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  // Initialize a random piece
  const randomPiece = useCallback(() => {
    const pieces = Object.keys(TETROMINOS);
    const tetromino = pieces[Math.floor(Math.random() * pieces.length)];
    return {
      type: tetromino,
      shape: TETROMINOS[tetromino as keyof typeof TETROMINOS].shape,
      color: TETROMINOS[tetromino as keyof typeof TETROMINOS].color
    };
  }, []);

  // Start a new game
  const startGame = useCallback(() => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setCurrentPiece(randomPiece());
    setNextPiece(randomPiece());
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    setGameOver(false);
    setGameStarted(true);
    setScore(0);
  }, [randomPiece]);

  // Move the piece down every second
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      moveDown();
    }, 500);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, position, currentPiece]);

  // Check if the movement is valid
  const isValidMove = (newX: number, newY: number, piece: any) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;

          // Check boundaries
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return false;
          }

          // Check collision with existing pieces
          if (boardY >= 0 && board[boardY][boardX]) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Place the current piece on the board
  const placePiece = () => {
    if (!currentPiece) return;
    
    const newBoard = [...board];
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          
          if (boardY < 0) {
            setGameOver(true);
            return;
          }
          
          newBoard[boardY][boardX] = currentPiece.color;
        }
      }
    }
    
    // Check for complete rows
    const completedRows = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (newBoard[y].every(cell => cell !== null)) {
        completedRows.push(y);
      }
    }
    
    // Remove completed rows and add empty rows at the top
    if (completedRows.length > 0) {
      const newScore = score + (completedRows.length * 100);
      setScore(newScore);
      incrementScore(completedRows.length * 10);
      
      for (const row of completedRows) {
        newBoard.splice(row, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(null));
      }
    }
    
    setBoard(newBoard);
    setCurrentPiece(nextPiece);
    setNextPiece(randomPiece());
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
  };

  // Movement functions
  const moveDown = () => {
    if (isValidMove(position.x, position.y + 1, currentPiece)) {
      setPosition(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      placePiece();
    }
  };

  const moveLeft = () => {
    if (isValidMove(position.x - 1, position.y, currentPiece)) {
      setPosition(prev => ({ ...prev, x: prev.x - 1 }));
    }
  };

  const moveRight = () => {
    if (isValidMove(position.x + 1, position.y, currentPiece)) {
      setPosition(prev => ({ ...prev, x: prev.x + 1 }));
    }
  };

  const rotatePiece = () => {
    if (!currentPiece) return;

    // Create rotated shape matrix
    const rotatedShape = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map(row => row[index]).reverse()
    );
    
    const rotatedPiece = {
      ...currentPiece,
      shape: rotatedShape
    };
    
    if (isValidMove(position.x, position.y, rotatedPiece)) {
      setCurrentPiece(rotatedPiece);
    }
  };

  // Render the game board
  const renderBoard = () => {
    // Create a copy of the board to add the current piece
    const displayBoard = JSON.parse(JSON.stringify(board));
    
    // Add the current piece to the display board
    if (currentPiece && !gameOver) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return (
      <div className="mx-auto border-2 border-gray-300 bg-white" style={{ width: BOARD_WIDTH * BLOCK_SIZE, height: BOARD_HEIGHT * BLOCK_SIZE }}>
        {displayBoard.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div 
                key={`${y}-${x}`} 
                style={{
                  width: BLOCK_SIZE,
                  height: BLOCK_SIZE,
                  backgroundColor: cell || '#f9fafb',
                  borderRight: '1px solid #e5e7eb',
                  borderBottom: '1px solid #e5e7eb'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Render the next piece preview
  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    const shape = nextPiece.shape;
    const color = nextPiece.color;
    
    return (
      <div className="bg-white p-2 rounded border border-gray-300">
        <div className="mb-1 text-xs text-center text-gray-500">Next</div>
        <div className="grid gap-0.5" style={{ gridTemplateRows: `repeat(${shape.length}, ${BLOCK_SIZE - 5}px)` }}>
          {shape.map((row, y) => (
            <div key={y} className="flex gap-0.5">
              {row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  style={{
                    width: BLOCK_SIZE - 5,
                    height: BLOCK_SIZE - 5,
                    backgroundColor: cell ? color : 'transparent'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="game-card bg-gradient-to-br from-white to-blue-50 p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-game-blue">Tetris</h2>
        <p className="text-sm text-gray-500">Score: {score}</p>
      </div>
      
      <div className="flex justify-center">
        <div className="flex flex-col items-center">
          {gameStarted && !gameOver ? (
            <>
              <div className="flex justify-between w-full mb-2">
                {renderNextPiece()}
                <div className="ml-2">
                  <p className="text-sm">Score</p>
                  <p className="text-xl font-bold">{score}</p>
                </div>
              </div>
              {renderBoard()}
              
              <div className="mt-4 grid grid-cols-3 gap-2 w-full">
                <button 
                  className="p-3 bg-gray-200 rounded-full flex justify-center items-center"
                  onClick={moveLeft}
                >
                  ←
                </button>
                <button 
                  className="p-3 bg-gray-200 rounded-full flex justify-center items-center"
                  onClick={moveDown}
                >
                  ↓
                </button>
                <button 
                  className="p-3 bg-gray-200 rounded-full flex justify-center items-center"
                  onClick={moveRight}
                >
                  →
                </button>
                <button 
                  className="p-3 bg-gray-200 rounded-full flex justify-center items-center col-span-3"
                  onClick={rotatePiece}
                >
                  Rotate
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              {gameOver && <p className="text-xl text-red-500 mb-4">Game Over!</p>}
              <p className="mb-4 text-lg">
                {!gameStarted ? "Stack blocks and clear rows" : `Final Score: ${score}`}
              </p>
              <button 
                className="bg-game-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                onClick={startGame}
              >
                {!gameStarted ? "Start Game" : "Play Again"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;
