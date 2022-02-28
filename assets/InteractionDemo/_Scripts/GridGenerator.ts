
import { _decorator, Component, Node, instantiate, Prefab, Vec3, Vec2, Camera, LabelComponent, input, Input, EventMouse, view } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = GridGenerator
 * DateTime = Sat Feb 05 2022 19:46:53 GMT+0530 (India Standard Time)
 * Author = bfv68905
 * FileBasename = GridGenerator.ts
 * FileBasenameNoExtension = GridGenerator
 * URL = db://assets/_Scripts/GridGenerator.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

@ccclass('GridGenerator')
export class GridGenerator extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    @property({ type: Camera })
    camera: Camera;

    @property({ type: Prefab })
    tile: Prefab;
    @property
    gridSize: Vec2=new Vec2();
    @property
    spacing: number = 0;
    @property({ type: Prefab })
    labelPrefab: Prefab;
    @property({ type: Node })
    labelParent: Node;
    text: LabelComponent;
    label: Node;
    uiPos: Vec3;

    @property({ type: LabelComponent })
    exampleLabel: LabelComponent;

    @property({ type: Node })
    cursor: Node;


    tiles: Array<Node> = [];
    labels: Array<Node> = [];
    position: Vec3 = new Vec3();
    offset: Vec2 = new Vec2();
    spawn: Node;


    start() {
        // [3]

        //input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        this.offset.x = -((this.gridSize.x - this.spacing) * 0.5)
        this.offset.y = (this.gridSize.y * 0.5);
        this.position.x = this.offset.x;
        this.position.z = this.offset.y;

        for (let i = 0; i < this.gridSize.x; i++) {
            for (let j = 0; j < this.gridSize.y; j++) {
                this.spawn = instantiate(this.tile);
                this.spawn.setParent(this.node);
                this.spawn.setPosition(this.position);
                this.tiles.push(this.spawn);

                this.position.x += 1 + this.spacing;
            }
            this.position.x = this.offset.x;
            this.position.z -= (1 + this.spacing);
        }
        this.scheduleOnce(this.spawnLabels, 0.1);
    }

    // update (deltaTime: number) {
    //     // [4]
    // }

    lateUpdate() {
        if (this.labels.length != this.tiles.length) {
            return;
        }

        for (let i = 0; i < this.tiles.length; i++) {
            this.label = this.labels[i];

            const posCache = this.tiles[i].position;
            const pos = this.camera.worldToScreen(new Vec3(posCache.x, posCache.y + 0.5, posCache.z));
            const transformed = this.screenPixelToScreenView(new Vec2(pos.x, pos.y));
            const offsetX = view.getVisibleSize().x * -0.5;
            const offsetY = view.getVisibleSize().y * -0.5;
            const final = new Vec3(transformed.x + offsetX, transformed.y + offsetY, 0);

            this.label.setPosition(this.label.position.lerp(final, 0.8));
        }
    }

    spawnLabels() {

        for (let i = 0; i < this.tiles.length; i++) {
            this.label = instantiate(this.labelPrefab);
            this.label.setParent(this.labelParent);
            const posCache = this.tiles[i].position;
            const pos = this.camera.worldToScreen(new Vec3(posCache.x, posCache.y + 0.5, posCache.z));
            const transformed = this.screenPixelToScreenView(new Vec2(pos.x, pos.y));
            const offsetX = view.getVisibleSize().x * -0.5;
            const offsetY = view.getVisibleSize().y * -0.5;
            this.label.setPosition(new Vec3(transformed.x + offsetX, transformed.y + offsetY, 0));

            const labelValue = this.label.getComponent(LabelComponent);
            labelValue.string = (i + 1).toString();

            this.labels.push(this.label);
        }
    }

    onMouseMove(event: EventMouse) {
        this.exampleLabel.string = 'X : ' + event.getLocationX().toString() + ' Y : ' + event.getLocationY().toString();
        const location = this.screenPixelToScreenView(event.getLocation());
        const offsetX = view.getVisibleSize().x * -0.5;
        const offsetY = view.getVisibleSize().y * -0.5;
        this.cursor.setPosition(new Vec3(location.x + offsetX, location.y + offsetY, 0));
    }


    visiblePosToCanvasOffset(x: number, y: number) {
        const canvasSize = view.getVisibleSize();
        const offsetX = canvasSize.x * -0.5;
        const offsetY = canvasSize.y * -0.5;
        return new Vec3(x + offsetX, y + offsetY, 0);
    }

    screenPixelToScreenView(position: Vec2) {
        const screenSpace = view.getVisibleSizeInPixel();
        const visibleSpace = view.getVisibleSize();
        const normalizedX = position.x / screenSpace.x;
        const normalizedY = position.y / screenSpace.y;
        const transformed = new Vec3(normalizedX * visibleSpace.x, normalizedY * visibleSpace.y, 0);
        return transformed;
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
