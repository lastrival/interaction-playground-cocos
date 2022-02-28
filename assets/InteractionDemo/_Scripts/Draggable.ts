
import { _decorator, Component, Node, MeshCollider } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

/**
 * Predefined variables
 * Name = Draggable
 * DateTime = Tue Feb 22 2022 13:19:18 GMT+0530 (India Standard Time)
 * Author = bfv68905
 * FileBasename = Draggable.ts
 * FileBasenameNoExtension = Draggable
 * URL = db://assets/_Scripts/Draggable.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

@ccclass('Draggable')
@requireComponent(MeshCollider)
export class Draggable extends Component {
    @property({ type: Node })
    root: Node;

    static selected: Draggable;

    start() {
        if (this.root == null) {
            this.root = this.node;
        }
    }

    onSelected() {

    }

    onDeselected() {

    }

}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/en/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/en/scripting/life-cycle-callbacks.html
 */
