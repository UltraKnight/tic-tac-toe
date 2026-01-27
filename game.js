// @name         Tic Tac Toe Game
// @version      1.0
// @description  A simple Tic Tac Toe game
// @author       Vanderlei Martins
import { globalState, Players } from './state.js';
const state = globalState;

const WIN_POSITIONS = Object.freeze({
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

const hasWinner = () => {
  let winner = null;
  let winPosition = null;
  const currentGame = state.getCurrentGame();
  const players = Object.keys(state.getPlayers());
  const checkRow = (r, value) => currentGame[r].every((field) => field === value);
  const checkCol = (c, value) => currentGame.every((row, i) => row[c] === value);

  const checkRows = () => {
    players.forEach((p) => {
      for (let i = 0; i < currentGame.length; i++) {
        const isWinner = checkRow(i, p);
        if (isWinner) {
          winPosition = WIN_POSITIONS.Rows[i];
          winner = p;
        }
      }
    });
  };
  const checkColumns = () => {
    players.forEach((p) => {
      for (let col = 0; col < currentGame[0].length; col++) {
        const isWinner = checkCol(col, p);
        if (isWinner) {
          winPosition = WIN_POSITIONS.Cols[col];
          winner = p;
        }
      }
    });
  };

  const checkMainDiagonal = () => {
    players.forEach((p) => {
      const isWinner = currentGame.every((row, i) => row[i] === p);
      if (isWinner) {
        winPosition = WIN_POSITIONS.MainDiagonal;
        winner = p;
      }
    });
  };

  const checkSecondaryDiagonal = () => {
    const n = currentGame.length;
    // n - 1 = last column
    players.forEach((p) => {
      const isWinner = currentGame.every((row, i) => row[n - 1 - i] === p);
      if (isWinner) {
        winPosition = WIN_POSITIONS.SecondaryDiagonal;
        winner = p;
      }
    });
  };

  const setWinnerMarkerClass = (classToAdd) => {
    const winnerMarkerEl = document.querySelector('.winner-marker');
    winnerMarkerEl.classList.add(classToAdd);
  };

  checkRows();
  // stop validations once a winner is determined
  !winner && checkColumns();
  !winner && checkMainDiagonal();
  !winner && checkSecondaryDiagonal();
  winPosition && setWinnerMarkerClass(winPosition);

  return winner;
};

const startTurn = (e) => {
  const tbody = e.target.closest('tbody');
  const td = e.target.closest('td');
  const playerSelection = td.classList[0].split('-');

  if (!td || !tbody.contains(td)) return;

  if (td.textContent) return;

  state.updateCurrentGameByIndexes(playerSelection[0] - 1, playerSelection[1] - 1);

  const currPlayer = state.getCurrPlayer();

  td.classList.toggle(currPlayer === Players.player1 ? 'primary' : 'secondary');
  td.classList.add('animate');
  td.textContent = state.getPlayerSymbol(currPlayer);

  endTurn();
  state.setWinner(hasWinner());

  if (state.getTurnsLeft() === 0 || state.getWinner()) {
    endGame(tbody);
  }
};

const endTurn = () => {
  state.getCurrPlayer() === Players.player1
    ? state.setCurrPlayer(Players.player2)
    : state.setCurrPlayer(Players.player1);
  state.deductTurn();
};

const play = (audio) => {
  audio.paused && audio.play();
};

const pause = (audio) => {
  !audio.paused && audio.pause();
};

const playBgSong = () => {
  play(state.getMusic('bg'));
};

const playGameOverSong = () => {
  play(state.getMusic('gameOver'));
};

const stopBgSong = () => {
  pause(state.getMusic('bg'));
};

const startGame = () => {
  const tbody = document.querySelector('tbody');

  tbody.addEventListener('click', startTurn);
  tbody.addEventListener('click', playBgSong, { once: true });
};

const endGame = (gameAreaEl) => {
  const gameOverEl = document.querySelector('.gameover');
  const winnerEl = gameOverEl.lastElementChild;
  const playAgainBtn = document.querySelector('button');
  const winner = state.getWinner();

  gameAreaEl.removeEventListener('click', startTurn);
  gameOverEl.classList.toggle('gameover');
  winnerEl.textContent = winner ? `Jogador ${winner} venceu!` : 'EMPATE!';
  playAgainBtn.setAttribute('style', 'display: block');
  playAgainBtn.addEventListener('click', () => window.location.reload());
  stopBgSong();
  playGameOverSong();
};

let playingOnHide = null;
document.addEventListener('visibilitychange', () => {
  const audios = Object.values(state.getAllMusics());

  if (document.hidden) {
    playingOnHide = audios.filter((audio) => !audio.paused && audio);
    playingOnHide?.forEach((audio) => {
      pause(audio);
    });
  } else {
    playingOnHide.forEach((audio) => {
      play(audio);
    });
    playingOnHide = [];
  }
});

document.addEventListener('DOMContentLoaded', startGame);
