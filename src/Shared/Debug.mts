
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
    const points = [];
    const step = 2 * Math.PI / numSegments;

    let angle = 0;

    for (let i = 0; i < numSegments; i++) {

        const sin0 = Math.sin(angle);
        const cos0 = Math.cos(angle);

        angle += step;

        const sin1 = Math.sin(angle);
        const cos1 = Math.cos(angle);

        points.push(
            center.x + radius * sin0, center.y, center.z + radius * cos0,
            center.x + radius * sin1, center.y, center.z + radius * cos1
        );
        
        points.push(
            center.x, center.y + radius * sin0, center.z + radius * cos0,
            center.x, center.y + radius * sin1, center.z + radius * cos1
        );

        points.push(
            center.x + radius * cos0, center.y + radius * sin0, center.z,
            center.x + radius * cos1, center.y + radius * sin1, center.z
        );
    }

    pc.app!.drawLineArrays(points, color, depthTest, layer);
}