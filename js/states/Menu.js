var Menu = function () {
};

Menu.prototype = {

    preload: function () {
        this.optionCount = 1;
        game.load.image("background", "assets/images/party.jpg");

    },

    addMenuOption: function (text, callback) {
        let style = {font: '30pt Kremlin', fill: 'white', align: 'left', stroke: 'rgba(0,0,0,0)', srokeThickness: 4};
        let txt = game.add.text(30, (this.optionCount * 80) + 200, text, style);
        txt.stroke = "rgba(0,0,0,0";
        txt.strokeThickness = 4;
        let onOver = function (target) {
            target.fill = "#FEFFD5";
            target.stroke = "rgba(200,200,200,0.5)";
            txt.useHandCursor = true;
        };
        let onOut = function (target) {
            target.fill = "white";
            target.stroke = "rgba(0,0,0,0)";
            txt.useHandCursor = false;
        };
        txt.useHandCursor = true;
        txt.inputEnabled = true;
        txt.events.onInputUp.add(callback, this);
        txt.events.onInputOver.add(onOver, this);
        txt.events.onInputOut.add(onOut, this);
        this.optionCount++;
    },

    init: function () {
        this.titleText = game.make.text(game.world.centerX, 100, "Slavistan Revolution", {
            font: 'bold 60pt Kremlin',
            fill: '#FDFFB5',
            align: 'center'
        });
        this.titleText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
        this.titleText.anchor.set(0.5);
        this.optionCount = 1;
    },

    create: function () {
        let bg_img =game.add.image(0, 0, 'background');
        bg_img.width = game.width;
        bg_img.height = game.height;

        game.stage.disableVisibilityChange = true;

        game.add.existing(this.titleText);

        this.addMenuOption('Start', function () {
            game.state.start("Game");

        });
        this.addMenuOption('Options', function () {
            alert("Coming soon...");
        });

    }
};