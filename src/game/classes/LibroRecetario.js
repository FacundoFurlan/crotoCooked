import { Interactuables } from "./Interactuables";

export class LibroRecetario extends Interactuables{
    constructor(scene, x, y){
        super(scene, x, y, "libroReceta");

        this.scene = scene;
        this.recetario = scene.recetario;

        this.indicador = this.scene.add.image(x, y-20,"indicadorRecetario")
        this.indicador.setDepth(100)
    }

    onInteract(){
        this.recetario.onInput();
        if(this.indicador.visible){
            this.indicador.setVisible(false)
        }
    }
}