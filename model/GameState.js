export const Players = Object.freeze({
  O: 'O',
  X: 'X',
});

export const POWERS = Object.freeze({
  bomb: 'bomb',
  shuffle: 'shuffle',
  change: 'change',
});

export class GameState {
  audiosPlayingOnHide = null;

  constructor(gridSize = 3) {
    this.players = { [Players.O]: { score: 0, symbol: Players.O }, [Players.X]: { score: 0, symbol: Players.X } };
    this.reset(gridSize);
  }

  reset(gridSize = 3) {
    this.currentRound = 1;
    this.board = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(null));
    this.currPlayer = this.players[Players.O];
    this.musics = {
      bg: new Audio('assets/audio/Tic Tac Flow.mp3'),
      gameOver: new Audio('assets/audio/Game Over.mp3'),
      explosion: new Audio('assets/audio/Explosion.mp3'),
    };
    this.powers = {
      [POWERS.bomb]: {
        active: true,
        action() {
          const lineToRemove = Math.floor(Math.random() * this.board.length);
          this.board[lineToRemove] = new Array(this.board.length).fill(null);
          const affectedPositions = this.board[lineToRemove].map((_, col) => ({
            row: lineToRemove,
            col,
            replacer: '',
          }));
          return { affectedPositions, redraw: false }; //  [{row, col}, ...]
        },
      },
      [POWERS.change]: {
        active: true,
        action() {
          const xPositions = this.getPositionsOfSymbol(Players.X);
          const oPositions = this.getPositionsOfSymbol(Players.O);
          const randomXPosition = xPositions[Math.floor(Math.random() * xPositions.length)];
          const randomOPosition = oPositions[Math.floor(Math.random() * oPositions.length)];
          randomXPosition && (this.board[randomXPosition.row][randomXPosition.col] = Players.O);
          randomOPosition && (this.board[randomOPosition.row][randomOPosition.col] = Players.X);

          return {
            redraw: false,
            affectedPositions: [
              { ...randomXPosition, replacer: Players.O },
              { ...randomOPosition, replacer: Players.X },
            ], // No specific positions affected
            canHaveWinner: true,
          };
        },
      },
      [POWERS.shuffle]: {
        active: true,
        action() {
          const currentBoardFlat = this.board.flat();
          const currentBoard = this.board;
          // Shuffle the board values
          for (let i = currentBoardFlat.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentBoardFlat[i], currentBoardFlat[j]] = [currentBoardFlat[j], currentBoardFlat[i]];
          }
          // Reassign shuffled values back to the board
          this.board = [];
          for (let r = 0; r < currentBoard.length; r++) {
            // get values for each row
            // 0 * 3 = 0 to 0 * 3 + 3 = 3
            // 1 * 3 = 3 to 1 * 3 + 3 = 6
            // 2 * 3 = 6 to 2 * 3 + 3 = 9
            this.board.push(currentBoardFlat.slice(r * currentBoard.length, r * currentBoard.length + currentBoard.length));
          }
          return {
            redraw: true,
            affectedPositions: [], // No specific positions affected
            canHaveWinner: true,
          };
        },
      },
    };
    this.winner = null;
  }

  checkWinConditionOnRow(row, player) {
    if (this.board[row].every((cell) => cell === player.symbol)) {
      return `row-${row}`;
    }

    return '';
  }

  checkWinConditionOnColumn(col, player) {
    if (this.board.every((row) => row[col] === player.symbol)) {
      return `col-${col}`;
    }

    return '';
  }

  checkWinConditionOnMainDiagonal(player) {
    if (this.board.every((r, idx) => r[idx] === player.symbol)) {
      return `main-diagonal`;
    }

    return '';
  }

  checkWinConditionOnSecondaryDiagonal(player) {
    if (this.board.every((r, idx) => r[this.board.length - 1 - idx] === player.symbol)) {
      return `secondary-diagonal`;
    }

    return '';
  }

  // the power up shuffle moves all symbols on the board
  // causing the chance of a win condition for both players
  checkWinConditionOnBoard() {
    let hasWonOnMainDiagonal = false;
    let hasWonOnSecondaryDiagonal = false;
    let hasWonOnRow = false;
    let hasWonOnCol = false;
    let winner = null;
    let result = false;
    const nextPlayer = Object.values(this.players).find((v) => v.symbol != this.currPlayer.symbol);

    const checkWinner = (player) => {
      hasWonOnMainDiagonal = this.checkWinConditionOnMainDiagonal(player);
      hasWonOnSecondaryDiagonal = this.checkWinConditionOnSecondaryDiagonal(player);

      this.board.forEach((_, position) => {
        if (!hasWonOnRow) {
          hasWonOnRow = this.checkWinConditionOnRow(position, player);
        }
        if (!hasWonOnCol) {
          // the board has the same ammount of rows and cols
          // no need to complicate the logic
          hasWonOnCol = this.checkWinConditionOnColumn(position, player);
        }
      });
      result = hasWonOnMainDiagonal || hasWonOnSecondaryDiagonal || hasWonOnRow || hasWonOnCol;
      winner = player;

      return result;
    };

    // prioritize current player
    const currentPlayerWon = checkWinner(this.currPlayer);
    !currentPlayerWon && checkWinner(nextPlayer);

    return { result, winner };
  }

  checkWinConditionOnMove(row, col) {
    let result = false;

    // Check row
    result = this.checkWinConditionOnRow(row, this.currPlayer);

    // Check columnon
    result = result || this.checkWinConditionOnColumn(col, this.currPlayer);
    // Check main diagonal only if player choose a cell in it
    // The only way to win in a diagonal is to play in it
    // main diagonal can be determined by row === col
    if (row === col && !result) {
      result = this.checkWinConditionOnMainDiagonal(this.currPlayer);
    }

    // Check secondary diagonal
    // The only way to win in a diagonal is to play in it
    // secondary diagonal can be determined by row + col = board.length -1
    if (row + col === this.board.length - 1 && !result) {
      result = this.checkWinConditionOnSecondaryDiagonal(this.currPlayer);
    }

    return result;
  }

  getPositionsOfSymbol(playerSymbol) {
    return this.board.reduce((symbolPositions, currRow, currRowIndex) => {
      currRow.forEach((cell, cellIndex) => {
        if (cell === playerSymbol) symbolPositions.push({ row: currRowIndex, col: cellIndex });
      });

      return symbolPositions;
    }, []);
  }

  isBoardFull() {
    return this.board.every((row) => row.every((cell) => cell !== null));
  }

  isBoardEmpty() {
    return this.board.every((row) => row.every((cell) => cell === null));
  }

  switchPlayer() {
    const isPlayer2 = this.currPlayer === this.players[Players.X];
    isPlayer2 && this.currentRound++;
    this.currPlayer = isPlayer2 ? this.players[Players.O] : this.players[Players.X];
  }

  updateScore(playerSymbol) {
    this.players[playerSymbol].score += 1;
    return this.players[playerSymbol].score;
  }

  resetScore() {
    Object.values(this.players).forEach((player) => {
      player.score = 0;
    });
    return this.players;
  }

  getWinner() {
    return this.winner;
  }
  setWinner(playerNumber) {
    this.winner = playerNumber;
  }

  getMusic(id) {
    return this.musics[id];
  }
  getAllMusics() {
    return this.musics;
  }

  getPlayers() {
    return this.players;
  }
  getPlayer(id) {
    return this.players[id];
  }

  updateBoardByIndexes(index1, index2) {
    this.board[index1][index2] = this.currPlayer.symbol;
  }

  usePower(powerId) {
    if (this.powers[powerId]?.active) {
      this.powers[powerId].active = false;
      const { affectedPositions, canHaveWinner, redraw } = this.powers[powerId].action.call(this);
      return { isActive: true, affectedPositions, canHaveWinner, redraw };
    }

    return { isActive: false, affectedPositions: [], canHaveWinner: false, redraw: false };
  }

  getBoard() {
    return this.board;
  }

  getCurrPlayer() {
    return this.currPlayer;
  }

  pauseAllAudios() {
    const audios = Object.values(this.musics);

    this.audiosPlayingOnHide = audios.filter((audio) => !audio.paused && audio);
    this.audiosPlayingOnHide?.forEach((audio) => {
      !audio.paused && audio.pause();
    });
  }

  resumeAllAudios() {
    this.audiosPlayingOnHide.forEach((audio) => {
      audio.paused && audio.play();
    });
    this.audiosPlayingOnHide = null;
  }
}
