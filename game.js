const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Gravity to simulate jumping
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
let bullets;
let lastFired = 0;
let robots;
let rescuedRobotsText;
let robotRescueCount = 0;

function preload() {
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/ball.png');
    this.load.image('robot', 'https://labs.phaser.io/assets/sprites/mushroom2.png');
    this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    // Background
    this.add.image(400, 300, 'sky');

    // Platforms (ground)
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    // Player
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);

    // Keyboard controls
    cursors = this.input.keyboard.createCursorKeys();

    // Bullet group
    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 10
    });

    // Create falling robots
    robots = this.physics.add.group();
    createRobot(); // Initial robot spawn

    // Collision detection between robots and bullets
    this.physics.add.collider(bullets, robots, hitRobot, null, this);

    // Collision between player and robots (if player is hit)
    this.physics.add.collider(player, robots, hitPlayer, null, this);

    // Text to show rescued robot count
    rescuedRobotsText = this.add.text(16, 16, 'Robots Destroyed: 0', {
        fontSize: '32px',
        fill: '#fff'
    });
}

function update(time, delta) {
    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-160); // Move left
    } else if (cursors.right.isDown) {
        player.setVelocityX(160); // Move right
    } else {
        player.setVelocityX(0); // Stop horizontally
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330); // Jump
    }

    // Shooting bullets
    if (cursors.space.isDown && time > lastFired) {
        lastFired = time + 200; // Fire a bullet every 200ms
        fireBullet();
    }

    // Move robots down the screen
    robots.getChildren().forEach(robot => {
        robot.setVelocityY(100); // Robots falling at a constant speed
    });
}

// Create a new robot that will fall
function createRobot() {
    const x = Phaser.Math.Between(100, 700);
    const robot = robots.create(x, 0, 'robot');
    robot.setBounce(0.5);
    robot.setCollideWorldBounds(true);
    robot.setVelocityY(Phaser.Math.Between(50, 100));
}

// Fire a bullet from the player's position
function fireBullet() {
    const bullet = bullets.get();
    if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setPosition(player.x + 20, player.y - 20);
        bullet.setVelocityX(300); // Bullet speed
    }
}

// Handle collision between bullet and robot
function hitRobot(bullet, robot) {
    bullet.setActive(false);
    bullet.setVisible(false);
    robot.setActive(false);
    robot.setVisible(false);

    // Increase robot destruction count
    robotRescueCount++;
    rescuedRobotsText.setText('Robots Destroyed: ' + robotRescueCount);

    // Create a new robot after one is destroyed
    createRobot();
}

// Handle player being hit by a robot
function hitPlayer(player, robot) {
    // Simple player death logic (for now, just restart)
    player.setPosition(100, 450); // Reset player position
    robot.setActive(false);
    robot.setVisible(false);
}
