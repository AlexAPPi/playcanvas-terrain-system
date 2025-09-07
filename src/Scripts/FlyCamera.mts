export class FlyCamera extends pc.ScriptType {

    declare public readonly mode: number;
    declare public readonly speed: number;
    declare public readonly slowSpeed: number;
    declare public readonly fastSpeed: number;
    declare public readonly sensitivity: number;
    declare public readonly mobileControls: pcx.Entity | undefined;

    private ex: number;
    private ey: number;
    private translateLoc: pcx.Vec3;
    private moved: boolean;
    private middleDown: boolean;
    private rightDown: boolean;
    private mobileControl: boolean = false;

    public initialize() {

        // Camera euler angle rotation around x and y axes
        const eulers = this.entity.getLocalEulerAngles();

        this.ex = (eulers.z - eulers.x);
        this.ey = (eulers.z - eulers.y);
        this.translateLoc = pc.Vec3.ZERO.clone();
        this.moved = false;
        this.rightDown = false;
        this.middleDown = false;
    
        // Disabling the context menu stops the browser displaying a menu when
        // you right-click the page
        if (this.app.mouse) {
            this.app.mouse.disableContextMenu();
            this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
            this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
            this.app.mouse.on(pc.EVENT_MOUSEUP,   this.onMouseUp, this);
        }

        //this.entity.camera!.setShaderPass(pc.SHADERPASS_WORLDNORMAL);
    }

    public append(x: number, y: number) {
        this.ex += x;
        this.ey += y;
        this.ex = pc.math.clamp(this.ex, -90, 90);
    }

    public translate(x: number, y: number, z: number) {
        this.translateLoc.x += x;
        this.translateLoc.y += y;
        this.translateLoc.z += z;
    }

    public update(dt: number) {

        const app = this.app;

        let speed = this.speed;

        if (app.keyboard?.isPressed(pc.KEY_SPACE)) {
            speed = this.slowSpeed;
        }
        if (app.keyboard?.isPressed(pc.KEY_SHIFT)) {
            speed = this.fastSpeed;
        }

        // Joypad control
        const joystickMover = touchJoypad?.sticks['joystick0'];
        const joystickRoter = touchJoypad?.sticks['joystick1'];
        
        if (this.mobileControls && touchJoypad?.buttons.wasPressed('button2')) {
            this.mobileControl = !this.mobileControl;
            this.mobileControls.enabled = this.mobileControl;
        }

        if (joystickRoter) {
            this.append(joystickRoter.y, -joystickRoter.x);
        }

        if (joystickMover) {
            this.translate(speed * joystickMover.x * dt, 0, -speed * joystickMover.y * dt);
        }

        // Update the camera's position
        if (app.keyboard?.isPressed(pc.KEY_UP) || app.keyboard?.isPressed(pc.KEY_W)) {
            this.translate(0, 0, -speed * dt);
        } else if (app.keyboard?.isPressed(pc.KEY_DOWN) || app.keyboard?.isPressed(pc.KEY_S)) {
            this.translate(0, 0, speed * dt);
        }
    
        if (app.keyboard?.isPressed(pc.KEY_LEFT) || app.keyboard?.isPressed(pc.KEY_A)) {
            this.translate(-speed * dt, 0, 0);
        } else if (app.keyboard?.isPressed(pc.KEY_RIGHT) || app.keyboard?.isPressed(pc.KEY_D)) {
            this.translate(speed * dt, 0, 0);
        }
        
        // Update the camera's TRS
        this.entity.setLocalEulerAngles(this.ex, this.ey, 0);
        this.entity.translateLocal(this.translateLoc);
        this.translateLoc.set(0, 0, 0);

        // Update frustum by actual matrix
        this.app.renderer.updateCameraFrustum(this.entity.camera?.camera);
    }

    private onMouseMove(event: pcx.MouseEvent) {

        if (!this.mode && !pc.Mouse.isPointerLocked()) {
            return;
        }

        if (!this.rightDown &&
            !this.middleDown)
            return;
    
    
        // Update the current Euler angles, clamp the pitch.
        if (!this.moved) {
            // first move event can be very large
            this.moved = true;
            return;
        }

        if (this.rightDown) {
            this.append(
                -event.dy / this.sensitivity,
                -event.dx / this.sensitivity
            );
        }

        if (this.middleDown) {

            let speed = this.speed;
            if (this.app.keyboard!.isPressed(pc.KEY_SHIFT)) {
                speed = this.fastSpeed;
            }

            this.translate(-(event.dx / 5) * speed, (event.dy / 5) * speed, 0);
        }
    }

    private onMouseDown(event: pcx.MouseEvent) {

        // When the mouse button is clicked try and capture the pointer
        if (!this.mode && !pc.Mouse.isPointerLocked()) {
            this.app.mouse!.enablePointerLock();
        }

        if (event.button === pc.MOUSEBUTTON_RIGHT) {
            this.rightDown = true;
        }
        
        if (event.button === pc.MOUSEBUTTON_MIDDLE) {
            this.middleDown = true;
        }
    }
    
    private onMouseUp(event: pcx.MouseEvent) {

        if (event.button === pc.MOUSEBUTTON_RIGHT) {
            this.rightDown = false;
        }

        if (event.button === pc.MOUSEBUTTON_MIDDLE) {
            this.middleDown = false;
        }
    }
}

export default FlyCamera;
export const flyCameraScriptName = 'flyCamera';

pc.registerScript(FlyCamera, flyCameraScriptName);

FlyCamera.attributes.add('mobileControls', {
    type: 'entity',
});

FlyCamera.attributes.add('speed', {
    type: 'number',
    default: 10
});

FlyCamera.attributes.add('slowSpeed', {
    type: 'number',
    default: 1
});

FlyCamera.attributes.add('fastSpeed', {
    type: 'number',
    default: 20
});

FlyCamera.attributes.add('sensitivity', {
    type: 'number',
    min: 1,
    default: 5
});

FlyCamera.attributes.add('mode', {
    type: 'number',
    default: 0,
    enum: [{
        "Lock": 0
    }, {
        "Drag": 1
    }]
});