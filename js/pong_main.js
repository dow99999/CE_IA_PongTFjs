window.onload = () => {
  main();
}

const MOTION_BLUR = "99"; // From 00 to FF
const TRAINING_GAMES = 5;

let canvas;
let ctx;
let game_objects = [];

let left_wall_counter
let right_wall_counter
let left_pong_counter
let right_pong_counter

let pong_user = null;
let pong_cpu = null;
let ball = null;

let playing = false;

let data = [];
let labels = [];

let model = null;
let games_played = 0;

let frame_counter = 0;









function saveFrameData() {
  data.push([
    pong_user._y,
    pong_cpu._y,
    ball._x,
    ball._y,
    ball.velX,
    ball.velY
  ]);

  labels.push([
    (pong_user.velY > 0) ? 1 : -1,
    (pong_user.velY == 0) ? 1 : -1,
    (pong_user.velY < 0) ? 1 : -1
  ])
}



async function learn() {
  document.getElementById("brain").innerText = "Learning...";
  console.log("Started learning...");

  console.log(await model.fit(tf.tensor(data), tf.tensor(labels), {
    epochs: 10,
    batchSize: 128
  }));

  console.log("Learned Model!");
}

async function downloadModel() {
  await model.save('downloads://pong.mdl');
}

async function loadModel() {
  let file_model = document.getElementById("model-file").files[0]
  let file_weights = document.getElementById("weights-file").files[0]
  model = await tf.loadLayersModel(tf.io.browserFiles([file_model, file_weights]));
}



async function CPUPlay(target_pong) {
  if(games_played >= TRAINING_GAMES) {
    await modelControl(target_pong)
  } else {
    await placeholderControl(target_pong)
  }
}


async function placeholderControl(target_pong) {
  if(ball._y < target_pong._y) {
    target_pong.velY = -5
  } else {
    target_pong.velY = 5
  }
}

async function modelControl(target_pong) {
  let prediction = model.predict(tf.tensor([[
    pong_user._y,
    pong_cpu._y,
    ball._x,
    ball._y,
    ball.velX,
    ball.velY
  ]]))
  prediction = (await prediction.array())[0];

  document.getElementById("brain").innerText = "d: " + prediction[0] + " | s: " + prediction[1] + " | u: " + prediction[2]

  let m = 0;
  let im = 0;
  for (let i = 0; i < prediction.length; i++) {
    if (prediction[i] >= m) {
      m = prediction[i]
      im = i;
    }
  }

  switch (im) {
    case 0:
      target_pong.velY = 5
      break;
    case 1:
      target_pong.velY = 0
      break;
    case 2:
      target_pong.velY = -5
      break;
  }
}






async function loop() {
  ctx.fillStyle = '#000000' + MOTION_BLUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(canvas.width / 2 - 10, 0, 10, canvas.height);
  
  document.getElementById("score").innerText = left_wall_counter[0] + " : " + right_wall_counter[0]
  
  for (let i = 0; i < game_objects.length; i++) {
    let obj = game_objects[i];
    
    obj.update();
    obj.collisio(game_objects);
    obj.dibuixar();
  }
  
  if(games_played <= TRAINING_GAMES && (frame_counter % 100) == 0) {
    saveFrameData();
  }
  
  // Autoplay:
  // await placeholderControl(pong_user)
  await CPUPlay(pong_cpu);
  // await CPUPlay(pong_user);
  
  // await new Promise(r => setTimeout(r, 100));
  
  if (playing)
  requestAnimationFrame(loop);
  
  if (left_wall_counter > 2 || right_wall_counter > 2) {
    playing = false;
  }

  frame_counter++;
}







function setupGame() {
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');
  game_objects = [];

  left_wall_counter = [0]
  right_wall_counter = [0]
  left_pong_counter = [0]
  right_pong_counter = [0]

  // Fullscreen
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Set initial color
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // canvas.addEventListener('click', event =>
  // {
  //     let bound = canvas.getBoundingClientRect();
  //     let y = event.clientY - bound.top - canvas.clientTop;
  
  //     if(y < pong_user._y) {
  //       pong_user.velY = -5
  //     } else {
  //       pong_user.velY = 5
  //     }

  //     console.log(y)
  // });

  document.getElementsByTagName("html")[0].addEventListener("keydown", (event) => {
    switch (event.keyCode) {
      case 38:
        pong_user.velY = -5
        break;
      case 40:
        pong_user.velY = 5
        break;
    }
  })
  document.getElementsByTagName("html")[0].addEventListener("keyup", (event) => {
    pong_user.velY = 0
  })

  document.getElementById("brain").innerText = "Getting game data " + games_played + "/" + TRAINING_GAMES;

  // WALLS
  game_objects.push(new Pong(ctx, 10, Number.parseInt(canvas.height / 2), 0, "#333333", 20, canvas.height, left_wall_counter));
  game_objects.push(new Pong(ctx, canvas.width - 10, Number.parseInt(canvas.height / 2), 0, "#333333", 20, canvas.height, right_wall_counter));

  // PONGS
  pong_user = new Pong(ctx, 50, Number.parseInt(canvas.height / 2), 0, "#FFFFFF", 20, 200, left_pong_counter)
  pong_cpu = new Pong(ctx, canvas.width - 50, Number.parseInt(canvas.height / 2), 0, "#FFFFFF", 20, 200, right_pong_counter)
  game_objects.push(pong_user);
  game_objects.push(pong_cpu);

  // BALL
  ball = new Ball(ctx, Number.parseInt(canvas.width / 2), Number.parseInt(canvas.height / 2), 5, Number.parseInt((Math.random() * 10) - 5), "#FFFFFF", 10);
  game_objects.push(ball);
}


function startGame() {
  requestAnimationFrame(loop);
  playing = true;
}















async function main() {
  tf.setBackend('webgl');

  model = tf.sequential();
  model.add(tf.layers.dense({ units: 256, inputShape: [6], activation: 'tanh' })); // input is a 1x6
  model.add(tf.layers.dense({ units: 512, inputShape: [256], activation: 'tanh' }));
  model.add(tf.layers.dense({ units: 256, inputShape: [512], activation: 'tanh' }));
  model.add(tf.layers.dense({ units: 3, inputShape: [256], activation: 'tanh' })); // returns a 1x1
  const learningRate = 0.001;
  const optimizer = tf.train.adam(learningRate);
  model.compile({ loss: 'meanSquaredError', optimizer: optimizer });

  document.getElementById("load-model").addEventListener("click", () => {
    loadModel();
    games_played = TRAINING_GAMES;
  })

  document.getElementById("reset-game").addEventListener("click", () => {
    playing = false
  })

  while (true) {
    if (games_played == TRAINING_GAMES) {
      await learn();
    }

    setupGame();
    startGame();
    while (playing) {
      await new Promise(r => setTimeout(r, 1000));
    }

    games_played++;
  }
}