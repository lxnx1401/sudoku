const cells = document.querySelectorAll('.cell');
const numberButtons = document.querySelectorAll('.content');
let selectedCell = null;
let board = Array.from({ length: 9 }, () => Array(9).fill(0));
const newGameButton = document.getElementById('neu');

function displayPlayerName() {
    const name = localStorage.getItem('spielerName') || 'Gast';
    const displayElement = document.getElementById('userDisplay');
    
    // Die Grammatik-Logik
    // Prüfen, ob der letzte Buchstabe s, x oder z ist (typisch für Apostroph-Regel)
    const lastChar = name.slice(-1).toLowerCase();
    let finalName;

    if (lastChar === 's' || lastChar === 'x' || lastChar === 'z') {
        finalName = name + ""; // Nur ein Apostroph (z.B. Lukas')
    } else {
        finalName = name + "'s"; // Normales 's (z.B. Lxnx's)
    }

    displayElement.textContent = finalName;
}

newGameButton.addEventListener('click', () => {
    // Die Systemabfrage
    const userConfirmed = confirm("Möchtest du wirklich ein neues Spiel starten? Dein aktueller Fortschritt geht verloren.");

    if (userConfirmed) {
        // Seite neu laden
        location.reload();
    }
});

// 1. KOORDINATEN AUTOMATISCH VERGEBEN
function initCoordinates() {
    const allFelder = document.querySelectorAll('.feld');
    allFelder.forEach((feld, fIndex) => {
        const feldCells = feld.querySelectorAll('.cell');
        feldCells.forEach((cell, cIndex) => {
            // Berechnet Zeile (0-8) und Spalte (0-8) aus der 3x3 Struktur
            const row = Math.floor(fIndex / 3) * 3 + Math.floor(cIndex / 3);
            const col = (fIndex % 3) * 3 + (cIndex % 3);
            cell.dataset.row = row;
            cell.dataset.col = col;
        });
    });
}

// 2. MATHEMATIK: VALIDIERUNG
function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        const mRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
        const mCol = 3 * Math.floor(col / 3) + i % 3;
        if (board[row][i] === num || board[i][col] === num || board[mRow][mCol] === num) {
            return false;
        }
    }
    return true;
}

// 3. MATHEMATIK: BACKTRACKING GENERATOR
function fillBoard(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                for (let num of numbers) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (fillBoard(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// 4. SPIELFELD VORBEREITEN
function generatePuzzle() {
    board = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillBoard(board);

    cells.forEach(cell => {
        const r = cell.dataset.row;
        const c = cell.dataset.col;
        // 35% Chance dass eine Zahl stehen bleibt (Schwierigkeit)
        if (Math.random() < 0.35) {
            cell.textContent = board[r][c];
            cell.classList.add('fixed');
        } else {
            cell.textContent = '';
            cell.classList.remove('fixed');
        }
    });
}

// 5. INTERAKTION (DEIN CODE ERWEITERT)
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (cell.classList.contains('fixed')) return;
        cells.forEach(c => c.style.backgroundColor = ""); 
        selectedCell = cell;
        selectedCell.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    });
});

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (selectedCell && !selectedCell.classList.contains('fixed')) {
            const chosenNumber = button.firstChild.textContent.trim(); 
            selectedCell.textContent = chosenNumber;
            
            validateAllCells();
            updateCounters(); 
            checkWin();
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (!selectedCell || selectedCell.classList.contains('fixed')) return;
    if (e.key >= '1' && e.key <= '9') {
        selectedCell.textContent = e.key;
        validateAllCells();
        updateCounters(); 
        checkWin();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        selectedCell.textContent = '';
        validateAllCells();
        updateCounters(); 
        checkWin();
    }
});

// 1. Die neue Validierungs-Funktion
function validateAllCells() {
    cells.forEach(cell => {
        const value = cell.textContent;
        if (!value) {
            cell.style.color = "white";
            return;
        }

        const row = cell.dataset.row;
        const col = cell.dataset.col;
        let hasError = false;

        // Prüfe diese Zelle gegen alle anderen
        cells.forEach(other => {
            if (other !== cell && other.textContent === value) {
                // Gleiche Zeile oder gleiche Spalte
                if (other.dataset.row === row || other.dataset.col === col) {
                    hasError = true;
                }
                // Gleicher 3x3 Block
                if (Math.floor(other.dataset.row / 3) === Math.floor(row / 3) &&
                    Math.floor(other.dataset.col / 3) === Math.floor(col / 3)) {
                    hasError = true;
                }
            }
        });

        cell.style.color = hasError ? "#ff4d4d" : "white";
    });
}

function updateCounters() {
    // Liste der Klassen passend zur Zahl
    const classNames = ["", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];

    for (let i = 1; i <= 9; i++) {
        // 1. Zähle, wie oft die Zahl i aktuell im Board steht
        const currentCount = Array.from(cells).filter(cell => cell.textContent == i).length;
        
        // 2. Berechne, wie viele noch übrig sind (9 minus Bestand)
        const remaining = 9 - currentCount;

        // 3. Element suchen und den Wert direkt setzen
        const counterElement = document.querySelector(`.${classNames[i]}`);
        if (counterElement) {
            counterElement.textContent = remaining;

            // Optisches Feedback: Bei 0 oder weniger wird der Button blasser,
            // aber die Zahl bleibt stehen (auch wenn sie negativ ist).
            if (remaining <= 0) {
                counterElement.parentElement.style.opacity = "0.3";
            } else {
                counterElement.parentElement.style.opacity = "1";
            }

            // Falls du willst, dass negative Zahlen rot leuchten (optional, aber hilfreich):
            counterElement.style.color = remaining < 0 ? "#ff4d4d" : "rgba(255, 255, 255, 0.2)";
        }
    }
}

function checkWin() {
    // Bedingung 1: Sind alle Zellen ausgefüllt?
    const allFilled = Array.from(cells).every(cell => cell.textContent !== '');
    
    // Bedingung 2: Gibt es irgendwo rote Zahlen (Fehler)?
    // Wir prüfen, ob irgendeine Zelle die Farbe Rot (Fehlerfarbe) hat
    const hasErrors = Array.from(cells).some(cell => cell.style.color === 'rgb(255, 77, 77)'); // #ff4d4d in RGB

    if (allFilled && !hasErrors) {
        // Verzögerung, damit die letzte Zahl noch gerendert wird
        setTimeout(() => {
            alert("Herzlichen Glückwunsch! Du hast das Sudoku gelöst! 🎉");
            
            // Optional: Den New Game Button hervorheben oder automatisch neu laden
            if(confirm("Noch eine Runde?")) {
                location.reload();
            }
        }, 100);
    }
}

// START
displayPlayerName();
initCoordinates();
generatePuzzle();
updateCounters();