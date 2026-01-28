export const Players = Object.freeze({
  player1: '1',
  player2: '2',
});

class State {
  _musics = {
    bg: new Audio('Tic Tac Flow.mp3'),
    gameOver: new Audio('Game Over.mp3'),
    explosion: new Audio('Explosion.mp3'),
  };
  _currPlayer = Players.player1;
  _players = {
    1: {
      symbol: 'X',
    },
    2: {
      symbol: 'O',
    },
  };
  _powers = {
    bomb: {
      active: true,
      action() {
        const lineToRemove = Math.floor(Math.random() * this._currentGame.length);
        const affectedOccuppied = this._currentGame[lineToRemove]
          .map((value, col) => (value ? { row: lineToRemove, col } : null))
          .filter((pos) => pos !== null);
        this._currentGame[lineToRemove] = new Array(3).fill(null);
        this._turnsLeft += affectedOccuppied.length; // adjust turns left
        const affectedPositions = this._currentGame[lineToRemove].map((_, col) => ({ row: lineToRemove, col }));
        return { affectedPositions }; //  [{row, col}, ...]
      },
    },
  };
  _currentGame = new Array(3).fill(null).map(() => new Array(3).fill(null));
  _turnsLeft = 9;
  _winner = null;

  getWinner = () => this._winner;
  setWinner = (playerNumber) => {
    this._winner = playerNumber;
  };

  getMusic = (id) => this._musics[id];

  getAllMusics = () => this._musics;

  getPlayers = () => this._players;

  getPlayerSymbol = (playerNumber) => this._players[playerNumber].symbol;

  updateCurrentGameByIndexes = (index1, index2) => {
    this._currentGame[index1][index2] = this._currPlayer;
  };

  usePower = (powerId) => {
    if (this._powers[powerId]?.active) {
      this._powers[powerId].active = false;
      const affectedPositions = this._powers[powerId].action.call(this);
      return { isActive: true, ...affectedPositions };
    }
    return { isActive: false, affectedPositions: [] };
  };

  getTurnsLeft = () => this._turnsLeft;
  deductTurn = () => {
    this._turnsLeft -= 1;
  };

  getCurrentGame = () => this._currentGame;

  getCurrPlayer = () => this._currPlayer;

  setCurrPlayer = (player) => {
    this._currPlayer = player;
  };
}

export const globalState = new State();
