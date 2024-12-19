// Set up the Phaser configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Simulate gravity
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Create a new Phaser game instance
const game = new Phaser.Game(config);

let player;
let platforms;
let cursors;
let robotRescueCount = 0;
let rescuedRobotsText;

function preload() {
    // Load the assets (spritesheets, images)
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('robot', 'https://labs.phaser.io/assets/sprites/mushroom2.png');
    this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    // Background
    this.add.image(400, 300, 'sky');

    // Platforms (ground)
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    // Add the player
    player = this.physics.add.sprite(100, 450, 'player');

    // Player physics
    player.setBounce(0.2); // Slight bounce when landing
    player.setCollideWorldBounds(true); // Prevent player from going out of bounds

    // Collide the player with the platforms
    this.physics.add.collider(player, platforms);

    // Add keyboard controls
    cursors = this.input.keyboard.createCursorKeys();

    // Add rescue robot (for simplicity, just one robot to rescue)
    let robot = this.physics.add.sprite(600, 500, 'robot');
    robot.setBounce(0.2);
    this.physics.add.collider(robot, platforms);

    // Detect overlap with player and robot
    this.physics.add.overlap(player, robot, rescueRobot, null, this);

    // Text to show rescued robot count
    rescuedRobotsText = this.add.text(16, 16, 'Robots Rescued: 0', {
        fontSize: '32px',
        fill: '#fff'
    });
}

function update() {
    // Player movement controls
    if (cursors.left.isDown) {
        player.setVelocityX(-160); // Move left
    } else if (cursors.right.isDown) {
        player.setVelocityX(160); // Move right
    } else {
        player.setVelocityX(0); // Stop moving horizontally
    }

    // Player jumping
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330); // Jump
    }
}

// Function to handle rescuing a robot
function rescueRobot(player, robot) {
    // Remove the robot from the screen
    robot.setVisible(false);
    robot.setActive(false);

    // Increment rescued robot count
    robotRescueCount++;
    rescuedRobotsText.setText('Robots Rescued: ' + robotRescueCount);
}
