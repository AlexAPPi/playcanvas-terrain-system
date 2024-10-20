export class MouseHandler {

    private _enter: boolean = false;

    public get enter() { return this._enter; }

    constructor() {
        this._onWindowEnter = this._onWindowEnter.bind(this);
        this._onWindowLeave = this._onWindowLeave.bind(this);
    }

    public init() {
        document.addEventListener("mouseenter", this._onWindowEnter)
        document.addEventListener("mouseleave", this._onWindowLeave);
    }

    public destroy() {
        document.removeEventListener("mouseenter", this._onWindowEnter)
        document.removeEventListener("mouseleave", this._onWindowLeave);
    }

    private _onWindowEnter(event: MouseEvent) {
        if (event.clientY > 0 || event.clientX > 0 || (event.clientX < window.innerWidth || event.clientY < window.innerHeight)) {
            console.log('Enter');
            this._enter = true;
        }
    }
    
    private _onWindowLeave(event: MouseEvent) {

        if (event.clientY <= 0 || event.clientX <= 0 || (event.clientX >= window.innerWidth || event.clientY >= window.innerHeight)) {
            console.log('Leave');
            this._enter = false;
        }
    }
}