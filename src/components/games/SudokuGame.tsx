
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';

const DIFFICULTY = {
  EASY: {
    emptyCells: 30,
    points: 100
  },
  MEDIUM: {
    emptyCells: 40,
    points: 200
  },
  HARD: {
    emptyCells: 50,
    points: 300
  }
};

const SudokuGame = () => {
  const { incrementScore } = useGameContext();
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [board, setBoard] = useState<number[][]>(Array(9).fill(0).map(() => Array(9).fill(0)));
  const [solution, setSolution] = useState<number[][]>(Array(9).fill(0).map(() => Array(9).fill(0)));
  const [initialBoard, setInitialBoard] = useState<boolean[][]>(Array(9).fill(false).map(() => Array(9).fill(false)));
  const [difficulty] = useState<keyof typeof DIFFICULTY>('EASY');
  const [isComplete, setIsComplete] = useState(false);

  // Initialize the board on first render
  useEffect(() => {
    generateSudoku();
  }, []);

  // Check if the board is complete after each move
  useEffect(() => {
    if (isBoardComplete() && !isComplete) {
      handleGameComplete();
    }
  }, [board]);

  const generateSudoku = () => {
    // This is a simplified version - a real Sudoku would have a more complex generation algorithm
    const newSolution = createSolvedBoard();
    setSolution(newSolution);
    
    // Create a board with some cells removed based on difficulty
    const newBoard = JSON.parse(JSON.stringify(newSolution));
    const newInitialBoard = Array(9).fill(false).map(() => Array(9).fill(false));
    
    let cellsToRemove = DIFFICULTY[difficulty].emptyCells;
    while (cellsToRemove > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (newBoard[row][col] !== 0) {
        newBoard[row][col] = 0;
        newInitialBoard[row][col] = true;
        cellsToRemove--;
      }
    }
    
    setBoard(newBoard);
    setInitialBoard(newInitialBoard);
    setIsComplete(false);
  };

  // This is a simplified approach to create a valid Sudoku board
  const createSolvedBoard = () => {
    const newBoard = Array(9).fill(0).map(() => Array(9).fill(0));
    
    // A very simplified algorithm to fill the board
    // In a real app, you would want a more sophisticated algorithm
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        newBoard[row][col] = ((row * 3 + Math.floor(row / 3) + col) % 9) + 1;
      }
    }
    
    // Shuffle the board a bit to make it less predictable
    for (let i = 0; i < 20; i++) {
      const row1 = Math.floor(Math.random() * 9);
      const row2 = Math.floor(Math.random() * 9);
      
      if (Math.floor(row1 / 3) === Math.floor(row2 / 3)) {
        // Swap rows within the same block
        [newBoard[row1], newBoard[row2]] = [newBoard[row2], newBoard[row1]];
      }
    }
    
    return newBoard;
  };

  const handleCellClick = (row: number, col: number) => {
    // Can't modify initial cells
    if (!initialBoard[row][col]) {
      return;
    }
    
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    
    const [row, col] = selectedCell;
    const newBoard = [...board];
    newBoard[row][col] = num;
    setBoard(newBoard);
  };

  const isBoardComplete = () => {
    // Check if the board is complete and correct
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== solution[row][col]) {
          return false;
        }
      }
    }
    return true;
  };

  const handleGameComplete = () => {
    setIsComplete(true);
    incrementScore(DIFFICULTY[difficulty].points);
  };

  return (
    <div className="game-card bg-gradient-to-br from-white to-indigo-50 p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-game-purple">Sudoku</h2>
        <p className="text-sm text-gray-500">Fill in the grid with numbers 1-9</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-9 gap-0.5 bg-gray-300 p-0.5 rounded shadow-lg">
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`aspect-square flex items-center justify-center font-semibold text-lg 
                  ${(rowIndex === selectedCell?.[0] && colIndex === selectedCell?.[1]) ? 'bg-blue-200' : 'bg-white'} 
                  ${rowIndex % 3 === 2 && rowIndex < 8 ? 'border-b-2 border-gray-500' : ''}
                  ${colIndex % 3 === 2 && colIndex < 8 ? 'border-r-2 border-gray-500' : ''}
                  ${!initialBoard[rowIndex][colIndex] ? 'bg-gray-100 text-black' : 'cursor-pointer'}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell !== 0 ? cell : ''}
              </div>
            ))
          ))}
        </div>

        {selectedCell && (
          <div className="mt-4 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
              <button
                key={num}
                className="p-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-100"
                onClick={() => handleNumberInput(num === 0 ? 0 : num)}
              >
                {num === 0 ? 'Clear' : num}
              </button>
            ))}
          </div>
        )}

        {isComplete && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg text-center">
            <p className="font-bold">Great job! Sudoku complete!</p>
            <button 
              className="mt-2 bg-game-purple text-white px-4 py-2 rounded hover:bg-game-darkpurple"
              onClick={generateSudoku}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SudokuGame;
