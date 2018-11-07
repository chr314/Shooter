var Game = function () {
};

var cursors;
var fireButton;

var ACCLERATION = 1000;
var DRAG = 400;
var MAXSPEED = 400;

var MIN_ENEMY_SPACING = 300;
var MAX_ENEMY_SPACING = 3000;
Game.prototype = {


    preload: function () {
        game.load.image('starfield', 'assets/starfield.png');
        game.load.image('adidas', 'assets/bullets/adidas.png');
        game.load.image('ship', 'assets/ultragopnik.png');
        game.load.image('bullet', 'assets/bullets/mayonnaise.png');
        game.load.image('trump-bullet', 'assets/bullets/bullet.png');

        game.load.image('enemy-murica', 'assets/enemies/murica.png');
        game.load.image('enemy-trump', 'assets/enemies/trump.png');

        game.load.spritesheet('explosion', 'assets/explode.png', 128, 128);
        game.load.bitmapFont('ourfont', 'assets/ourfont/great-font.png', 'assets/ourfont/great-font.fnt');
        game.load.audio('pain', 'assets/audio/pain.mp3');
        game.load.audio('bullet-sound', 'assets/audio/bullet.mp3');

    },

    create: function () {
        var self = this;
        game.scale.pageAlignHorizontally = true;

        //  The scrolling starfield background
        this.starfield = game.add.tileSprite(0, 0, game.width, game.height, 'starfield');

        //  Our bullet group
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 1);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);
        this.bulletTimer = 0;
        //  The hero!
        this.player = game.add.sprite(100, game.height / 2, 'ship');
        this.player.health = 100;
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
        this.player.body.drag.setTo(DRAG, DRAG);
        this.player.events.onKilled.add(function () {
            self.shipTrail.kill();
        });
        this.player.events.onRevived.add(function () {
            self.shipTrail.start(false, 5000, 10);
        });

        //  And some controls to play the game with
        cursors = game.input.keyboard.createCursorKeys();
        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //  Add an emitter for the ship's trail
        this.shipTrail = game.add.emitter(this.player.x - 200, this.player.y, 200);
        this.shipTrail.height = 10;
        this.shipTrail.makeParticles('adidas');
        this.shipTrail.setYSpeed(20, -20);
        this.shipTrail.setXSpeed(-140, -120);
        this.shipTrail.setRotation(50, -50);
        this.shipTrail.setAlpha(1, 0.01, 800);
        this.shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000,
            Phaser.Easing.Quintic.Out);
        this.shipTrail.start(false, 5000, 10);


        this.muricaEnemies = game.add.group();
        this.muricaEnemies.enableBody = true;
        this.muricaEnemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.muricaEnemies.createMultiple(5, 'enemy-murica');
        this.muricaEnemies.setAll('anchor.x', 0.5);
        this.muricaEnemies.setAll('anchor.y', 0.5);
        this.muricaEnemies.setAll('scale.x', 0.25);
        this.muricaEnemies.setAll('scale.y', 0.25);
        this.muricaEnemies.setAll('angle', 0);
        this.muricaEnemies.forEach(function (enemy) {
            self.addEnemyEmitterTrail(enemy);
            enemy.damageAmount = 20;
            enemy.body.setSize(enemy.width * 3 / 4, enemy.height * 3 / 4, 40, 100);
            enemy.body.offsetX = 55;
            enemy.events.onKilled.add(function () {
                enemy.trail.kill();
            });
        });

        game.time.events.add(1000, this.launchMuricaEnemy, this);


        this.trumpEnemies = game.add.group();
        this.trumpEnemies.enableBody = true;
        this.trumpEnemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.trumpEnemies.createMultiple(5, 'enemy-trump');
        this.trumpEnemies.setAll('anchor.x', 0.5);
        this.trumpEnemies.setAll('anchor.y', 0.5);
        this.trumpEnemies.setAll('scale.x', 0.3);
        this.trumpEnemies.setAll('scale.y', 0.3);
        this.trumpEnemies.setAll('angle', 0);
        this.trumpEnemies.forEach(function (enemy) {
            self.addEnemyEmitterTrail(enemy);
            enemy.damageAmount = 40;
            enemy.events.onKilled.add(function () {
                enemy.trail.kill();
            });
        });

        this.trumpEnemySpacing = 3000;
        this.trumpEnemyLaunched = false;

        this.trumpEnemyBullets = game.add.group();
        this.trumpEnemyBullets.enableBody = true;
        this.trumpEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.trumpEnemyBullets.createMultiple(30, 'trump-bullet');
        this.trumpEnemyBullets.setAll('anchor.x', 0.5);
        this.trumpEnemyBullets.setAll('anchor.y', 0.5);
        this.trumpEnemyBullets.setAll('outOfBoundsKill', true);
        this.trumpEnemyBullets.setAll('checkWorldBounds', true);
        this.trumpEnemyBullets.forEach(function (enemy) {
            enemy.body.setSize(20, 20);
        });

        //  An explosion pool
        this.explosions = game.add.group();
        this.explosions.enableBody = true;
        this.explosions.physicsBodyType = Phaser.Physics.ARCADE;
        this.explosions.createMultiple(30, 'explosion');
        this.explosions.setAll('anchor.x', 0.5);
        this.explosions.setAll('anchor.y', 0.5);
        this.explosions.forEach(function (explosion) {
            explosion.animations.add('explosion');
        });

        this.pain = game.add.audio('pain');
        this.pain.loop = false;

        this.bulletSound = game.add.audio('bullet-sound');
        this.bulletSound.loop = false;


        this.hp = game.add.text(game.world.width - 150, 10, 'HP: ' + this.player.health + '%', {
            font: '20px Kremlin',
            fill: '#fff'
        });
        this.hp.render = function () {
            self.hp.text = 'HP: ' + Math.max(self.player.health, 0) + '%';
        };

        this.score = 0;
        this.scoreText = game.add.text(10, 10, '', {font: '20px Kremlin', fill: '#fff'});
        this.scoreText.render = function () {
            self.scoreText.text = 'Score: ' + self.score;
        };
        this.scoreText.render();

        this.gameOver = game.add.bitmapText(game.world.centerX, game.world.centerY, 'ourfont', 'now go back to gulag!', 100);
        this.gameOver.anchor.setTo(0.5, 0.5);
        this.gameOver.visible = false;
    },

    launchMuricaEnemy: function () {

        var ENEMY_SPEED = -300;

        var enemy = this.muricaEnemies.getFirstExists(false);
        if (enemy) {
            enemy.reset(game.width + 20, game.rnd.integerInRange(0, game.height));
            enemy.body.velocity.x = ENEMY_SPEED;
            enemy.body.velocity.y = game.rnd.integerInRange(-100, 100);
            enemy.body.drag.y = 100;

            enemy.trail.start(false, 800, 1);
            var self = this;
            enemy.update = function () {
                //enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));

                enemy.trail.x = enemy.x;
                enemy.trail.y = enemy.y - 10;

                //  Kill enemies once they go off screen
                if (enemy.x < -100) {
                    if (enemy.alive) {
                        self.score -= enemy.damageAmount * 15;
                        self.scoreText.render();
                    }
                    enemy.kill();
                }
            }
        }

        //  Send another enemy soon
        this.muricaEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(MIN_ENEMY_SPACING, MAX_ENEMY_SPACING), this.launchMuricaEnemy, this);
    },

    launchTrumpEnemy: function () {
        var startingY = game.rnd.integerInRange(100, game.height - 100);
        var horizontalSpeed = -180;
        var spread = 60;
        var frequency = 70;
        var verticalSpacing = 70;
        var numEnemiesInWave = 5;
        var self = this;
        //  Launch wave
        for (var i = 0; i < numEnemiesInWave; i++) {
            var enemy = this.trumpEnemies.getFirstExists(false);
            if (enemy) {
                enemy.startingY = startingY;
                enemy.reset(game.width + verticalSpacing * i, game.height / 2);
                enemy.body.velocity.x = horizontalSpeed;

                enemy.bullets = 1;
                enemy.lastShot = 0;

                //  Update function for each enemy
                enemy.update = function () {
                    //  Wave movement
                    this.body.y = this.startingY + Math.sin((this.x) / frequency) * spread;

                    //  Squish and rotate ship for illusion of "banking"
                    bank = Math.cos((this.x + 60) / frequency);
                    this.scale.y = 0.5 - Math.abs(bank) / 8;

                    enemyBullet = self.trumpEnemyBullets.getFirstExists(false);
                    if (enemyBullet &&
                        this.alive &&
                        this.bullets &&
                        this.y > game.width / 8 &&
                        game.time.now > 2000 + this.lastShot) {
                        this.lastShot = game.time.now;
                        this.bullets--;
                        enemyBullet.reset(this.x, this.y + this.height / 2);
                        enemyBullet.damageAmount = this.damageAmount;
                        var angle = game.physics.arcade.moveToObject(enemyBullet, self.player, 400);
                        enemyBullet.angle = game.math.radToDeg(angle);
                    }

                    //  Kill enemies once they go off screen
                    if (this.x < -200) {
                        this.kill();
                    }
                };
            }
        }

        //  Send another wave soon
        this.trumpEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(this.trumpEnemySpacing, this.trumpEnemySpacing + 3000), this.launchTrumpEnemy, this);

    },

    addEnemyEmitterTrail: function (enemy) {
        var enemyTrail = game.add.emitter(enemy.x, this.player.y - 10, 100);
        enemyTrail.width = 10;
        enemyTrail.makeParticles('explosion', [1, 2, 3, 4, 5]);
        enemyTrail.setXSpeed(20, -20);
        enemyTrail.setRotation(50, -50);
        enemyTrail.setAlpha(0.4, 0, 800);
        enemyTrail.setScale(0.01, 0.1, 0.01, 0.1, 1000, Phaser.Easing.Quintic.Out);
        enemy.trail = enemyTrail;


    },

    shipCollide: function (player, enemy) {
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
        explosion.body.velocity.y = enemy.body.velocity.y;
        explosion.alpha = 0.7;
        this.pain.play();
        explosion.play('explosion', 30, false, true);

        enemy.kill();
        player.damage(enemy.damageAmount);
        this.hp.render();
    },


    hitEnemy: function (enemy, bullet) {
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(bullet.body.x + bullet.body.halfWidth, bullet.body.y + bullet.body.halfHeight);
        explosion.body.velocity.y = enemy.body.velocity.y;
        explosion.alpha = 0.7;
        this.pain.play();

        explosion.play('explosion', 30, false, true);

        enemy.kill();
        bullet.kill();
        this.score += enemy.damageAmount * 10;
        this.scoreText.render();

        this.trumpEnemySpacing *= 0.9;
        //  Blue enemies come in after a score of 1000
        if (!this.trumpEnemyLaunched && this.score > 1000) {
            this.trumpEnemyLaunched = true;
            this.launchTrumpEnemy();
        }
    },

    update: function () {

        //  Scroll the background
        this.starfield.tilePosition.x -= 2;

        //  Reset the this.player, then check for movement keys
        this.player.body.acceleration.y = 0;
        this.player.body.acceleration.x = 0;

        if (cursors.up.isDown) {
            this.player.body.acceleration.y = -ACCLERATION;
        } else if (cursors.down.isDown) {
            this.player.body.acceleration.y = ACCLERATION;
        } else if (cursors.left.isDown) {
            this.player.body.acceleration.x = -ACCLERATION;
        } else if (cursors.right.isDown) {
            this.player.body.acceleration.x = ACCLERATION;
        }

        //  Stop at screen edges
        if (this.player.x > game.width - 30) {
            this.player.x = game.width - 30;
            this.player.body.acceleration.x = 0;
        }
        if (this.player.x < 30) {
            this.player.x = 30;
            this.player.body.acceleration.x = 0;
        }
        if (this.player.y > game.height - 15) {
            this.player.y = game.height - 15;
            this.player.body.acceleration.y = 0;
        }
        if (this.player.y < 15) {
            this.player.y = 15;
            this.player.body.acceleration.y = 0;
        }

        //  Fire bullet
        if (this.player.alive && fireButton.isDown) {
            this.fireBullet();
        }

        //  Keep the shipTrail lined up with the ship
        this.shipTrail.y = this.player.y;
        this.shipTrail.x = this.player.x - 20;

        game.physics.arcade.overlap(this.player, this.muricaEnemies, this.shipCollide, null, this);
        game.physics.arcade.overlap(this.muricaEnemies, this.bullets, this.hitEnemy, null, this);

        game.physics.arcade.overlap(this.player, this.trumpEnemies, this.shipCollide, null, this);
        game.physics.arcade.overlap(this.trumpEnemies,this.bullets, this.hitEnemy, null, this);

        game.physics.arcade.overlap(this.trumpEnemyBullets, this.player, this.enemyHitsPlayer, null, this);

        if (!this.player.alive && this.gameOver.visible === false) {
            this.gameOver.visible = true;
            var fadeInGameOver = game.add.tween(this.gameOver);
            fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
            fadeInGameOver.onComplete.add(setResetHandlers);
            fadeInGameOver.start();

            var self = this;

            function setResetHandlers() {
                //  The "click to restart" handler
                var tapRestart = game.input.onTap.addOnce(_restart, this);
                var spaceRestart = fireButton.onDown.addOnce(_restart, this);

                function _restart() {
                    tapRestart.detach();
                    spaceRestart.detach();
                    self.restart();
                }
            }
        }

    },

    enemyHitsPlayer: function (player, bullet) {
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
        bullet.kill();

        player.damage(bullet.damageAmount);
        this.hp.render()
    },

    restart: function () {
        //  Reset the enemies
        this.muricaEnemies.callAll('kill');
        game.time.events.remove(this.muricaEnemyLaunchTimer);
        this.muricaEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(MIN_ENEMY_SPACING, MAX_ENEMY_SPACING), this.launchMuricaEnemy, this);

        this.trumpEnemies.callAll('kill');
        game.time.events.remove(this.trumpEnemyLaunchTimer);
        this.trumpEnemyBullets.callAll('kill');
        //  Revive the player
        this.player.revive();
        this.player.health = 100;
        this.hp.render();
        this.score = 0;
        this.scoreText.render();

        //  Hide the text
        this.gameOver.visible = false;

        this.trumpEnemySpacing = 1000;
        this.trumpEnemyLaunched = false;

    },

    render: function () {
        for (var i = 0; i < this.muricaEnemies.length; i++) {
            game.debug.body(this.muricaEnemies.children[i]);
        }
        for (var i = 0; i < this.trumpEnemies.length; i++) {
            game.debug.body(this.trumpEnemies.children[i]);
        }
        for (var i = 0; i < this.trumpEnemyBullets.length; i++) {
            game.debug.body(this.trumpEnemyBullets.children[i]);
        }
        game.debug.body(this.player);

    },

    fireBullet: function () {
        //  To avoid them being allowed to fire too fast we set a time limit
        if (game.time.now > this.bulletTimer) {
            var BULLET_SPEED = 500;
            var BULLET_SPACING = 250;
            //  Grab the first bullet we can from the pool
            this.bulletSound.play();
            var bullet = this.bullets.getFirstExists(false);

            if (bullet) {
                //  And fire it
                //  Make bullet come out of tip of ship with right angle
                var bulletOffset = 20 * Math.sin(game.math
                    .degToRad(this.player.angle));
                bullet.reset(this.player.x + bulletOffset, this.player.y);
                bullet.angle = this.player.angle;
                game.physics.arcade.velocityFromAngle(bullet.angle,
                    BULLET_SPEED, bullet.body.velocity);
                bullet.body.velocity.y += this.player.body.velocity.y;

                this.bulletTimer = game.time.now + BULLET_SPACING;
            }
        }
    }

}
