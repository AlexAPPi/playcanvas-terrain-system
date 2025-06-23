
/**
 * Primitive object describing how to submit current vertex/index buffers.
 */
export interface IPrimitive<TMap extends Record<string, any> = Record<string, any>> {

    /** True if enabled */
    enabled: boolean;

    /**
     * The type of primitive to render. Can be:
     * 
     * - {@link pcx.PRIMITIVE_POINTS}
     * - {@link pcx.PRIMITIVE_LINES}
     * - {@link pcx.PRIMITIVE_LINELOOP}
     * - {@link pcx.PRIMITIVE_LINESTRIP}
     * - {@link pcx.PRIMITIVE_TRIANGLES}
     * - {@link pcx.PRIMITIVE_TRISTRIP}
     * - {@link pcx.PRIMITIVE_TRIFAN}
     */
    type: number;
 
    /** The offset of the first index or vertex to dispatch in the draw call. */
    base: number;

    /** The number of indices or vertices to dispatch in the draw call. */
    count: number;

    /** True to interpret the primitive as indexed, thereby using the currently set index buffer and false otherwise. */
    indexed: boolean;

    attributes: TMap;
}

export interface CustomMesh<TMap extends Record<string, any> = Record<string, any>> {
    primitiveChunks: IPrimitive<TMap>[][];
}

export interface CustomMeshInstance<TMap extends Record<string, any> = Record<string, any>> {
    mesh: pcx.Mesh & CustomMesh<TMap>;
}

(() => {

    if (!(window as any).EXPERIMENTAL_TERRAIN_CUSTOM_RENDER) {
        return;
    }

    const originalDrawInstance = pc.ForwardRenderer.prototype.drawInstance;

    pc.ForwardRenderer.prototype.drawInstance = function(
        device: pcx.WebglGraphicsDevice,
        meshInstance: pcx.MeshInstance & CustomMeshInstance,
        mesh: pcx.Mesh & CustomMesh,
        style: number,
        normal?: boolean
    ) {

        if (mesh.primitiveChunks && device.isWebGL2) {

            this.modelMatrixId.setValue((meshInstance.node as any).worldTransform.data);
            if (normal) {
                this.normalMatrixId.setValue(meshInstance.node.normalMatrix.data);
            }

            let kb = false;

            for (const primitive of mesh.primitiveChunks[style]) {

                if (primitive.enabled) {

                    if (primitive.attributes) {

                        for (const scopeId in primitive.attributes) {
                            device.scope.resolve(scopeId).setValue(primitive.attributes[scopeId]);
                        }
                    }

                    device.draw(primitive, 0, kb);
                    kb = true;
                }
            }
        }
        else {    
            
            originalDrawInstance.call(this, device, meshInstance, mesh, style, normal);
        }
    }

})();