import type __pc from 'playcanvas';
import * as _pc from 'playcanvas';
import * as _Ammo from 'ammojs';

declare global {
    const pc: typeof _pc;
    const Ammo: typeof _Ammo;
    const touchJoypad: ITouchJoypad;
}