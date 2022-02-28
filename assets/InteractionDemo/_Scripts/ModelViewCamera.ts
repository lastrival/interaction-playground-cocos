
import { _decorator, Component, Node, input, Input, EventMouse, Vec3, math, fragmentText, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ModelViewCamera
 * DateTime = Mon Feb 14 2022 00:16:45 GMT+0530 (India Standard Time)
 * Author = bfv68905
 * FileBasename = ModelViewCamera.ts
 * FileBasenameNoExtension = ModelViewCamera
 * URL = db://assets/_Scripts/ModelViewCamera.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

@ccclass('ModelViewCamera')
export class ModelViewCamera extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;


    @property({ type: Node })
    camera: Node;

    @property
    radius: number = 25;
    @property
    speed: number = 10;

    canRotate: boolean;

    start() {
        // [3]
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);

        this.totalVertical = 35;
        this.setCameraPos();

        this.canRotate = false;
    }

    // update (deltaTime: number) {
    //     // [4]
    // }


    horizontalPlane: Vec3 = new Vec3(0, 0, 0);
    verticalPlane: Vec3 = new Vec3(0, 0, 0);

    xDis: number = 0;
    yDis: number = 0;

    totalVertical: number = 0;
    totalHorizontal: number = 0;

    zoomSpeed = 3;

    onMouseDown(input: EventMouse) {
        if (input.getButton() == 2) {
            this.canRotate = true;
        }
    }

    onMouseUp(input: EventMouse) {
        if (input.getButton() == 2) {
            this.canRotate = false;
        }
    }

    onMouseWheel(input: EventMouse) {
        if (input.getScrollY() < 0) {
            this.radius += 3;
        } else {
            this.radius -= 3;
        }
        if (this.radius < 5) {
            this.radius = 5;
        }
        if (this.radius > 50) {
            this.radius = 50;
        }

        this.setCameraPos();
    }

    onMouseMove(input: EventMouse) {
        if (this.canRotate == false) {
            return;
        }
        if (Vec2.len(input.getDelta()) < 1) {
            return;
        }

        this.xDis = input.movementX;
        this.yDis = input.movementY;

        this.totalHorizontal += this.xDis;
        this.totalVertical -= this.yDis;

        this.setCameraPos();
    }

    setCameraPos() {
        if (this.totalHorizontal < 0 || this.totalHorizontal > 360) {
            if (this.totalHorizontal < 0) {
                this.totalHorizontal = 360 - this.totalHorizontal;
            } else {
                this.totalHorizontal = 0;
            }
        }

        if (this.totalVertical < 0 || this.totalVertical > 70) {
            if (this.totalVertical < 0) {
                this.totalVertical = 0;
            }
            if (this.totalVertical > 70) {
                this.totalVertical = 70;
            }
        }

        this.verticalPlane.y = Math.sin(math.toRadian(this.totalVertical));
        this.verticalPlane.x = Math.cos(math.toRadian(this.totalVertical));
        this.verticalPlane.z = this.verticalPlane.x;

        this.verticalPlane = this.verticalPlane.normalize();

        this.horizontalPlane.x = Math.sin(math.toRadian(this.totalHorizontal)) * this.verticalPlane.x;
        this.horizontalPlane.z = Math.cos(math.toRadian(this.totalHorizontal)) * this.verticalPlane.z;
        this.horizontalPlane.y = this.verticalPlane.y;

        this.horizontalPlane = this.horizontalPlane.normalize();
        this.horizontalPlane.x = this.horizontalPlane.x * this.radius;
        this.horizontalPlane.y = this.horizontalPlane.y * this.radius;
        this.horizontalPlane.z = this.horizontalPlane.z * this.radius;
    }

    lateUpdate() {
        this.camera.setWorldPosition(this.camera.position.lerp(this.horizontalPlane, 0.8));
        this.camera.lookAt(new Vec3(0, 0, 0));
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