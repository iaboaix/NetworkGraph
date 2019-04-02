function brush(nodeElement, data) {

    brushEvent = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("start", brushStarted)
        .on("brush", brushed)
        .on("end", brushEnded);

	var brush_svg = svg.append("g")
        .append("g")
        .attr("class", "brush_svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "none")
        .call(brushEvent);

    // 框选模式
    let check = false;
    d3.select("#brush_mode")
        .on("click", function () {
            check = !check;
            if (check) {
                d3.select(this).classed("on", true);
                brush_svg.style("display", "block");
            }
            else {
                d3.select(this).classed("on", false);
                brush_svg.style("display", "none");
            }
        })
}

function brushStarted() {
    if (d3.event.sourceEvent.type !== "end") {
        nodeElements.classed("selected", false);
        data.nodes.map(function(node) {
            node.selected = false;
        });
    }
}

function brushed() {
  if (d3.event.sourceEvent.type !== "end") {
    var selection = d3.event.selection;
    nodeElements.classed("selected", function(d) {
      return d.selected = d.previouslySelected ^
        (selection != null
        && selection[0][0] <= d.x && d.x < selection[1][0]
        && selection[0][1] <= d.y && d.y < selection[1][1]);
    });
  }
}

function brushEnded() {
    if (d3.event.selection != null) {
      d3.select(this).call(d3.event.target.move, null);
    }
}