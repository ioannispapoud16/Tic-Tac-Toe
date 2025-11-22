// Gameboard Module (IIFE)
const Gameboard = (() => {
    let board = Array(9).fill('');

    const getBoard = () => board;

    const markCell = (index, marker) => {
        if (board[index] === '') {
            board[index] = marker;
            return true;
        }
        return false;
    };

    const resetBoard = () => {
        board = Array(9).fill('');
    };

    const checkWinner = () => {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        for (const combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return {
                    winner: board[a],
                    winningCombo: combo
                };
            }
        }

        // Check for tie
        if (board.every(cell => cell !== '')) {
            return { winner: 'tie' };
        }

        return null;
    };

    return {
        getBoard,
        markCell,
        resetBoard,
        checkWinner
    };
})();

// Player Factory
const Player = (name, marker) => {
    return { name, marker };
};

// Game Controller (IIFE)
const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameOver = false;

    const startGame = (player1Name, player2Name) => {
        players = [
            Player(player1Name || 'Player 1', 'X'),
            Player(player2Name || 'Player 2', 'O')
        ];
        currentPlayerIndex = 0;
        gameOver = false;
        Gameboard.resetBoard();
    };

    const getCurrentPlayer = () => players[currentPlayerIndex];

    const playTurn = (cellIndex) => {
        if (gameOver) return false;

        const currentPlayer = getCurrentPlayer();
        const marked = Gameboard.markCell(cellIndex, currentPlayer.marker);

        if (marked) {
            const result = Gameboard.checkWinner();
            
            if (result) {
                gameOver = true;
                return {
                    type: 'gameOver',
                    winner: result.winner,
                    winningCombo: result.winningCombo
                };
            }

            // Switch to next player
            currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
            return {
                type: 'continue',
                nextPlayer: getCurrentPlayer()
            };
        }

        return false;
    };

    const isGameOver = () => gameOver;

    const resetGame = () => {
        gameOver = false;
        currentPlayerIndex = 0;
        Gameboard.resetBoard();
    };

    return {
        startGame,
        playTurn,
        getCurrentPlayer,
        isGameOver,
        resetGame
    };
})();

// Display Controller (IIFE)
const DisplayController = (() => {
    const gameSetup = document.querySelector('.game-setup');
    const gameDisplay = document.querySelector('.game-display');
    const player1Input = document.getElementById('player1');
    const player2Input = document.getElementById('player2');
    const startButton = document.getElementById('start-game');
    const restartButton = document.getElementById('restart-game');
    const currentPlayerName = document.getElementById('current-player-name');
    const gameStatus = document.getElementById('game-status');
    const cells = document.querySelectorAll('.cell');

    const initializeEventListeners = () => {
        startButton.addEventListener('click', startGame);
        restartButton.addEventListener('click', restartGame);
        
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
    };

    const startGame = () => {
        const player1Name = player1Input.value.trim();
        const player2Name = player2Input.value.trim();
        
        if (!player1Name || !player2Name) {
            alert('Please enter names for both players');
            return;
        }
        
        GameController.startGame(player1Name, player2Name);
        
        // Switch to game display
        gameSetup.style.display = 'none';
        gameDisplay.style.display = 'block';
        
        updateDisplay();
    };

    const restartGame = () => {
        GameController.resetGame();
        updateDisplay();
        clearBoard();
    };

    const handleCellClick = (e) => {
        const cellIndex = parseInt(e.target.dataset.index);
        
        if (GameController.isGameOver()) return;
        
        const result = GameController.playTurn(cellIndex);
        
        if (result) {
            updateBoard();
            
            if (result.type === 'gameOver') {
                if (result.winner === 'tie') {
                    gameStatus.textContent = "It's a tie!";
                } else {
                    gameStatus.textContent = `${result.winner === 'X' ? player1Input.value : player2Input.value} wins!`;
                    highlightWinningCells(result.winningCombo);
                }
            } else {
                currentPlayerName.textContent = result.nextPlayer.name;
                gameStatus.textContent = '';
            }
        }
    };

    const updateDisplay = () => {
        currentPlayerName.textContent = GameController.getCurrentPlayer().name;
        gameStatus.textContent = '';
        clearBoard();
    };

    const updateBoard = () => {
        const board = Gameboard.getBoard();
        
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            if (board[index] === 'X') {
                cell.classList.add('x');
                cell.classList.remove('o');
            } else if (board[index] === 'O') {
                cell.classList.add('o');
                cell.classList.remove('x');
            } else {
                cell.classList.remove('x', 'o');
            }
        });
    };

    const clearBoard = () => {
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning-cell');
        });
    };

    const highlightWinningCells = (winningCombo) => {
        if (winningCombo) {
            winningCombo.forEach(index => {
                cells[index].classList.add('winning-cell');
            });
        }
    };

    return {
        initializeEventListeners
    };
})();

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    DisplayController.initializeEventListeners();
});
