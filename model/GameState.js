export const Players = Object.freeze({
  O: 'O',
  X: 'X',
});

export const WIN_POSITIONS = Object.freeze({
  Rows: {
    0: 'first-row',
    1: 'second-row',
    2: 'third-row',
  },
  Cols: {
    0: 'first-column',
    1: 'second-column',
    2: 'third-column',
  },
  MainDiagonal: 'main-diagonal',
  SecondaryDiagonal: 'secondary-diagonal',
});

export class GameState {
  audiosPlayingOnHide = null;

  constructor(players = Players) {
    this.reset();
    this.players = players;
  }

  reset() {
    this.board = new Array(3).fill(null).map(() => new Array(3).fill(null));
    this.currPlayer = Players.O;
    this.musics = {
      bg: new Audio('assets/audio/Tic Tac Flow.mp3'),
      gameOver: new Audio('assets/audio/Game Over.mp3'),
      explosion: new Audio('assets/audio/Explosion.mp3'),
    };
    this.powers = {
      bomb: {
        active: true,
        action() {
          const lineToRemove = Math.floor(Math.random() * this.board.length);
          this.board[lineToRemove] = new Array(3).fill(null);
          const affectedPositions = this.board[lineToRemove].map((_, col) => ({ row: lineToRemove, col }));
          return { affectedPositions }; //  [{row, col}, ...]
        },
      },
    };
    this.winner = null;
  }

  checkWinCondition(row, col) {
    // Check row
    if (this.board[row].every((cell) => cell === this.currPlayer)) {
      return WIN_POSITIONS.Rows[row];
    }

    // Check column
    if (this.board.every((r) => r[col] === this.currPlayer)) {
      return WIN_POSITIONS.Cols[col];
    }

    // Check main diagonal only if player choose a cell in it
    // The only way to win in a diagonal is to play in it
    // main diagonal can be determined by row === col
    if (row === col && this.board.every((r, idx) => r[idx] === this.currPlayer)) {
      return WIN_POSITIONS.MainDiagonal;
    }

    // Check secondary diagonal
    // The only way to win in a diagonal is to play in it
    // secondary diagonal can be determined by row + col = board.length -1
    if (
      row + col === this.board.length - 1 &&
      this.board.every((r, idx) => r[this.board.length - 1 - idx] === this.currPlayer)
    ) {
      return WIN_POSITIONS.SecondaryDiagonal;
    }

    return false;
  }

  isBoardFull() {
    return this.board.every((row) => row.every((cell) => cell !== null));
  }

  isBoardEmpty() {
    return this.board.every((row) => row.every((cell) => cell === null));
  }

  switchPlayer() {
    this.currPlayer = this.currPlayer === Players.X ? Players.O : Players.X;
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
    this.board[index1][index2] = this.currPlayer;
  }

  usePower(powerId) {
    if (this.powers[powerId]?.active) {
      this.powers[powerId].active = false;
      const affectedPositions = this.powers[powerId].action.call(this);
      return { isActive: true, ...affectedPositions };
    }

    return { isActive: false, affectedPositions: [] };
  }

  getBoard() {
    return this.currentGame;
  }

  getCurrPlayer() {
    return this.currPlayer;
  }
  setCurrPlayer(player) {
    this.currPlayer = player;
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
