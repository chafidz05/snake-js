'use strict';

window.addEventListener("DOMContentLoaded", function(event) {
  window.focus();

  // Game data
  let snakePositions;
  let applePositions;

  let startTimestamp;
  let lastTimestamp;
  let stepsTaken;
  let score;
  let contrast;

  let inputs;

  let gameStarted = false;
  let hardMode = false;

  // Configuration
  const width = 15;
  const height = 15;

  const speed = 200;
  let fadeSpeed = 5000;
  let fadeExponential = 1.024;
  const contrastIncrease = 0.5;
  const color = "black";

  // Setup: Build up the grid
  // The grid consists of (width x height) tiles
  // The tiles take the shape of a grid using CSS grid
  // The tile can represent a part of the snake or an apple
  // Each tile has a content div that takes an absolute position
  // The content can fill the tile or slide in or out from any direction to take the shape of a transitioning snake head or tail
  const grid = document.querySelector(".grid");
  for (let i = 0; i < width * height; i++) {
    const content = document.createElement("div");
    content.setAttribute("class", "content");
    content.setAttribute("id", i);

    const tile = document.createElement("div");
    tile.setAttribute("class", "tile");
    tile.appendChild(content);

    grid.appendChild(tile);
  }

  const tiles = document.querySelectorAll(".grid .tile .content");

  const containerElement = document.querySelector(".container");
  const noteElement = document.querySelector("footer");
  const contrastElement = document.querySelector(".contrast");
  const scoreElement = document.querySelector(".score");

  // Initialize layout
  resetGame();

  // Resets game variables and layouts but does not start the game (game starts on keypress)
  function resetGame() {
    // Reset positions
    snakePositions = [168, 169, 170, 171];
    applePositions = 100;

    // Reset game progress
    startTimestamp = undefined;
    lastTimestamp = undefined;
    stepsTaken = -1;
    score = 0;
    contrast = 1;

    // Reset inputs
    inputs = [];

    // Reset header
    contrastElement.innerText = `${Math.floor(contrast * 100)}%`;
    scoreElement.innerText = hardMode ? `H ${score}` : score;

    // Reset tiles
    for (const tile of tiles) setTile(tile);

    // Render apple
    setTile(tiles[applePositions], {
      "background-color": color,
      "border-radius": "50%"
    });

    // Render snake
    // Ignore the last part (the snake just moved out from it)
    for (const i of snakePositions.slice(1)) {
      const snakePart = tiles[i];
      snakePart.style.backgroundColor = color;

      // Set up transition directions for head and tail
      if (i == snakePositions[snakePositions.length - 1]) {
        snakePart.style.left = 0;
      }
      if (i == snakePositions[0]) {
        snakePart.style.right = 0;
      }
    }
  }

  // Handle user inputs (e.g. start the game)
  window.addEventListener("keydown", function(event) {
    // If not an arrow key or space or H was pressed than return
    if (
      ![
        "ArrowLeft",
        "ArrowUp",
        "ArrowRight",
        "ArrowDown",
        " ",
        "H",
        "h",
        "E",
        "e"
      ].includes(event.key)
    )
      return;
    
    // If an arrow key was pressed than first prevent default
    event.preventDefault();

    // If space was pressed restart the game
    if(event.key == " ") {
      resetGame();
      startGame();
      return;
    }

    // Set hard mode
    if(event.key == "H" || event.key == "h") {
      hardMode = true;
      fadeSpeed = 4000;
      fadeExponential = 1.025;
      noteElement.innerHTML = `Hard mode. Press space to start!`;
      noteElement.style.opacity = 1;
      resetGame();
      return;
    }

    // Set Easy mode
    if(event.key == "E" || event.key == "e") {
      hardMode = false;
      fadeSpeed = 5000;
      fadeExponential = 1.024;
      noteElement.innerHTML = `Easy mode. Press space to start!`;
      noteElement.style.opacity = 1;
      resetGame();
      return;
    }

    // If an arrow key was pressed add the direction to the next moves
    // Do not allow to add the same direction twice consecutively
    // The snake can't do a full turn either
    // Also start the game if it hasn't started yet
    if(
      event.key == "ArrowLeft" &&
      inputs[inputs.length - 1] != "left" &&
      headDirection() != "right"
    ) {
      inputs.push("left");
      if(!gameStarted) startGame();
      return;
    }
    if(
      event.key == "ArrowUp" &&
      inputs[inputs.length - 1] != "up" &&
      headDirection() != "down"
    ) {
      inputs.push("up");
      if(!gameStarted) startGame();
      return;
    }
    if(
      event.key == "ArrowRight" &&
      inputs[inputs.length - 1] != "right" &&
      headDirection() != "left"
    ) {
      inputs.push("right");
      if(!gameStarted) startGame();
      return;
    }
    if(
      event.key == "ArrowDown" &&
      inputs[inputs.length - 1] != "down" &&
      headDirection() != "up"
    ) {
      inputs.push("down");
      if(!gameStarted) startGame();
      return;
    }
  });

  // Start the game
  function startGame() {
    gameStarted = true;
    noteElement.style.opacity = 0;
    window.requestAnimationFrame(main);
  }
})