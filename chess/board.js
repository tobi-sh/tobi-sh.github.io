function Position(x,y) {
    this.x = x
    this.y = y
    this.move = function(dx, dy) {
        return new Position(x + dx, y + dy)
    }
}


function ScoreBoard() {
    this.moves = 0
    this.possibilities = 0
    this.draw = function() {
        d3.select("svg").append("svg").attr("id", "scoreboardBox")
            .attr("x", "100%")
            .attr("y", 0)
            .attr("height" , "200px")
            .attr("width", 1)
            .attr("style", "overflow: visible")
        d3.select("#scoreboardBox")
            .append("rect")
            .attr("x", -100)
            .attr("y", 0)
            .attr("width", 100)
            .attr("height", 50)
            .attr("style", "stroke: #000000; fill: none")

        d3.select("#scoreboardBox")
            .append("text")
            .attr("x", -50)
            .attr("y", 25)
            .text("0")
            .attr("id", "moves")
            .attr("dominant-baseline", "middle").attr("text-anchor", "middle")

        d3.select("#scoreboardBox")
            .append("rect")
            .attr("x", -100)
            .attr("y", 60)
            .attr("width", 100)
            .attr("height", 50)
            .attr("style", "stroke: #000000; fill: none")

        d3.select("#scoreboardBox")
            .append("text")
            .attr("x", -50)
            .attr("y", 85)
            .text("0")
            .attr("id", "options")
            .attr("dominant-baseline", "middle").attr("text-anchor", "middle")    
    }
    this.update = function() {
        d3.select("#moves").text(this.moves)
        d3.select("#options").text(this.possibilities)
    }
}

function Board(size) {
    this.boardSize = 2*size - 1 
    this.cellSize = 20
    this.tiles = []
    this.scoreboardBox = new ScoreBoard()
    this.moves = 0


    for (i=0;i<this.boardSize;i++) {
        this.tiles.push(Array(this.boardSize).fill(0))
    }
    x = Math.ceil(this.boardSize/2)-1
    y = Math.ceil(this.boardSize/2)-1
    this.center = new Position(x,y)
    v  = 1
    // init
    this.tiles[x][y] = v
    for (r = 1 ; r<size;r++) {
        // right
        upstart = ++v
        this.tiles[++x][y] = upstart
        // down
        while(this.tiles[x-1][y] != 0){ 
            this.tiles[x][++y] = ++v
        }
        //left
        while(this.tiles[x][y-1] != 0){ 
            this.tiles[--x][y] = ++v
        }
        //up
        while(this.tiles[x+1][y] != 0  ){ 
            this.tiles[x][--y] = ++v
        }
        // right
        while(this.tiles[x][y+1] != upstart && this.tiles[x][y+1] != 0){ 
            this.tiles[++x][y] = ++v
        }
        // down
        while(this.tiles[x][y+1] != upstart){ 
            this.tiles[x][++y] = ++v
        }

    }
}


let theBoard = new Board(32)


theBoard.draw = function() {
    xs = this.tiles.length
    ys = this.tiles[0].length
    formatter = new Intl.NumberFormat('de-DE', { minimumIntegerDigits: 3 , useGrouping: false})
    filling = "yellow"
    for (y = 0; y < ys; y ++ ) {
        for (x = 0; x < xs ; x ++ ) {
            id = "g" + this.tiles[x][y]
            if (((x+y) % 2) == 0)
                filling = "yellow"
            else
                filling = "black"
            d3.select("svg").append("g").attr("id", id).attr("transform", "translate(" +x*this.cellSize + ", " + y * this.cellSize + ")")
            d3.select("#"+ id).append("rect").attr("width", this.cellSize).attr("height", this.cellSize).attr("style", "fill : "+filling+"; stroke: black; opacity: 0.3")
            d3.select("#"+ id).append("text").attr("dominant-baseline", "middle").attr("text-anchor", "middle").attr("font-size", "0.5em").attr("x", this.cellSize/2).attr("y", this.cellSize/2).text(formatter.format(this.tiles[x][y]))
        }
    }
    // start the path
    d3.select("#g1").append("path").attr("d", "M " + this.cellSize/2 + " " +this.cellSize/2).attr("id", "way").attr("style" , "fill: none; stroke : url(#Gradient2); stroke-width : 3; opacity: 10")
    this.scoreboardBox.draw()
}


theBoard.placeKnight = function() {
    d3.select("#g1").append("use").attr("xlink:href", "#knight").attr("transform", "scale(0.5)").attr("id", "knight")
    this.knight = {
        "pos" : this.center,
        "visitedFields" : new Set([])
    }
}

theBoard.moveKnight = function() {
    var current = this.knight.pos 
    var currentVal = this.tiles[current.x][current.y]
    this.knight.visitedFields.add( currentVal )
    var possibleMoves = [{"pos" : current.move(+2, +1), "value": this.tiles[current.x+2][current.y+1]}, 
                         {"pos" : current.move(+2, -1), "value": this.tiles[current.x+2][current.y-1]},
                         {"pos" : current.move(-2, +1), "value": this.tiles[current.x-2][current.y+1]},
                         {"pos" : current.move(-2, -1), "value": this.tiles[current.x-2][current.y-1]},
                         {"pos" : current.move(+1, +2), "value": this.tiles[current.x+1][current.y+2]}, 
                         {"pos" : current.move(+1, -2), "value": this.tiles[current.x+1][current.y-2]},
                         {"pos" : current.move(-1, +2), "value": this.tiles[current.x-1][current.y+2]},
                         {"pos" : current.move(-1, -2), "value": this.tiles[current.x-1][current.y-2]}]
    var visited = this.knight.visitedFields
    possibleMoves = possibleMoves.filter(function (x) {
        return !visited.has(x.value)
    }).sort(function(a,b){
        return a.value - b.value
    })
    var nextMove = possibleMoves[0].value

    if (possibleMoves.length > 0) {
        this.scoreboardBox.moves ++ 
        this.scoreboardBox.possibilities = possibleMoves.length 
        this.scoreboardBox.update()
        console.log(nextMove)
    }

    dx = possibleMoves[0].pos.x - this.knight.pos.x
    dy = possibleMoves[0].pos.y - this.knight.pos.y
    this.knight.pos = possibleMoves[0].pos
    // move the knight
    d3.select("#knight").remove()
    d3.select("#g" + nextMove).append("use").attr("xlink:href", "#knightDef").attr("transform", "scale(0.5)").attr("id", "knight")
    d3.select("#g" + currentVal).select("rect").attr("style", "opacity : 0.1 ")

    // draw the way we walked
    oldPathData = d3.select("#way").attr("d")
    d3.select("#way").attr("d", oldPathData + " l " + dx * this.cellSize + "  " + dy*this.cellSize)
}


theBoard.draw()
theBoard.placeKnight()

for (i = 0; i< 2100;i++){
    setTimeout(function() {theBoard.moveKnight()}, i*20)
}