// @name         Tic Tac Toe Game
// @version      1.0
// @description  A simple Tic Tac Toe game
// @author       Vanderlei Martins
import { globalState, Players } from './state.js';
const state = globalState;
const GAME_AREA_EL = document.querySelector('tbody');
const GAME_POWERS_EL = document.querySelector('.powers-row');
const SETUP = {
  bgSoundVolume: 0.8,
};

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

const updateBoardAtPosition = (index1, index2, player = null) => {
  const cell = document.querySelector(`.pos-${index1}-${index2}`);
  cell.textContent = player ? state.getPlayerSymbol(player) : '🔥';
  player
    ? cell.classList.toggle(player === Players.player1 ? 'primary' : 'secondary')
    : cell.classList.remove('primary', 'secondary');

  cell.addEventListener(
    'animationend',
    () => {
      if (!player) cell.textContent = '';
    },
    { once: true },
  );

  if (player) {
    cell.classList.add('animate');
    cell.classList.remove('explode');
  } else {
    cell.classList.remove('animate');
    cell.classList.add('explode');
  }
};

const startTurn = (e, onWin) => {
  const tbody = document.querySelector('tbody');
  const td = e.target.closest('td');
  const playerSelection = td.classList[0].split('-').slice(1);

  if (!td || !tbody.contains(td)) return;

  if (td.textContent) return;
  const posX = playerSelection[0];
  const posY = playerSelection[1];

  state.updateCurrentGameByIndexes(posX - 1, posY - 1);

  const currPlayer = state.getCurrPlayer();
  updateBoardAtPosition(posX, posY, currPlayer);

  endTurn();
  state.setWinner(hasWinner());

  if (state.getTurnsLeft() === 0 || state.getWinner()) {
    endGame(onWin);
  }
};

const endTurn = () => {
  state.getCurrPlayer() === Players.player1
    ? state.setCurrPlayer(Players.player2)
    : state.setCurrPlayer(Players.player1);
  state.deductTurn();
};

const useBomb = (el) => {
  const { isActive, affectedPositions } = state.usePower(el.name);
  if (isActive) {
    const explosionSfx = state.getMusic('explosion');
    el.classList.toggle('active');
    play(explosionSfx, 1);
    affectedPositions.forEach(({ row, col }) => {
      updateBoardAtPosition(row + 1, col + 1);
    });
  }
};

const usePower = (e) => {
  if (state.getTurnsLeft() === 9) return;
  const powerEl = e.target.closest('img');

  switch (powerEl?.name) {
    case 'bomb':
      useBomb(powerEl);
      break;
    default:
      break;
  }
};

const handleStartTurn = (e) => startTurn(e, removeGameListeners);

const addGameListeners = () => {
  const playBgSong = () => {
    play(state.getMusic('bg', SETUP.bgSoundVolume));
  };

  GAME_AREA_EL.addEventListener('click', handleStartTurn);
  GAME_POWERS_EL.addEventListener('click', usePower);
  GAME_AREA_EL.addEventListener('click', playBgSong, { once: true });
};

const removeGameListeners = () => {
  GAME_AREA_EL.removeEventListener('click', handleStartTurn);
  GAME_POWERS_EL.removeEventListener('click', usePower);
};

const play = (audio, volume = 1) => {
  audio.volume = volume;
  audio.paused && audio.play();
};

const pause = (audio) => {
  !audio.paused && audio.pause();
};

const playGameOverSong = () => {
  play(state.getMusic('gameOver'));
};

const stopBgSong = () => {
  pause(state.getMusic('bg'));
};

const startGame = (init) => {
  init();
};

const endGame = (cb) => {
  const gameOverEl = document.querySelector('.gameover');
  const winnerEl = gameOverEl.lastElementChild;
  const playAgainBtn = document.querySelector('button');
  const winner = state.getWinner();

  gameOverEl.classList.toggle('gameover');
  winnerEl.textContent = winner ? `Jogador ${winner} venceu!` : 'EMPATE!';
  playAgainBtn.setAttribute('style', 'display: block');
  playAgainBtn.addEventListener('click', () => window.location.reload());
  stopBgSong();
  playGameOverSong();

  cb();
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

document.addEventListener('DOMContentLoaded', (_e) => startGame(addGameListeners));
