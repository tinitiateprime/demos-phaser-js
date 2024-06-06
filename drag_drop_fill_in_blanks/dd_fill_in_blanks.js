const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 300,
    parent: 'game-container',
    backgroundColor: '#FFFFFF',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // No assets to preload
}

let sentenceText;
let choicesText = [];
let draggedText = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let originalPosition = { x: 0, y: 0 };
let placedText = null;

const choices = [
    {"option": "an", "correct_answer": "no"},
    {"option": "is", "correct_answer": "yes"},
    {"option": "it", "correct_answer": "no"},
    {"option": "oh", "correct_answer": "no"}
];

function create() {
    // Add the sentence with a blank
    sentenceText = this.add.text(200, 100, 'This __ a cat', { fontFamily: 'Arial', fontSize: '32px', fill: '#000000' });

    // Create the draggable text options
    for (let i = 0; i < choices.length; i++) {
        let choiceText = this.add.text(25 + i * 100, 150, choices[i].option, { fontFamily: 'Arial', fontSize: '32px', fill: '#000000' })
            .setInteractive({ useHandCursor: true })
            .setData('text', choices[i].option)
            .setData('correct', choices[i].correct_answer)
            .setData('originalX', 25 + i * 100)
            .setData('originalY', 150);

        this.input.setDraggable(choiceText);

        choicesText.push(choiceText);
    }

    this.input.on('dragstart', function (pointer, gameObject) {
        draggedText = gameObject;
        dragOffsetX = pointer.x - gameObject.x;
        dragOffsetY = pointer.y - gameObject.y;
        originalPosition.x = gameObject.x;
        originalPosition.y = gameObject.y;
        gameObject.setAlpha(0.5);
    });

    this.input.on('drag', function (pointer, gameObject) {
        if (gameObject === draggedText) { // Allow dragging for both choices and placed text
            gameObject.x = pointer.x - dragOffsetX;
            gameObject.y = pointer.y - dragOffsetY;
        }
    });

    this.input.on('dragend', function (pointer, gameObject) {
        gameObject.setAlpha(1);
        let blankBounds = new Phaser.Geom.Rectangle(sentenceText.x + 60, sentenceText.y, 100, 50);
        if (blankBounds.contains(pointer.x, pointer.y)) {
            if (placedText && placedText !== gameObject) { // If there's already placed text, return it to original position
                placedText.x = placedText.getData('originalX');
                placedText.y = placedText.getData('originalY');
                placedText.visible = true;
            }
            // Place the new text
            sentenceText.setText(`This ${gameObject.getData('text')} a cat`);
            placedText = gameObject;
            gameObject.visible = false; // Hide the placed text
        } else {
            if (gameObject === placedText) {
                // Remove text from blank and reset original position
                sentenceText.setText('This __ a cat');
                placedText = null;
            }
            // Return to original position if not placed
            gameObject.x = gameObject.getData('originalX');
            gameObject.y = gameObject.getData('originalY');
            gameObject.visible = true; // Show the text again
        }
        draggedText = null;
    });

    document.getElementById('submit-button').addEventListener('click', checkAnswer);
}

function checkAnswer() {
    const resultBox = document.getElementById('result-box');
    if (placedText) {
        if (placedText.getData('correct') === 'yes') {
            resultBox.style.backgroundColor = 'green';
        } else {
            resultBox.style.backgroundColor = 'red';
        }
    } else {
        resultBox.style.backgroundColor = 'red';
    }
}

function update() {
    // Any per-frame updates
}
