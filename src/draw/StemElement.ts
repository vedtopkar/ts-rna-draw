import { Point, Path, Group } from 'paper/dist/paper-core'
import { start } from 'repl'
import { Drawing } from '../draw'
import { StemNode } from '../structure/nodes'
import { Structure } from '../structure/structure'
import { BasePairElement } from './BasePairElement'
import { DrawnElement } from './DrawnElement'
import { Nucleotide } from './Nucleotide'

/**
 * Stem element
 * 
 * This is an element that draws a dsRNA stem.
 * 
 * Importantly, it has properties startVector and endVector, which point from the 5' to the 3' nt of the botton and top bp.
 * The drawDirection is a vector that points from the startVector to the endDirection.
 */
export class StemElement extends DrawnElement {

    public node: StemNode
    public startPoint: Point
    public startVector: Point
    public endPoint: Point
    public endvector: Point
    public stemDirectionVector: Point
    public basePairs: Array<BasePairElement> = []
    public nucleotides: Array<Nucleotide> = []
    public drawnElements = []
    public elementGroup: Group

    /**
     * Creates an instance of stem element.
     * We require the startPoint, baseVector, and derive the other two vectors from that.
     */
    constructor(drawing: Drawing, parentElement: DrawnElement, node: StemNode, startPoint: Point, startVector: Point) {
        super(drawing, parentElement)

        this.node = node
        this.startPoint = startPoint.clone()
        this.startVector = startVector.clone()

        // Make a unit vector that points in the direction  of the stem to be drawn
        this.stemDirectionVector = this.startVector.clone()
        this.stemDirectionVector.angle -= 90
        this.stemDirectionVector.length = 1


    }

    private transformStem(angle){
        if(this.node.parent.type !== 'RootNode') {
            console.log('rotating by ', angle)
            this.parentElement.rotateStem(this, angle)
        }
    }

    /**
     * Draw stem element
     * 
     * Create and draw each individual base pair element of the stem
     */
    public draw() {
        let drawCursor: Point = this.startPoint.clone()
        this.node.pairs.forEach((p, i) {
            let bp = new BasePairElement(this.drawing, this, p, drawCursor, this.startVector)
            bp.draw()

            this.drawing.basePairs.push(bp)
            this.basePairs.push(bp)

            this.drawnElements.push(bp.nucleotides[0].circle)
            this.drawnElements.push(bp.nucleotides[1].circle)
            this.drawnElements.push(bp.nucleotides[0].text)
            this.drawnElements.push(bp.nucleotides[1].text)

            let scaledDirectionVector = this.stemDirectionVector.clone()
            scaledDirectionVector.length = this.drawing.config.ntSpacing

            drawCursor = drawCursor.add(scaledDirectionVector)
        })

        this.elementGroup = new Group(this.drawnElements)
        let dragStartPoint: Point
        let dragAngle: Point
        let that = this

        this.elementGroup.onMouseEnter = function(event) {
            event.target.strokeColor = 'yellow'
        }
    
        this.elementGroup.onMouseLeave = function(event) {
            event.target.strokeColor = 'black'
        }
    
        this.elementGroup.onMouseDown = function(event) {
            event.target.strokeColor = 'red'
            dragStartPoint = event.point.clone()
        }
    
        this.elementGroup.onMouseUp = function(event) {
            event.target.strokeColor = 'yellow'
        }

        this.elementGroup.onMouseDrag = function(event) {

            dragAngle = that.stemDirectionVector.angle - event.point.subtract(that.startPoint).angle
            that.transformStem(dragAngle)
        }


        return drawCursor
    }

    private rotateOnDrag(event) {


    }
}