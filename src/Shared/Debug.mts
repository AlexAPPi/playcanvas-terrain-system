const tmpVec = new pc.Vec3();

export function drawDirectionVector(position: pcx.Vec3, dir: pcx.Vec3, color = pc.Color.RED) {

    // Draw the vector
    const start = position;
    const end = tmpVec.add2(position, dir);
    
    pc.app!.drawLine(start, end, color, false);
}

export function drawPoint(
    {center, radius = 0.1, numSegments = 4, color = pc.Color.RED, layer, depthTest = false }:
    {center: pcx.Vec3, radius?: number, numSegments?: number, color?: pcx.Color, depthTest?: boolean, layer?: pcx.Layer}
) {
    const block  = 6 * 3;
    const points = new Array(numSegments * block);
    const step = 2 * Math.PI / numSegments;

    let angle = 0;

    for (let i = 0; i < numSegments; i++) {

        const sin0 = Math.sin(angle);
        const cos0 = Math.cos(angle);

        angle += step;

        const sin1 = Math.sin(angle);
        const cos1 = Math.cos(angle);

        const j = i * block;

        points[j + 0] = center.x + radius * sin0;
        points[j + 1] = center.y;
        points[j + 2] = center.z + radius * cos0;

        points[j + 3] = center.x + radius * sin1;
        points[j + 4] = center.y;
        points[j + 5] = center.z + radius * cos1;

        points[j + 6] = center.x;
        points[j + 7] = center.y + radius * sin0;
        points[j + 8] = center.z + radius * cos0;

        points[j + 9]  = center.x;
        points[j + 10] = center.y + radius * sin1;
        points[j + 11] = center.z + radius * cos1;

        points[j + 12] = center.x + radius * cos0;
        points[j + 13] = center.y + radius * sin0;
        points[j + 14] = center.z;

        points[j + 15] = center.x + radius * cos1;
        points[j + 16] = center.y + radius * sin1;
        points[j + 17] = center.z;
    }

    pc.app!.drawLineArrays(points, color, depthTest, layer);
}

export function drawBox(
    {min, max, color = pc.Color.RED, layer, depthTest = false}:
    {min: pcx.Vec3, max: pcx.Vec3, color?: pcx.Color, depthTest?: boolean, layer?: pcx.Layer}
) {
    pc.app?.drawWireAlignedBox(min, max, color, depthTest, layer);
}