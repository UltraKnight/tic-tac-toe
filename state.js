export const Players = Object.freeze({
  player1: '1',
  player2: '2',
});

class State {
  _music = new Audio('Tic Tac Flow.mp3');
  _currPlayer = Players.player1;
  _players = {
    1: {
      symbol: 'X',
    },
    2: {
      symbol: 'O',
    },
  };
  _currentGame = new Array(3)
    .fill(null)
    .map(() => new Array(3).fill(null));
  _turnsLeft = 9;
  _winner = null;

  getWinner = () => this._winner;
  setWinner = (playerNumber) => {
    this._winner = playerNumber;
  };
    
  getMusic = () => this._music;

  getPlayers = () => this._players;

  getPlayerSymbol = (playerNumber) => this._players[playerNumber].symbol;

  updateCurrentGameByIndexes = (index1, index2) => {
    this._currentGame[index1][index2] = this._currPlayer;
  }

  getTurnsLeft = () => this._turnsLeft;
  deductTurn = () => {
    this._turnsLeft -= 1;
  }

  getCurrentGame = () => this._currentGame;

  getCurrPlayer = () => this._currPlayer;

  setCurrPlayer = (player) => {
    this._currPlayer = player;
  }
}

export const globalState = new State();
