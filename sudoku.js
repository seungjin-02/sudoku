const table = document.getElementById("grid");
for (let r = 0; r < 9; r++) {
  const tr = document.createElement("tr");
  for (let c = 0; c < 9; c++) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.id = `cell-${r}-${c}`;
    input.type = "number";
    input.min = 0;
    input.max = 9;
    td.appendChild(input);
    tr.appendChild(td);
  }
  table.appendChild(tr);
}
/**********************
 * 스도쿠 검증/해결 함수
 **********************/
function isValid(board, r, c, num) {
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === num || board[i][c] === num) return false;
  }
  const sr = Math.floor(r / 3) * 3;
  const sc = Math.floor(c / 3) * 3;
  for (let i = sr; i < sr + 3; i++) {
    for (let j = sc; j < sc + 3; j++) {
      if (board[i][j] === num) return false;
    }
  }
  return true;
}

function solveSudoku(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            if (solveSudoku(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**********************
 * 정답 개수 세기 (유일성 확인용)
 **********************/
function countSolutions(board) {
  let count = 0;

  function dfs(b) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (b[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(b, r, c, num)) {
              b[r][c] = num;
              dfs(b);
              b[r][c] = 0;
            }
          }
          return;
        }
      }
    }
    count++;
    if (count > 1) return;
  }

  const copy = board.map(row => row.slice());
  dfs(copy);
  return count;
}

/**********************
 * 랜덤 스도쿠 생성 (유일성 보장)
 **********************/
function generateFullBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveSudoku(board);
  return board;
}

function generatePuzzle() {
  const full = generateFullBoard();
  const puzzle = full.map(row => row.slice());

  const difficulty = document.getElementById("difficulty").value;
  let removeCount = 40;
  if (difficulty === "easy") removeCount = 35;
  if (difficulty === "medium") removeCount = 45;
  if (difficulty === "hard") removeCount = 55;

  // 빈칸 제거 (유일성 확인)
  const cells = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      cells.push([r, c]);

  while (removeCount > 0 && cells.length > 0) {
    const idx = Math.floor(Math.random() * cells.length);
    const [r, c] = cells[idx];
    const temp = puzzle[r][c];
    puzzle[r][c] = 0;

    if (countSolutions(puzzle) === 1) {
      removeCount--;
    } else {
      puzzle[r][c] = temp; // 유일하지 않으면 복원
    }

    cells.splice(idx, 1);
  }

  // UI 반영
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.getElementById(`cell-${r}-${c}`);
      if (puzzle[r][c] !== 0) {
        cell.value = puzzle[r][c];
        cell.style.backgroundColor = "#e0e0e0"; // 고정 숫자
        cell.readOnly = true;
      } else {
        cell.value = "";
        cell.style.backgroundColor = "white"; // 빈칸
        cell.readOnly = false;
      }
      cell.classList.remove("user-input");
    }
  }

  window.currentSolution = full;
  window.currentPuzzle = puzzle;
  alert("랜덤 스도쿠 생성 완료!");
}

/**********************
 * 힌트 기능
 **********************/
function giveHint() {
  const board = getBoard();
  if (!window.currentSolution) {
    alert("먼저 랜덤 문제를 생성해주세요.");
    return;
  }

  let bestR = -1, bestC = -1, bestOptions = 10;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        let count = 0;
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, r, c, num)) count++;
        }
        if (count < bestOptions) {
          bestOptions = count;
          bestR = r;
          bestC = c;
        }
      }
    }
  }

  if (bestR === -1) {
    alert("힌트 줄 빈칸이 없습니다!");
    return;
  }

  const cell = document.getElementById(`cell-${bestR}-${bestC}`);
  const correct = window.currentSolution[bestR][bestC];
  cell.value = correct;
  cell.style.backgroundColor = "#ffff99"; // 힌트 색
  cell.readOnly = true; // 수정 불가
  alert("힌트 적용 완료!");
}

/**********************
 * Solve 버튼
 **********************/
function getBoard() {
  const board = [];
  for (let r = 0; r < 9; r++) {
    board[r] = [];
    for (let c = 0; c < 9; c++) {
      board[r][c] = Number(document.getElementById(`cell-${r}-${c}`).value) || 0;
    }
  }
  return board;
}

function solve() {
  const board = getBoard();
  const copy = board.map(row => row.slice());

  if (solveSudoku(copy)) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.getElementById(`cell-${r}-${c}`);
        cell.value = copy[r][c];
      }
    }
    alert("풀었습니다!");
  } else {
    alert("해결 불가한 스도쿠입니다.");
  }
}

function checkAnswer() {
  if (!window.currentSolution) {
    alert("먼저 랜덤 문제를 생성해주세요.");
    return;
  }

  const board = getBoard();
  let hasError = false;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.getElementById(`cell-${r}-${c}`);
      if (!cell.readOnly) { // 사용자가 입력한 셀만 체크
        if (board[r][c] !== window.currentSolution[r][c]) {
          cell.style.backgroundColor = "#ffcccc"; // 틀린 부분 빨강
          hasError = true;
        } else {
          cell.style.backgroundColor = "#cce6ff"; // 맞으면 파랑 유지
        }
      }
    }
  }

  if (hasError) {
    alert("틀린 숫자가 있습니다!");
  } else {
    alert("축하합니다! 모든 숫자가 맞습니다!");
  }
}