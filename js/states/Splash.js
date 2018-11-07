var Splash = function () {};
var music;
Splash.prototype = {

    loadScripts: function () {
        game.load.script('WebFont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

        game.load.script('menu','js/states/Menu.js');
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
        //game.load.image('menu-bg', 'assets/images/menu-bg.jpg');
        //game.load.image('options-bg', 'assets/images/options-bg.jpg');
        //game.load.image('gameover-bg', 'assets/images/gameover-bg.jpg');

    },


    init: function () {
        this.loadingBar = game.make.sprite(game.world.centerX-(387/2), 400, "loading");
        this.logo       = game.make.sprite(game.world.centerX, 200, 'brand');
        this.status     = game.make.text(game.world.centerX, 380, 'Loading...', {fill: 'white'});
        //utils.centerGameObjects([this.logo, this.status]);
    },

    preload: function () {
        game.add.sprite(0, 0, 'stars');
        game.add.existing(this.logo).scale.setTo(0.5);
        game.add.existing(this.loadingBar);
        game.add.existing(this.status).anchor.setTo(0.5);
        this.load.setPreloadSprite(this.loadingBar);

        this.loadScripts();
        this.loadImages();
        this.loadBgm();
        this.loadFonts();


    },

    addGameStates: function () {
        game.state.add("Menu",Menu);
        game.state.add("Game",Game);
    },

    addGameMusic: function () {
        music = game.add.audio('hardbass');
        music.loop = true;
        music.play();
    },

    create: function() {
        this.status.setText('Ready!');
        this.addGameStates();
        this.addGameMusic();

        setTimeout(function () {
            game.state.start("Menu");
        }, 1000);
    }
};
