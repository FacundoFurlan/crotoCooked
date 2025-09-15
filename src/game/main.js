import { Game as MainGame } from './scenes/Game';
import { AUTO, Scale,Game, Physics } from 'phaser';
import { MainMenu } from './scenes/MainMenu';
import { HUD } from './scenes/HUD';
import { Victory } from './scenes/Victory';
import { Defeat } from './scenes/Defeat';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    width: 640, //640
    height: 360,    //360
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: 0},
            debug: false
        }
    },
    render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true,
    },
    scene: [
        MainMenu,
        MainGame,
        HUD,
        Victory,
        Defeat
    ]
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
}

export default StartGame;
