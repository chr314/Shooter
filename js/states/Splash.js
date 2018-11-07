var Splash = function () {
};
var music;
Splash.prototype = {

    loadScripts: function () {
        game.load.script('WebFont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

        game.load.script('menu', 'js/states/Menu.js');
        game.load.script('game', 'js/states/Game.js');

    },

    loadFonts: function () {
        WebFontConfig = {
            custom: {
                families: ['Kremlin'],
                urls: ['assets/style/kremlin.css']
            }
        }
    },

    loadBgm: function () {
        game.load.audio('hardbass', 'assets/audio/hardbass.mp3');
    },

    loadImages: function () {

    },


    init: function () {
        this.loadingBar = game.make.sprite(game.world.centerX - (276 / 2), 400, "loading");
        this.status = game.make.text(game.world.centerX, 380, 'Loading...', {fill: 'white'});
        utils.centerGameObjects([this.status]);
    },

    preload: function () {
        game.add.existing(this.loadingBar);
        game.add.existing(this.status);
        this.load.setPreloadSprite(this.loadingBar);

        this.loadScripts();
        this.loadImages();
        this.loadBgm();
        this.loadFonts();


    },

    addGameStates: function () {
        game.state.add("Menu", Menu);
        game.state.add("Game", Game);
    },

    addGameMusic: function () {
        music = game.add.audio('hardbass');
        music.loop = true;
        music.play();
    },

    create: function () {
        this.status.setText('Ready!');
        this.addGameStates();
        this.addGameMusic();

        setTimeout(function () {
            game.state.start("Menu");
        }, 1000);
    }
};
