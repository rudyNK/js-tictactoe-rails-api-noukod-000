// Code your JavaScript / jQuery solution here
let turn = 0;
let enabled = true;
let gameID = 0;
const win =
[
  [0, 4, 8],
  [2, 4, 6],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8]
];

function player() {
  return turn % 2 === 0 ? 'X' : 'O';
}

function getBoard() {
  let tds = document.getElementsByTagName('td');
  let values = [];
  for (let x = 0; x < tds.length; x++) {
    if (tds[x].innerText) {
      values.push(tds[x].innerText);
    }
    else {
      values.push('');
    }
  }
  return values;
}

function resetBoard() {
  let tds = document.getElementsByTagName('td');
  for (let x = 0; x < tds.length; x++) {
    $(tds[x]).text('');
  }
  $('#message').text('');
  gameID = 0;
}

function updateState(td) {
  let symbol = player();
  $(td).text(symbol);
}

function setMessage(message) {
  $('#message').text(message);
}

function saveGame() {
  if (gameID === 0) {
    let values = {state: getBoard()};
    $.post('/games', values);
  }
  else {
    let values = {state: getBoard()};
    $.ajax({
      type: 'PATCH',
      url: `/games/${gameID}`,
      data: values
    });
  }
}

function checkWinner() {
  let values = getBoard();
  let won = [];

  for (let x = 0; x < win.length; x++) {
    for (let i = 0; i < win[x].length; i++) {
      won.push(values[win[x][i]]);
    }
    if (won.toString() === 'X,X,X' || won.toString() === 'O,O,O') {
      setMessage(`Player ${won[0]} Won!`);
      enabled = false;
      saveGame();
      return true;
    }
    won = [];
  }
  return false;
}

function doTurn(el) {
  updateState(el);
  turn++;
  checkWinner();
}

function checkTie() {
  let values = getBoard();

  if (!values.includes('')) {
    setMessage('Tie game.');
    saveGame();
    enabled = false;
  }
}

function loadGame(game) {
  let id = parseInt(game);
  $.get(`/games/${id}`, function(data) {
    let state = data.data.attributes.state;
    let tds = document.getElementsByTagName('td');
    let id = parseInt(data.data.id);
    gameID = id;
    for(let i in tds) {
      $(tds[i]).text(state[i]);
    }
  });
}

$(document).ready(function () {
    $('td').on('click', function() {
      if (enabled === true) {
        doTurn(this);
      }
      checkTie();
    });

    $('#clear').on('click', function() {
      resetBoard();
      turn = 0;
      enabled = true;
    });

    $('#save').on('click', function() {
      saveGame();
    });

    $('#previous').on('click', function() {
      $('#games').text('');
      $.get('/games', function(data) {
        for(let i in data.data) {
          $('#games').append(`<button id="gameid-${data['data'][i].id}">${data['data'][i].id}</button><br>`);
          $("#gameid-" + data['data'][i].id).on('click', () => loadGame(data['data'][i].id));
        }
      });
    });
});
