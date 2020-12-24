var config = {
  type: Phaser.WEBGL,
  width: 1000,
  height: 650,
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
const body = document.querySelector('body')

function preload() {

  this.load.image("xmas-background", "assets/xmas-background.png");
  this.load.image("ground", "assets/platform.png");
  this.load.spritesheet("ghoul1", "assets/pumpkin-man.png", {
    frameWidth: 30,
    frameHeight:33
  });
  this.load.spritesheet("ghoul2", "assets/white-ghost.png", {
    frameWidth: 30,
    frameHeight:34
  });
  
  
  this.load.image("treasure", "assets/treasure-chest.png");



  this.load.spritesheet("santa", "assets/santa-sprite.png", {
    frameWidth: 50,
    frameHeight: 85
  });
  
}

let platforms;
let score = 0;
let scoreText;

function create() {
  
  this.add.image(10, 30, "treasure");


  //creates xmas-background
  this.add.image(100, 300, "xmas-background");

  //Ground and platforms grouped together
  platforms = this.physics.add.staticGroup();

  //creates the main bottom ground that spans across entire width
  platforms
    .create(400, 658, "ground")
    .setScale(3)
    .refreshBody();

  //creates the platforms
    //Bottom left
  platforms.create(30, 490, "ground");
    //Top Left
  platforms.create(-100, 350, "ground");
    //Bottom Right
  platforms.create(800, 400, "ground");
    //Top Right
  platforms.create(950, 220, "ground");

  // Player creation
  // creates character and where on the x, axis it should spawn
  player = this.physics.add.sprite(100, 450, "santa");

  //initial load bounce
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // using the animations in the spritesheet

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("santa", { start: 3, end: 5 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "santa", frame: 1 }],
    frameRate: 20
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("santa", { start: 6, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // this is needed so the character doesnt go through the platform
  this.physics.add.collider(player, platforms);

  //   add treasure
  treasures = this.physics.add.group({
    key: "treasure",
    repeat: 5,
    setXY: { x: 55, y: 0, stepX: 65 },
  });

    // treasure = this.physics.add.sprite(10, 45, "treasure");
  treasures.children.iterate(function(child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.6));
  });

  this.physics.add.collider(treasures, platforms);
  this.physics.add.overlap(player, treasures, collectTreasure, null, this);

  //collect treasures and release ghouls
  function collectTreasure(player, treasure) {
    treasure.disableBody(true, true);

    score += 10;
    scoreText.setText("Score: " + score);

    // When the player gets all of the items then repopulate items and create enemies
    if (treasures.countActive(true) === 0) {
      treasures.children.iterate(function(child) {
        child.enableBody(true, child.x, 0, true, true);
      });

      var x =
        player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

    //create enemies          
      var ghoul1 = ghouls.create(x, 16, "ghoul1");
      var ghoul2 = ghouls.create(x, 5, "ghoul2");

      ghoulBounce(ghoul1);
      ghoulBounce(ghoul2);

      function ghoulBounce(ghoul) {
        ghoul.setBounce(1);
        ghoul.setCollideWorldBounds(true);
        ghoul.setVelocity(Phaser.Math.Between(-200, 200), 20);
      }
    }
  }

  //score
  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fill: "red"
  });

  //ghouls
  ghouls = this.physics.add.group();

  this.physics.add.collider(ghouls, platforms);

  this.physics.add.collider(player, ghouls, hitGhoul, null, this);

  function hitGhoul(player, ghoul) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play("turn");

    gameOver = true;


  }
}

//Player movement/controls

function update() {
  cursors = this.input.keyboard.createCursorKeys();
  spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  if (cursors.left.isDown) {
    player.setVelocityX(-180);

    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(180);

    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);

    player.anims.play("turn");
  }

  if (spacebar.isDown && player.body.touching.down) {
    player.setVelocityY(-300);
  }
}
