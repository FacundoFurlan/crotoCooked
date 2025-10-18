import { Interactuables } from "./Interactuables";

export class LibroRecetario extends Interactuables{
    constructor(scene, x, y){
        super(scene, x, y, "libroReceta");

        this.scene = scene;
        this.recetario = scene.recetario;
    }

    onInteract(){
        this.recetario.onInput();
    }
}