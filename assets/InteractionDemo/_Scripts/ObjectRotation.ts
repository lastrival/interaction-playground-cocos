
import { _decorator, Component, Camera, EventMouse, Input, input, PhysicsSystem, Enum, Vec2, Vec3, Graphics, view, math, Size, Label, Color } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ObjectRotation
 * DateTime = Wed Feb 23 2022 08:57:05 GMT+0530 (India Standard Time)
 * Author = bfv68905
 * FileBasename = ObjectRotation.ts
 * FileBasenameNoExtension = ObjectRotation
 * URL = db://assets/_Scripts/ObjectRotation.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 */

enum RotationDirection {
    AntiClockwise,
    Clockwise
}

Enum(RotationDirection);

@ccclass('ObjectRotation')
export class ObjectRotation extends Component {
    @property({ type: Camera })
    cam: Camera;

    @property({ type: RotationDirection })
    rotationDirection: RotationDirection = RotationDirection.AntiClockwise;

    enableRotation: boolean;

    @property({ type: Graphics })
    debug: Graphics;

    @property
    anglePerSec: number = 180;

    @property({ type: Label })
    label: Label;

    likeness: Number = 0;

    zRotation: number = 0;

    hitPoint: Vec3 = new Vec3();
    center: Vec3 = new Vec3();
    pointerDownPos: Vec2 = new Vec2();

    @property({ type: Color })
    selectedColor: Color = new Color();
    @property({ type: Color })
    default: Color = new Color();

    /**
     * The object hit by raycast
     */
    static selectedObject: ObjectRotation;

