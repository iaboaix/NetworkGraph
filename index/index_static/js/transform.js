// 缩放
var zoom = d3.zoom()
    .on("zoom", function() {
        var translate_scale_rotate = getTranslateAndScaleAndRotate("#network-graph");
        d3.event.transform["rotate"] = translate_scale_rotate.rotate;
        zoomFunction(d3.event.transform);
    });

container.call(zoom)
    .on("dblclick.zoom", null);

function zoomFunction(vars) {
    network_graph.attr("transform", "translate(" + vars.x + "," + vars.y + ") " + "scale(" + vars.k + ") " + "rotate(" + vars.rotate + ")");
    brush_svg.attr("transform", "translate(" + vars.x + "," + vars.y + ") " + "scale(" + vars.k + ") " + "rotate(" + vars.rotate + ")");
    brush_svg.select("rect")
        .attr("x", - vars.x / vars.k)
        .attr("y", - vars.y / vars.k)
        .attr("width", window.innerWidth / vars.k)
        .attr("height", window.innerHeight / vars.k);
}

d3.select("#zoom-out").on("click", function() {
    var translate_scale_rotate = getTranslateAndScaleAndRotate("#network-graph");
    translate_scale_rotate.k = parseFloat(translate_scale_rotate.k) * 1.5 + '';
    zoomFunction(translate_scale_rotate);    
});      

d3.select("#zoom-in").on("click", function() {
    var translate_scale_rotate = getTranslateAndScaleAndRotate("#network-graph");
    translate_scale_rotate.k = parseFloat(translate_scale_rotate.k) / 1.5 + '';
    zoomFunction(translate_scale_rotate);
});      

d3.select("#zoom-reset").on("click", function() {
    var translate_scale_rotate = getTranslateAndScaleAndRotate("#network-graph");
    translate_scale_rotate.k = "1";
    zoomFunction(translate_scale_rotate);
});

// 顺时针旋转
d3.select("#rotate")
    .on("click", function() {
        var translate_scale_rotate = getTranslateAndScaleAndRotate("#network-graph");
        translate_scale_rotate.rotate = parseInt(translate_scale_rotate.rotate) + 10 + '';
        zoomFunction(translate_scale_rotate);
    })

// 逆时针旋转
d3.select("#rerotate")
    .on("click", function() {
        var translate_scale_rotate = getTranslateAndScaleAndRotate("#network-graph");
        translate_scale_rotate.rotate = parseInt(translate_scale_rotate.rotate) - 10 + '';
        zoomFunction(translate_scale_rotate);
    })