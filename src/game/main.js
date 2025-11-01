import { Game as MainGame } from './scenes/Game';
import { AUTO, Scale, Game, Physics } from 'phaser';
import { MainMenu } from './scenes/MainMenu';
import { HUD } from './scenes/HUD';
import { Victory } from './scenes/Victory';
import { Caceria } from './scenes/Caceria';
import { Preloader } from './scenes/Preloader';
import { Load } from './scenes/Load';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    width: 640, //640
    height: 360,    //360
    parent: 'game-container',
    backgroundColor: '#335533',
    input: {
        gamepad: true
    },
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
            fps: 240
        }
    },
    render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true,
    },
    scene: [
        Preloader,
        MainMenu,
        MainGame,
        HUD,
        Victory,
        Caceria,
        Load
    ]
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
}

export default StartGame;
