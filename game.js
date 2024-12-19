const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Gravity for the jump
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let platforms;
let cursors;
let coins;
let goombas;
let collectedCoinsText;
let totalCoins = 0;

function preload() {
    // Preload Mario and Goomba assets (you can replace these with your own assets)
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('coin', 'https://labs.phaser.io/assets/sprites/coin.png');
    this.load.image('goomba', 'https://www.phaser.io/content/images/goomba.png');
    this.load.spritesheet('player', 'https://www.phaser.io/content/images/mario.png', { frameWidth: 32, frameHeight: 32 }); // Placeholder Mario sprite
}

function create() {
    // Background
    this.add.image(400, 300, 'sky');

    // Platforms
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground'); // Extra platform

    // Mario Player
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);

    // Player controls
    cursors = this.input.keyboard.createCursorKeys();

    // Coins group
    coins = this.physics.add.group({
        key: 'coin',
        repeat: 4,
        setXY: { x: 200, y: 0, stepX: 150 }
    });
    coins.children.iterate(coin => {
        coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    this.physics.add.collider(coins, platforms);
    this.physics.add.overlap(player, coins, collectCoin, null, this);

    // Goombas
    goombas = this.physics.add.group();
    createGoomba(); // Create the first Goomba
    this.physics.add.collider(goombas, platforms);
    this.physics.add.collider(player, goombas, hitGoomba, null, this);

    // Coin collection text
    collectedCoinsText = this.add.text(16, 16, 'Coins: 0', { fontSize: '32px', fill: '#fff' });
}

function update() {
    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    // Jumping
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330); // Jump force
    }

    // Update Goomba movement
    goombas.children.iterate(goomba => {
        goomba.setVelocityX(-50); // Goomba walking left
    });
}

// Collecting coins
function collectCoin(player, coin) {
    coin.disableBody(true, true); // Disable the coin when collected
    totalCoins += 1;
    collectedCoinsText.setText('Coins: ' + totalCoins);

    // Spawn a new coin after a coin is collected
    if (coins.countActive(true) === 0) {
        coins.children.iterate(coin => {
            coin.enableBody(true, coin.x, 0, true, true);
        });
    }
}

// Creating Goomba enemy
function createGoomba() {
    const goomba = goombas.create(Phaser.Math.Between(100, 700), 0, 'goomba');
    goomba.setBounce(0.2);
    goomba.setCollideWorldBounds(true);
    goomba.setVelocityY(Phaser.Math.Between(50, 100)); // Goomba falls
    goomba.setVelocityX(-50); // Goomba walks left
}

// Handling Goomba collision with player
function hitGoomba(player, goomba) {
    // Simple death/restart on hit
    player.setPosition(100, 450); // Reset player position (simple restart logic)
    goomba.setActive(false);
    goomba.setVisible(false);
}
