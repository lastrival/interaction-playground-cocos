
import { _decorator, Component, Node, geometry, input, Input, EventMouse, Camera, Vec3, physics, PhysicsSystem, CCClass, ccenum, CCString, Enum, CCFloat, CCBoolean, Vec2 } from 'cc';
import { Draggable } from './Draggable';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ObjectDragDrop
 * DateTime = Tue Feb 22 2022 10:03:30 GMT+0530 (India Standard Time)
 * Author = bfv68905
 * FileBasename = ObjectDragDrop.ts
 * FileBasenameNoExtension = ObjectDragDrop
 * URL = db://assets/_Scripts/ObjectDragDrop.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

enum DragPlane {
    XZ,
    XY
}
Enum(DragPlane);

@ccclass('ObjectDragDrop')
export class ObjectDragDrop extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    @property({ type: Camera })
    cam: Camera;

    @property({ type: Node })
    cone: Node;

    @property({ type: DragPlane })
    dragMode: DragPlane = DragPlane.XZ;

    @property
    overrideAxis: boolean = false;

    @property({ type: CCFloat, tooltip: 'Used to offset draggable element in Y axis in XZ mode' })
    yOffset: number = 2.5;

    @property({ type: CCFloat, tooltip: 'Used to offset draggable element in Z axis in XY mode' })
    zOffset: number = 2.5;

    dragPos: Vec3 = new Vec3(0, 0, 0);

    start() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    // update (deltaTime: number) {
    //     // [4]
    // }

    onMouseDown(event: EventMouse) {
        if (event.getButton() != 0) {
            return;
        }
        let ray = this.cam.screenPointToRay(event.getLocationX(), event.getLocationY());
        if (PhysicsSystem.instance.raycastClosest(ray)) {
            let hitResult = PhysicsSystem.instance.raycastClosestResult;
            let dragElement = hitResult.collider.node.getComponent(Draggable);
            if (dragElement != null) {
                if (Draggable.selected != null) {
                    //Unselected the element
                }

                Draggable.selected = dragElement;

                if (dragElement.root == null) {
                    dragElement.root = dragElement.node;
                }

                if (this.overrideAxis) {
                    if (this.dragMode == DragPlane.XZ) {
                        this.dragPos.y = this.yOffset;
                    } else {
                        this.dragPos.z = this.zOffset;
                    }
                } else {
                    if (this.dragMode == DragPlane.XZ) {
                        this.dragPos.y = dragElement.root.position.y;
                    } else {
                        this.dragPos.z = dragElement.root.position.z;
                    }
                }
            }
        } else {
            Draggable.selected = null;
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() != 0) {
            return;
        }
        Draggable.selected = null;
    }

    onMouseMove(event: EventMouse) {
        if (Draggable.selected != null) {
            let root = Draggable.selected.root;
            if (root == null) {
                root = Draggable.selected.node;
            }

            let pointOnPlane: Vec3 = root.position;
            switch (this.dragMode) {
                case DragPlane.XZ:
                    if (this.getPointOnPlane(pointOnPlane, event.getLocation(), new Vec3(0, 1, 0), this.dragPos.y)) {
                        pointOnPlane.y = this.dragPos.y;
                        root.position = Vec3.lerp(pointOnPlane, root.position, pointOnPlane, 0.7);
                    }
                    break;
                case DragPlane.XY:
                    if (this.getPointOnPlane(pointOnPlane, event.getLocation(), new Vec3(0, 0, 1), this.dragPos.z)) {
                        pointOnPlane.z = this.dragPos.z;
                        root.position = Vec3.lerp(pointOnPlane, root.position, pointOnPlane, 0.7);
                    }
                    break;
            }
            //Move draggable
        }
    }

    getPointOnPlane(out: Vec3, mousePos: Vec2, planeNormal: Vec3, offset: number): boolean {
        let plane = geometry.Plane.create(planeNormal.x, planeNormal.y, planeNormal.z, offset);
        let ray = this.cam.screenPointToRay(mousePos.x, mousePos.y);
        let distance = geometry.intersect.rayPlane(ray, plane);
        if (distance != 0) {
            ray.computeHit(out, distance);
            return true;
        } else {
            return false;
        }
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
