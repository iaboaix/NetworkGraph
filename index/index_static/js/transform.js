// 获取元素格式化的 transform 属性
function getTranslateAndScaleAndRotate(element) {
    var transform = d3.select(element).attr("transform");
    var match_translate_scale = transform && /translate/.test(transform) && /scale/.test(transform) && transform.match(/translate\(([^\)]+)\)\s?scale\(([^\)]+)/);
    var translate = match_translate_scale && match_translate_scale[1].split(",") || [0, 0];
    var k = match_translate_scale && match_translate_scale[2] || 1;
    var match_rotate = transform && /rotate/.test(transform) && transform.match(/\s?rotate\(([^\)]+)/);
    var rotate = match_rotate && match_rotate[1] || 0;
    var x = translate[0];
    var y = translate[1];
    return {"x": x, "y": y, "k": k, "rotate": rotate};
}

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
    var translate = "translate(" + vars.x + "," + vars.y + ") ";
    var scale = "scale(" + vars.k + ") ";
    var rotate = "rotate(0)"
    if (typeof(vars.rotate) === "number") {
        rotate = "rotate(" + vars.rotate + "," + (window.innerWidth / 2) + " " + (window.innerHeight / 2) + ")";
    }
    else {
        rotate = "rotate(" + vars.rotate.split(",")[0] + "," + (window.innerWidth / 2) + " " + (window.innerHeight / 2) + ")";
    }
    network_graph.attr("transform", translate + scale + rotate);
    brush_svg.attr("transform", translate + scale + rotate);
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
    // var translate_scale_rotate = getTranslateAndScaleAndRotate("#network-graph");
    // translate_scale_rotate.k = 1;
    // zoomFunction(translate_scale_rotate);
    network_graph.call(zoom.transform, d3.zoomIdentity);
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