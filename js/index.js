'use strict';
export class BoardGame {
  constructor(targetClass, boardPixel, bgColor, boardSize) {
    this.targetClass = targetClass;
    this.boardPixel = boardPixel;
    this.bgColor = bgColor;
    this.boardSize = boardSize;
  }
  generateGame() {
    const fragment = document.createDocumentFragment();
    const scoreDiv = document.createElement('div');
    const boardDiv = document.createElement('div');
    const pieceDiv = document.createElement('div');

    scoreDiv.classList.add('gameScore');
    boardDiv.classList.add('gameBoard');
    pieceDiv.classList.add('gameBlocks');
    pieceDiv.id = 'gameBlocks';

    scoreDiv.style.height = '50px';
    scoreDiv.style.width = '500px';

    boardDiv.style.height = '500px';
    boardDiv.style.width = '500px';

    pieceDiv.style.height = '250px';
    pieceDiv.style.width = '500px';

    fragment.appendChild(scoreDiv);
    fragment.appendChild(boardDiv);
    fragment.appendChild(pieceDiv);
    document.querySelector(`.${this.targetClass}`).appendChild(fragment);

    this.generateScore();
    this.generateBoard();
    this.generateBlock();
  }
  generateBoard() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < this.boardPixel; i++) {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('row');
      for (let j = 0; j < this.boardPixel; j++) {
        const colDiv = document.createElement('div');
        colDiv.classList.add('col');
        colDiv.dataset.id = `${i}:${j}`;
        colDiv.dataset.rowIndex = `${i}`;
        colDiv.dataset.colIndex = `${j}`;
        colDiv.dataset.isBoard = 'true';
        colDiv.dataset.isFilled = 'false';
        rowDiv.style.backgroundColor = this.bgColor;
        rowDiv.appendChild(colDiv);
        rowDiv.addEventListener('dragover', this.dragOverEvent);
        rowDiv.addEventListener('dragleave', this.dragLeaveEvent);
      }
      fragment.appendChild(rowDiv);
    }
    document.querySelector('.gameBoard').appendChild(fragment);
  }
  generateScore() {
    const fragment = document.createDocumentFragment();
    const spanPrefix = document.createElement('span');
    const spanScore = document.createElement('span');
    spanPrefix.innerText = 'Score: ';
    spanScore.classList.add('score');
    spanScore.innerText = 0;
    fragment.appendChild(spanPrefix);
    fragment.appendChild(spanScore);
    document.querySelector('.gameScore').appendChild(fragment);
  }
  generateBlock() {
    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');
    div.style.backgroundColor = 'black';
    div.style.width = '50px';
    div.style.height = '50px';
    div.draggable = true;
    // div.addEventListener('drag', this.blockEvent);
    // div.addEventListener('dragenter', this.blockEvent);
    div.addEventListener('dragstart', this.blockEvent);
    div.addEventListener('dragend', this.dragEndEvent);
    div.addEventListener('dragend', this.eraserBingoBlock);
    // div.addEventListener('dragleave', this.blockEvent);
    // div.addEventListener('drop', this.blockEvent);
    fragment.appendChild(div);
    document.querySelector('.gameBlocks').appendChild(fragment);
  }

  blockEvent(event) {}
  dragOverEvent(event) {
    if (event.target.dataset.isFilled === 'true') {
      return;
    }
    event.target.style.backgroundColor = 'red';
  }
  dragLeaveEvent(event) {
    if (event.target.dataset.isFilled === 'true') {
      return;
    }
    event.target.style.backgroundColor = 'gray';
  }
  dragEventHandler() {
    return (a = {});
  }
  dragEndEvent(event) {
    const target = document.elementsFromPoint(event.clientX, event.clientY);
    if (target[0].dataset.isBoard) {
      target[0].style.backgroundColor = 'black';
      target[0].dataset.isFilled = true;
    }
  }
  eraserBingoBlock(event) {
    const target = document.elementsFromPoint(event.clientX, event.clientY);
    if (!target[0].dataset.isBoard) {
      return;
    }
    const targetId = target[0].dataset.id;
    const rowCount = target[1].querySelectorAll('.col').length;
    const rowCheckArray = [...Array(rowCount)].fill(0);
    const colCheckArray = [...Array(rowCount)].fill(0);
    const cellList = target[2].querySelectorAll('.col');
    cellList.forEach((cell) => {
      const id = cell.dataset.id;
      const filled = cell.dataset.isFilled;
      if (filled === 'true') {
        const [x, y] = id.split(':');
        rowCheckArray[x]++;
        colCheckArray[y]++;
      }
    });
    const findAllIndex = (arr, val) => {
      const indexes = [];
      let i = -1;
      while ((i = arr.indexOf(val, i + 1)) != -1) {
        indexes.push(i);
      }
      return indexes;
    };

    const clearLine = (index, direction) => {
      if (direction === 'row') {
        for (let i = 0; i < index.length; i++) {
          const targetIndex = index[i];
          const targetRow = document.querySelectorAll(
            `[data-row-index='${targetIndex}']`
          );
          for (const cell of targetRow) {
            cell.style.backgroundColor = 'gray';
            cell.dataset.isFilled = 'false';
          }
        }
      } else if (direction === 'col') {
        for (let i = 0; i < index.length; i++) {
          const targetIndex = index[i];
          const targetRow = document.querySelectorAll(
            `[data-col-index='${targetIndex}']`
          );
          for (const cell of targetRow) {
            cell.style.backgroundColor = 'gray';
            cell.dataset.isFilled = 'false';
          }
        }
      }
    };
    const rowIndex = findAllIndex(rowCheckArray, rowCount) || [];
    const colIndex = findAllIndex(colCheckArray, rowCount) || [];
    if (rowIndex.length || colIndex.length) {
      console.log('스코어');
      clearLine(rowIndex, 'row');
      clearLine(colIndex, 'col');
      const bingoLine = rowIndex.length + colIndex.length;
      const scoreSpan = document.querySelector('.score');
      let score = Number(scoreSpan.innerText) + bingoLine * 9;
      scoreSpan.innerText = score;
    }
  }
}
