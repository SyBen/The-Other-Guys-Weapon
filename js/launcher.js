var game = new Phaser.Game(832, 576, Phaser.AUTO, 'theGame', { preload: preload, create: create, update:update }, false);

var inputs;

function preload() {
  inputs = game.input.keyboard.createCursorKeys();
  game.load.spritesheet('hero', 'res/hero.png', 32, 45);
  game.load.spritesheet('idleEnemy1', 'res/idle_enemy1.png', 64, 64)
  game.load.image('sandTile', 'res/tile_sand.png');
  game.load.image('fireball', 'res/fireball.png')
  game.load.image('pipe', 'res/pipe.png');
  game.load.image('start', 'res/startbutton2.png');
  game.load.image('firepillar', 'res/firepillar.png');
  game.load.image('brokenPipe', 'res/pipe_destroyed.png');
  game.load.image('musicButton', 'res/sound.png');
  game.load.audio('explosion', 'res/explosion.ogg');
  game.load.audio('fire', 'res/shoot.ogg');
  game.load.audio('music', 'res/bu-golems-of-a-matrix.ogg');
}

var hero;
var enemy;
var fireballs;
var oilPipes;
var FIREPILLAR; //doesn't respect naming convention.
var FP_countdown; //lifespan not working
var death_countdown;
var title = "The Other Guys' Weapon";
var titleIG;
var startButton;
var level;
var music;
var fire;
var explosion;
var volumeButton;

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.tileSprite(0, 0, 832, 576, 'sandTile');
  level = 0;
  createAudio();
  setUpMenu();

}

function createAudio() {
  music = game.add.audio('music');
  music.loop=true;
  music.play();
  fire = game.add.audio('fire');
  explosion = game.add.audio('explosion');
  fire.volume = 0.7;
  explosion.volume = 0.7;
  music.volume = 1;
  volumeButton = game.add.button(790, 20, "musicButton", muteUnmute, this);
}

var fireballCD = 0;

function update() {
  if (level ==1) {
    checkHeroSpeed();
    game.physics.arcade.overlap(oilPipes, fireballs, LETBEFIRE, null,this);
    game.physics.arcade.overlap(fireballs, hero, deathCountdown, null, this);
    game.physics.arcade.collide(hero, oilPipes);

    if(fireballCD++ == 80) {
      throwFireball(416, 128, hero.body.position);
      fireballCD=0;
    }

    if(FP_countdown > 0) {
      FP_countdown--;
      if((hero.body.position.y > (FIREPILLAR.y - 43)) && (hero.body.position.y < (62 + FIREPILLAR.y))) {
        level = 24;
        death_counter=10;
      }
    }
    else {
      FIREPILLAR.kill();
    }

  } else if(level==24) {
    death_counter--;
    if(death_counter == 0) gameOver();
  } else if(level==42) {
    death_counter--;
    if(death_counter == 0) winningScreen();
  }
  
}

function throwFireball (fromx, fromy, toward) {
  fireball = fireballs.getFirstExists(false);
  fireball.exists = true;
  fireball.alive = true;
  fireball.checkWorldBounds = true;
  fireball.outOfBoundsKill = true;
  fireball.reset(fromx, fromy);
  game.physics.arcade.moveToObject(fireball, hero, 300);
  fire.play();
}

function LETBEFIRE(pipe, fireball) {
  pipe.loadTexture("brokenPipe");
  if(pipe.alive) {
    FIREPILLAR.x=pipe.body.position.x;
    FIREPILLAR.y=pipe.body.position.y;
    FIREPILLAR.revive();
    FP_countdown = 30;
    explosion.play();
  }
  pipe.alive=false;
  fireball.kill();
  if(FIREPILLAR.y == 64) {
    level = 42;
    death_counter = 20;
  }
}

function checkHeroSpeed() {
  hero.body.velocity.setTo(0, 0);
  var lastKey = game.input.keyboard.lastKey;
  
  if(lastKey == inputs.left && lastKey.isDown) {
    hero.body.velocity.x = -40;
    hero.angle = 90;
  }
  else if(lastKey == inputs.right && lastKey.isDown) {
    hero.body.velocity.x = 40;
    hero.angle = -90;
  }
  else if(lastKey == inputs.up && lastKey.isDown) {
    hero.body.velocity.y = -40;
    hero.angle = 180;
  }
  else if(lastKey == inputs.down && lastKey.isDown) {
    hero.body.velocity.y = 40;
    hero.angle = 0;
  }

  if(hero.body.velocity.y == hero.body.velocity.x && hero.body.velocity.x == 0) {
    hero.play("idleHero", 2, true);
  } else {
    hero.play("walkingHero", 2, true);
  }
}

function deathCountdown() {
  hero.body.velocity.setTo(0, 0);
  level = 24;
  death_counter = 60;
  fireballs.visible=true;
}

function gameOver() {
  level = 0;
  hero.kill();
  enemy.kill();
  fireballs.visible=false;
  oilPipes.visible=false;
  FIREPILLAR.visible=false;
  setUpMenu();
}

function winningScreen() {
  hero.kill();
  enemy.kill();
  fireballs.visible=false;
  oilPipes.visible=false;
  FIREPILLAR.visible=false;
  game.add.text(300, 150, "Congratulations!", {font: "22px Courier New", fill: "#000"});
  game.add.text(200, 250, "You won against Evil Blue Snake!", {font: "22px Courier New", fill: "#000"});
}

function setUpMenu () {
  titleIG = game.add.text(300, 150, title, { font: '22px Courier New', fill: '#000' });
  startButton = game.add.button(350, 250, "start", setUpLevelOne, this);
}

function setUpLevelOne() {
  createHero();
  createEnnemy();
  createFireballs();
  createOilPipes();
  createFIREPILLAR();
  if(level==0) {
    titleIG.exists=false;
    startButton.exists=false;
    level=1;
  } 
}

function createHero() {
  hero = game.add.sprite(416, 416, "hero");
  hero.anchor.setTo(0.5, 0.5);
  hero.angle = 180;
  hero.animations.add("walkingHero", [1, 2, 3, 4]);
  hero.animations.add("idleHero", [5, 6, 7, 8]);
  hero.play("idleHero", 2, true);
  game.physics.enable(hero, Phaser.Physics.ARCADE);
  hero.body.collideWorldBounds = true;
  hero.body.bounce.setTo(1, 1);
}

function createEnnemy() {
  enemy = game.add.sprite(416, 96, "idleEnemy1");
  enemy.anchor.setTo(0.5, 0.5);
  enemy.animations.add("idleEnemy1");
  enemy.play("idleEnemy1", 1, true);
}

function createFireballs() {
  fireballs = game.add.group();
  fireballs.enableBody = true;
  fireballs.createMultiple(3, "fireball", 1);
  fireballs.visible = true;
  fireballs.callAll("setTo", "body.anchor", (0,5, 0,5));
  fireballs.setAllChildren("alive", false);
}

function createOilPipes() {
  oilPipes = game.add.group();
  oilPipes.enableBody = true;
  oilPipes.createMultiple(9, "pipe", 1, true);
  for(var i = 0;i < 9;i++) {
    oilPipes.xy(i, 0, i*64);
  }
  oilPipes.setAllChildren("alive", true);
  oilPipes.setAllChildren("body.immovable", true);
}

function createFIREPILLAR() {
  FIREPILLAR = game.add.image(0, 0, "firepillar");
  FIREPILLAR.kill();
}

function muteUnmute() {
    fire.volume = - (fire.volume - 0.7);
    explosion.volume = - (explosion.volume - 0.7);
    music.volume = - (music.volume - 1);
}