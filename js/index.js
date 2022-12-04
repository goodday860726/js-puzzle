'use strict';

const shapeList = [
  'dot',
  'stick-row-2',
  // 'stick-row-3',
  // 'stick-row-4',
  // 'stick-row-5',
  'stick-col-2',
  // 'stick-col-3',
  // 'stick-col-4',
  // 'stick-col-5',
  'square',
];

const randomShape = () =>
  shapeList[Math.floor(Math.random() * shapeList.length)];
class Block {
  constructor(shape) {
    this.shape = shape;
    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');

    if (this.shape === 'dot') {
      const singleBlock = this.generateBlock();
      div.dataset.comas = ['0:0'];
      div.append(singleBlock);
    } else if (this.shape === 'stick-row-2') {
      const singleBlock1 = this.generateBlock();
      const singleBlock2 = this.generateBlock();
      div.appendChild(singleBlock1);
      div.appendChild(singleBlock2);
      div.dataset.comas = ['0:0', '1:0'];
      div.classList.add('stick-row-2');
    } else if (this.shape === 'stick-col-2') {
      const singleBlock1 = this.generateBlock();
      const singleBlock2 = this.generateBlock();
      div.appendChild(singleBlock1);
      div.appendChild(singleBlock2);
      div.dataset.comas = ['0:0', '0:1'];
      div.classList.add('stick-col-2');
    } else if (this.shape === 'square') {
      div.classList.add('multiBlock');
      const singleBlock1 = this.generateBlock('0:0');
      const singleBlock2 = this.generateBlock('0:1');
      const singleBlock3 = this.generateBlock('1:1');
      const dummyBlock1 = this.generateDummyBlock();
      div.appendChild(singleBlock1);
      div.appendChild(singleBlock2);
      div.appendChild(dummyBlock1);
      div.appendChild(singleBlock3);
      div.dataset.comas = ['0:0', '1:0', '1:1'];
    }
    div.draggable = true;
    div.addEventListener('drag', this.dragBlockEvent);
    div.addEventListener('dragend', this.dragEndEvent);
    div.addEventListener('dragend', this.eraserBingoBlock);
    fragment.appendChild(div);

    document.querySelector('.gameBlocks').appendChild(fragment);
  }
  generateDummyBlock() {
    const div = document.createElement('div');
    div.style.width = '50px';
    div.style.height = '50px';

    div.classList.add('dummyBlock');
    return div;
  }
  generateBlock(coordinate = '') {
    const [i, j] = coordinate.split(':');
    const div = document.createElement('div');
    div.style.backgroundColor = 'black';
    div.style.width = '50px';
    div.style.height = '50px';
    div.dataset.id = `${i}:${j}`;
    div.dataset.rowIndex = `${i}`;
    div.dataset.colIndex = `${j}`;

    return div;
  }
  dragBlockEvent(event) {
    // pointer fix 1:1
    const comas = event.target.dataset.comas.split(',');

    let target = document.elementsFromPoint(event.clientX, event.clientY);
    if (target[0].dataset.isBoard === 'true') {
      target = target[0];
    } else {
      return;
    }
    const rowIndex = Number(target.dataset.rowIndex);
    const colIndex = Number(target.dataset.colIndex);
    for (let i = 0; i < comas.length; i++) {
      const [x, y] = comas[i].split(':').map((s) => Number(s));
      if (rowIndex + y > 8 || colIndex + x > 8) return;
    }
    if (
      target.dataset.isBoard !== 'true' ||
      target.dataset.isFilled === 'true'
    ) {
      return;
    }
    const targetComas = comas.map((coma) => {
      const [x, y] = coma.split(':').map((s) => Number(s));
      return `${rowIndex + y}:${colIndex + x}`;
    });
    document.querySelectorAll('.gameBoard .col').forEach((div) => {
      if (div.dataset.isFilled === 'true') return;
      if (targetComas.includes(div.dataset.id)) {
        div.style.backgroundColor = 'darkGray';
      } else {
        div.style.backgroundColor = 'gray';
      }
    });
  }
  dragEndEvent(event) {
    const comas = event.target.dataset.comas.split(',');
    const dropPoint = document.elementsFromPoint(event.clientX, event.clientY);
    const dropXIndex = Number(dropPoint[0].dataset.rowIndex);
    const dropYIndex = Number(dropPoint[0].dataset.colIndex);
    let flag = true;
    comas.forEach((coma) => {
      const [x, y] = coma.split(':').map((v) => Number(v));
      const targetCell = document.querySelector(
        `[data-id="${dropXIndex + y}:${dropYIndex + x}"]`
      );
      if (
        targetCell.dataset.isBoard === 'false' ||
        targetCell.dataset.isFilled === 'true'
      ) {
        flag = false;
      }
    });
    if (flag) {
      document.querySelectorAll('.gameBoard .col').forEach((col) => {
        if (col.style.backgroundColor === 'darkgray') {
          col.style.backgroundColor = 'black';
          col.dataset.isFilled = true;
        }
      });
      event.target.remove();
      if (!document.querySelector('.gameBlocks > div')) {
        const block1 = new Block(randomShape());
        const block2 = new Block(randomShape());
        const block3 = new Block(randomShape());
      }
    } else {
      document.querySelectorAll('.gameBoard .col').forEach((col) => {
        if (col.style.backgroundColor === 'darkgray') {
          col.style.backgroundColor = 'gray';
        }
      });
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
      clearLine(rowIndex, 'row');
      clearLine(colIndex, 'col');
      const bingoLine = rowIndex.length + colIndex.length;
      const scoreSpan = document.querySelector('.score');
      let score = Number(scoreSpan.innerText) + bingoLine * 9;
      scoreSpan.innerText = score;
    }
  }
  removeSelf(event) {
    const dropPoint = document.elementsFromPoint(event.clientX, event.clientY);
    if (
      dropPoint[0].dataset.isBoard === 'true' &&
      dropPoint[0].dataset.isFilled === 'false'
    ) {
      event.target.remove();
      if (!document.querySelector('.gameBlocks > div')) {
        console.log('clear');
        const block1 = new Block(randomShape());
        const block2 = new Block(randomShape());
        const block3 = new Block(randomShape());
      }
    }
  }
}
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

    fragment.appendChild(scoreDiv);
    fragment.appendChild(boardDiv);
    fragment.appendChild(pieceDiv);
    document.querySelector(`.${this.targetClass}`).appendChild(fragment);

    this.generateScore();
    this.generateBoard();
    this.generateBlock();
    // this.generateLongBlock();
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
    const block1 = new Block(randomShape());
    const block2 = new Block(randomShape());
    const block3 = new Block(randomShape());
  }
}
