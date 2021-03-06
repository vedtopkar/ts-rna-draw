import paper from "paper/dist/paper-core"

// Logic for simple panning and zooming of the canvas
// adapted from this informative script: https://github.com/mberth/PanAndZoom/blob/master/app/scripts/pan_and_zoom.coffee
export class PanAndZoom {

    public computeNewZoom(oldZoom: number, deltaY: number) {
        const factor = 1.05
        if (deltaY < 0) {
            return oldZoom * factor
        } else if (deltaY > 0) {
            return oldZoom / factor
        } else {
            return oldZoom
        }
    }

    public changeZoom(oldZoom: number, deltaY: number, c:Point, p: Point) {
        const newZoom = this.computeNewZoom(oldZoom, deltaY)
        const beta = oldZoom/newZoom

        const pc = p.subtract(c)
        let a = p.subtract(pc.multiply(beta)).subtract(c)
        console.log([newZoom, a])
        return [newZoom, a]
    }

    public changeCenter(oldCenter: Point, deltaX: number, deltaY: number, factor: number) {
        let offset = new paper.Point(deltaX, -deltaY)
        offset = offset.multiply(factor)
        return oldCenter.add(offset)
    }

    public centerDrawing(view, drawing) {
        let unitedBounds = drawing.nucleotides.reduce((bbox, item) => {
            return !bbox ? item.circle.bounds : bbox.unite(item.circle.bounds)
        }, null)

        // Set the zoom to encompass the whole drawing
        view.center = unitedBounds.center
    }

    public zoomDrawing(view, drawing) {
        let unitedBounds = drawing.nucleotides.reduce((bbox, item) => {
            return !bbox ? item.circle.bounds : bbox.unite(item.circle.bounds)
        }, null)
        
        const viewBounds = view.bounds
        const heightRatio = viewBounds.height/unitedBounds.height
        const widthRatio = viewBounds.width/unitedBounds.width
        const newZoom = Math.min(heightRatio, widthRatio)*.9

        view.zoom *= newZoom
    }

    public centerAndZoom(view, drawing) {
        
        this.centerDrawing(view, drawing)
        this.zoomDrawing(view, drawing)

    }
}