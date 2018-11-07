var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'game'),
    Main = function () {
    },
    gameOptions = {
        playSound: true,
        playMusic: true
    },
    musicPlayer,
    debuging = false;


Main.prototype = {

    preload: function () {
        //game.load.baseURL = 'https://chr314.github.io/Shooter/';
        //game.load.crossOrigin = 'anonymous';
        game.load.image('loading',  'assets/images/loading.png');
        game.load.script('utils', 'js/lib/utils.js');
        game.load.script('Splash', 'js/states/Splash.js');

    },

    create: function () {
        game.state.add('Splash', Splash);
        game.state.start('Splash');
    }

};

document.addEventListener("DOMContentLoaded", function () {
    game.state.add('Main', Main);
    game.state.start('Main');
});


