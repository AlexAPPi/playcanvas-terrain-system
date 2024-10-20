interface IStick {
    x: number;
    y: number;
}

interface IButtonSate {

    /** Takes the button identifier and returns true if the button is currently being pressed. */
    isPressed(id: string): boolean;

    /** Takes the button identifier and returns true if the button was pressed since the last frame. */
    wasPressed(id: string): boolean;

    /** Takes the button identifier and returns true if the button was released since the last frame. */
    wasReleased(id: string): boolean;

    /** Takes the button identifier and returns true if the button was pressed and released within 200ms. i.e. A quick tap. */
    wasTapped(id: string): boolean;
}

interface ITouchJoypad {
    sticks: Record<string, IStick>;
    buttons: IButtonSate;
}