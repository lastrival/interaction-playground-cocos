
import { CCFloat, CCInteger, Component, Line, math, Mesh, MeshRenderer, Node, primitives, Vec3, utils, _decorator, CCBoolean, Material, assetManager, renderer, Color, RenderData } from 'cc';
const { ccclass, property, executeInEditMode, playOnFocus, help } = _decorator;
import { EDITOR } from 'cc/env'

@ccclass('CatmullSpline')
@executeInEditMode(true)
@playOnFocus(true)
@help('https://en.wikipedia.org/wiki/Centripetal_Catmull–Rom_spline')
export class CatmullSpline extends Component {

    /*
    TO DO :
    Update line render capacity beyond 100  points.
    Add a material to be added on the line renderer component.
    Improve curve generation system by only recalculating updated nodes.
    Add isInitialized state and then update the curve.
    Improve Clear Curve by properly managing nodes.
    */

    @property({ type: Line })
    lineComp: Line;

    @property({ tooltip: 'Run on compile' })
    autoUpdate: boolean = false;

    @property
    manualInitialize: boolean = false;

    @property
    clearCurve: boolean = false;

    @property
    updatePath: boolean = false;

    @property({ tooltip: 'When enabled curve is updated after every realtime frequency update' })
    realtime: boolean = false;

    @property({ tooltip: 'Time interval between each curve redraw' })
    @property({ min: 0.016, max: 2 })
    realtimeFrequency: number = 0.5;
    timer: number = 0;

    @property({ type: CCFloat, tooltip: 'Number of points on a curve between two points, should be that (NodeCount-3)*((1/resolution)+1) is less than 100.' })
    resolution: number = 0.1;

    @property({ type: CCFloat })
    @property({ tooltip: 'Determines what kind of catmull spline is drawn, set 0 for Uniform Spline, 0.5 Centripetal Spline and 1 for Chordal Spline' })
    @property({ step: 0.5, min: 0, max: 1 })
    alpha: number = 0.5;

    @property({ type: CCInteger, tooltip: 'Number of nodes, used to draw the spline, currently a line renderer only supports 100 points so adjust resolution accordingly.' })
    nodeCount: number = 4;

    @property({ type: Node })
    nodes: Array<Node> = [];
    
    controlNodeMat: Material;
    connectingNodeMat: Material;
    sphereMesh: Mesh;

    //Runs on Compile
    start() {// [3]
        if (this.autoUpdate) {
            this.initializeCurve();
        }
        if (this.nodes != null && EDITOR) {
            if (this.nodes.length > 3) {

                this.controlNodeMat = new Material();
                this.controlNodeMat.initialize({
                    effectName: 'builtin-unlit'
                });
                this.controlNodeMat.setProperty('mainColor', Color.BLUE);

                this.connectingNodeMat = new Material();
                this.connectingNodeMat.initialize({
                    effectName: 'builtin-unlit'
                });
                this.connectingNodeMat.setProperty('mainColor', Color.RED);

                this.sphereMesh = utils.createMesh(primitives.sphere(0.1));

                let render = this.nodes[0].getComponent(MeshRenderer);
                if (render != null) {
                    render.mesh = this.sphereMesh;
                    render.setMaterial(this.controlNodeMat, 0);
                }

                render = this.nodes[this.nodes.length - 1].getComponent(MeshRenderer);
                if (render != null) {
                    render.mesh = this.sphereMesh;
                    render.setMaterial(this.controlNodeMat, 0);
                }

                for (let i = 1; i < this.nodes.length - 1; i++) {
                    render = this.nodes[i].getComponent(MeshRenderer);
                    if (render != null) {
                        render.mesh = this.sphereMesh;
                        render.setMaterial(this.connectingNodeMat, 0);
                    }
                }
            }
        }
    }

    update(deltaTime: number) {
        // [4]
        this.timer += deltaTime;
        if (this.timer > this.realtimeFrequency) {
            if (this.realtime) {
                this.drawPath();
            }
            this.timer = 0;
        }

        if (this.manualInitialize) {
            this.manualInitialize = false;
            this.initializeCurve();
        }

        if (this.updatePath) {
            this.updatePath = false;
            this.drawPath();
        }

        if (this.clearCurve) {
            this.clearCurve = false;
            this.clearCurveData();
        }
    }

