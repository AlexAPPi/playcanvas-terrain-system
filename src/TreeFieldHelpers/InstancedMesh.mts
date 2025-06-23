export class InstancedMesh {

    /**
     * Attribute storing indices of the instances to be rendered.
     */
    public instanceIndex: pcx.VertexFormat | null = null;

    private _graphicsDevice: pcx.GraphicsDevice;
    private _count: number = 0;
    private _capacity: number = 0;

    protected _initIndexAttribute(): void {

        if (!this._graphicsDevice) {
            this._count = 0;
            return;
        }

        const capacity = this._capacity;
        const array = new Uint32Array(capacity);
    
        for (let i = 0; i < capacity; i++) {
            array[i] = i;
        }
    
        this.instanceIndex = new pc.VertexFormat(this._graphicsDevice, [{
            semantic: pc.SEMANTIC_ATTR10,
            components: 1,
            type: pc.TYPE_UINT32,
            normalize: false,
            asInt: true
        }]);
    }

    
}