    start() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.enableRotation = false;
    }

    onMouseDown(event: EventMouse) {
        if (event.getButton() == 0) {
            let ray = this.cam.screenPointToRay(event.getLocationX(), event.getLocationY());
            if (PhysicsSystem.instance.raycastClosest(ray)) {
                ObjectRotation.selectedObject = PhysicsSystem.instance.raycastClosestResult.collider.getComponent(ObjectRotation);
                if (ObjectRotation.selectedObject != null) {
                    this.enableRotation = true;
                    let hitInfo = PhysicsSystem.instance.raycastClosestResult;
                    this.center = ObjectRotation.selectedObject.node.position;
                    this.hitPoint = hitInfo.hitPoint;
                    this.hitPoint.z = this.center.z;
                    
                    
                    this.pointerDownPos = event.getLocation();
                } else {
                    ObjectRotation.selectedObject = null;
                    this.enableRotation = false;
                }
            } else {
                ObjectRotation.selectedObject = null;
                this.enableRotation = false;
            }
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() == 0) {
            ObjectRotation.selectedObject = null;
            this.enableRotation = false;
        }
    }

    onMouseMove(event: EventMouse) {
        if (this.enableRotation == false || ObjectRotation.selectedObject == null) {
            return;
        }

        let centerCanvas: Vec2 = ObjectRotation.worldToCanvasView(this.cam, this.center);
        let hitDir: Vec3 = new Vec3();
        Vec3.subtract(hitDir, this.hitPoint, this.center);
        let hitDirNormalized: Vec3 = new Vec3();
        Vec3.normalize(hitDirNormalized, hitDir);
        let hitPerpendicular: Vec3 = new Vec3();

        //Perpendicular dir to hit direction.
        if (this.rotationDirection == RotationDirection.Clockwise) {
            hitPerpendicular.x = hitDirNormalized.y;
            hitPerpendicular.y = -hitDirNormalized.x;
        } else {
            hitPerpendicular.x = -hitDirNormalized.y;
            hitPerpendicular.y = hitDirNormalized.x;
        }

        let hitPerpendicularNormalized: Vec3 = new Vec3();
        Vec3.normalize(hitPerpendicularNormalized, hitPerpendicular);

        let perpendicularCanvas: Vec2 = ObjectRotation.worldToCanvasView(this.cam, hitPerpendicular);
        let mouseProjectionLast: Vec2 = ObjectRotation.pixelToCanvasView(this.pointerDownPos);
        let mouseProjectionCurr: Vec2 = ObjectRotation.pixelToCanvasView(event.getLocation());

        let deltaDir: Vec2 = new Vec2();
        Vec2.subtract(deltaDir, mouseProjectionCurr, mouseProjectionLast);

        let normalizedDeltaDir: Vec2 = new Vec2();
        Vec2.normalize(normalizedDeltaDir, deltaDir);

        let normalizedPerpendicular: Vec2 = new Vec2();
        Vec2.normalize(normalizedPerpendicular, perpendicularCanvas);

        // this.debug.clear();
        // this.debug.moveTo(0, 0);
        // this.debug.lineTo(normalizedDeltaDir.x * 50, normalizedDeltaDir.y * 50);
        // this.debug.moveTo(0, 0);
        // this.debug.lineTo(normalizedPerpendicular.x * 50, normalizedPerpendicular.y * 50)
        // this.debug.stroke();

        this.likeness = Vec2.dot(normalizedPerpendicular, normalizedDeltaDir);
        this.label.string = this.likeness.toString();
        if (this.likeness > 0) {

            let displacement = deltaDir.length();
            if (this.rotationDirection == RotationDirection.Clockwise) {
                displacement = -displacement;
            }

            this.zRotation += displacement;

            ObjectRotation.selectedObject.node.setRotationFromEuler(0, 0, this.zRotation);

            //Move the hit point based on the angle we moved.
            let newHitDir = new Vec3();
            Vec3.rotateZ(newHitDir, hitDir, Vec3.FORWARD, math.toRadian(displacement));
            hitDir.x = newHitDir.x;
            hitDir.y = newHitDir.y;
            hitDir.z = newHitDir.z;
            Vec3.add(this.hitPoint, this.center, hitDir);
        }

        this.pointerDownPos = event.getLocation();
    }

    /**
     * Used to convert pixel coordinates to canvas space.
     * MouseLocation and World to Screen methods return values in screen pixel.
     * @param position Co-ordinate in pixel. Ignores the Z value in a Vec3.
     * @param offsetCenter Origin of the point : True, true - Middle Center , false - Bottom Left,
     * @param out Result in canvas space Vec2.
     */
    static pixelToCanvasView(position: Vec2 | Vec3, offsetCenter: boolean = true, out?: Vec2): Vec2 {
        /**Number of pixels in canvas*/
        const pixelSize: Size = view.getVisibleSizeInPixel();
        /**Size of the canvas rendering*/
        const viewSize: Size = view.getVisibleSize();
        let point: Vec2 = new Vec2(position.x, position.y);
        point.x = point.x / pixelSize.x;
        point.y = point.y / pixelSize.y;
        point.x = point.x * viewSize.x;
        point.y = point.y * viewSize.y;

        if (offsetCenter) {
            point.x = point.x - (viewSize.x * 0.5);
            point.y = point.y - (viewSize.y * 0.5);
        }

        out = point;
        return point;
    }

    /**
    * Used to convert world coordinates to canvas space.
    * MouseLocation and World to Screen methods return values in screen pixel.
    * @param cam Camera rendering the scene.
    * @param position Co-ordinate in pixel. Ignores the Z value in a Vec3.
    * @param offsetCenter Origin of the point, true - Middle Center , false - Bottom Left,
    * @param out Result in canvas space Vec2.
    */
    static worldToCanvasView(cam: Camera, position: Vec3, offsetCenter: boolean = true, out?: Vec2): Vec2 {
        if (cam == null) {
            console.log('Null camera, returning zero vector.');
            return new Vec2(0, 0);
        }
        /**Number of pixels in canvas*/
        const pixelSize: Size = view.getVisibleSizeInPixel();
        /**Size of the canvas rendering*/
        const viewSize: Size = view.getVisibleSize();
        /**Pixel position of screen of the given object*/
        const screenPos = cam.worldToScreen(position);
        let point: Vec2 = new Vec2(screenPos.x, screenPos.y);
        point.x = point.x / pixelSize.x;
        point.y = point.y / pixelSize.y;
        point.x = point.x * viewSize.x;
        point.y = point.y * viewSize.y;

        if (offsetCenter) {
            point.x = point.x - (viewSize.x * 0.5);
            point.y = point.y - (viewSize.y * 0.5);
        }

        out = point;
        return point;
    }
}