    initializeCurve() {
        console.log("Catmull Spline : Starting Initialization.");

        this.lineComp = this.getComponent(Line);

        if (this.lineComp == null) {
            console.log("Catmull Spline : Attached node does not have Line Component, attaching a Line Component.")
            this.lineComp = this.node.addComponent(Line);
        }

        console.log("Catmull Spline : Initializing Line");
        this.lineComp.worldSpace = false;

        this.timer = 0;
        this.realtimeFrequency = 1 / 5;
        if (this.nodeCount < 4) {
            this.nodeCount = 4;
        }

        if (this.nodes.length != this.nodeCount) {
            console.log("Catmull Spline : Updating nodes in path.");
            let spawnPos = new Vec3(0, 0, 0);
            spawnPos = this.node.position;
            spawnPos.x = -this.nodeCount / 2.0;
            if (this.nodes.length < this.nodeCount) {
                console.log("Catmull Spline : Adding control points to spline path.");
                while (this.nodes.length != this.nodeCount) {
                    let spawnedNode = new Node('Point ' + this.nodes.length);
                    spawnedNode.setParent(this.node);
                    spawnedNode.setPosition(new Vec3(-this.nodeCount * 0.5 + this.nodes.length, this.node.position.y, this.node.position.z));
                    let render = spawnedNode.addComponent(MeshRenderer);
                    render.mesh = this.sphereMesh;
                    this.nodes.push(spawnedNode);
                }
            } else {
                console.log("Catmull Spline : Deleting control points from spline path.");
                while (this.nodes.length != this.nodeCount) {
                    this.nodes[this.nodes.length - 1].destroy();
                    this.nodes.pop();
                }
            }

            let render = this.nodes[0].getComponent(MeshRenderer);
            render.setMaterial(this.controlNodeMat, 0);

            render = this.nodes[this.nodeCount - 1].getComponent(MeshRenderer);
            render.setMaterial(this.controlNodeMat, 0);

            for (let i = 1; i < this.nodes.length - 1; i++) {
                render = this.nodes[i].getComponent(MeshRenderer);
                render.setMaterial(this.connectingNodeMat, 0);
            }
        }

        this.drawPath();

        console.log("Catmull Spline : Completed Initialization.");
    }

    drawPath() {
        if (!this.realtime) {
            console.log("Catmull Spline : Generating spline path.");
        }
        let curveSegments: Array<Array<Vec3>> = [];

        for (let i = 1; i < this.nodes.length - 2; i++) {

            curveSegments.push(this.getCurvePoints(
                this.nodes[i - 1].position,
                this.nodes[i].position,
                this.nodes[i + 1].position,
                this.nodes[i + 2].position,
                this.resolution
            ));
        }

        this.lineComp.positions = [];
        for (let i = 0; i < curveSegments.length; i++) {
            for (let j = 0; j < curveSegments[i].length; j++) {
                this.lineComp.positions.push(curveSegments[i][j]);
            }
        }
        this.lineComp.enabled = false;
        this.lineComp.enabled = true;
        if (!this.realtime) {
            console.log("Catmull Spline : Generated spline path");
        }
    }

    clearCurveData() {
        console.log("Catmull Spline : Deleting all control points in spine node.");
        while (this.nodes.length != 0) {
            this.nodes[this.nodes.length - 1].destroy();
            this.nodes.pop();
        }
        console.log("Catmull Spline : Deleted all control points in spine node.");
    }

    /**
     * Get an array of Vec3 points of the curve formed between @param point2, @param point3 controlled by @param point0 and @param point3
     * @param point0 Control point A for the curve
     * @param point1 Starting point of the curve
     * @param point2 Ending point of the curve
     * @param point3 Control point B for the curve
     * @param resolution In Range of 0  to 1
     */
    getCurvePoints(point0: Vec3, point1: Vec3, point2: Vec3, point3: Vec3, resolution: number): Array<Vec3> {
        let iterations = 1 / resolution;
        let points: Array<Vec3> = [];
        for (let i = 0; i < iterations + 1; i++) {
            let k0 = 0;
            let k1 = this.getKnot(point0, point1);
            let k2 = this.getKnot(point1, point2) + k1;
            let k3 = this.getKnot(point2, point3) + k2;

            let u = math.lerp(k1, k2, resolution * i);
            let a1 = this.reMap(k0, k1, point0, point1, u);
            let a2 = this.reMap(k1, k2, point1, point2, u);
            let a3 = this.reMap(k2, k3, point2, point3, u);
            let b1 = this.reMap(k0, k2, a1, a2, u);
            let b2 = this.reMap(k1, k3, a2, a3, u);

            points.push(this.reMap(k1, k2, b1, b2, u));
        }
        return points;
    }

    getKnot(pointA: Vec3, pointB: Vec3) {
        let dir: Vec3 = new Vec3(0, 0, 0);
        Vec3.subtract(dir, pointA, pointB)
        return Math.pow(Vec3.lengthSqr(dir), 0.5 * this.alpha);
    }

    reMap(a: number, b: number, pointA: Vec3, pointB: Vec3, u: number) {
        let remapped: Vec3 = new Vec3(0, 0, 0);
        Vec3.lerp(remapped, pointA, pointB, ((u - a) / (b - a)));
        return remapped;
    }

}
