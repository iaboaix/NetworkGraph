function drawBarChart(data){
    var bar_data = translate_to_bardata(data).slice(0, 15);

    // x 轴
    var x_label = [];
    bar_data.forEach(function(data) {
        x_label.push(data.label);
    });
    var xScale = d3.scaleBand()
        .domain(x_label)
        .range([0, BARCONFIG.width - BARCONFIG.left - BARCONFIG.right]);
    var xAxis = d3.axisBottom(xScale);
    // y 轴
    var yScale = d3.scaleLinear()
        .domain([0, bar_data[0].data])
        .range([BARCONFIG.height - BARCONFIG.top - BARCONFIG.bottom, 0]);
    var yAxis = d3.axisLeft(yScale);
    // 颜色比例尺
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var step = (BARCONFIG.width - BARCONFIG.left - BARCONFIG.right) / bar_data.length;
    var padding = step * 0.3;

    bar_graph.selectAll(".bar-elements").remove();

    bar_graph.append("g")
        .attr("id", "text-rotate")
        .attr("class", "bar-elements")
        .attr("transform", "translate(" + BARCONFIG.left + ", " + (BARCONFIG.height - BARCONFIG.bottom) + ")")
        .call(xAxis);

    bar_graph.append("g")
        .attr("class", "bar-elements")
        .attr("transform", "translate(" + BARCONFIG.left + ", " + BARCONFIG.top + ")")
        .call(yAxis);

    var bars = bar_graph.append("g")
        .selectAll(".rect")
        .data(bar_data)
        .enter()
        .append("rect")
        .attr("class", "bar-elements")
        .attr("x", function(d, i) {
            return i * step + BARCONFIG.left + padding/ 2;
        })  
        .attr("y", function(d) {
            return yScale(d.data) + BARCONFIG.top;
        })
        .attr("width", function() {
            return step - padding;
        })
        .attr("height", function(d) {
            return 0;
        })
        .attr("fill", function(d, i) {
            return color(i);
        })
        .on("click", function(bar) {
            find_node_label(bar.label);
            d3.event.stopPropagation();  
        });
    bars.transition()
        .delay(function(d, i){
            return i * 150;
        })
        .duration(1500)
        .ease(d3.easeCubicOut)
        .attr("height", function(d) {
            return BARCONFIG.height - BARCONFIG.top - BARCONFIG.bottom - yScale(d.data);
        });

    bar_graph.selectAll("#text-rotate text")
        .style("text-anchor", "end")
        .style("font-size", "13px")
        .attr("transform", function(d, i) {
            return "rotate(-45)";
        });
}

function translate_to_bardata(data) {
    var bars = {};
    data.nodes.forEach(function(node) {
        if (isNaN(bars[node.label])) {
            bars[node.label] = 1;
        }
        else {
            bars[node.label] += 1;
        }
    })
    var bar_data = [];
    for(var item in bars) {
        bar_data.push({"label": item, "data": bars[item]})
    }
    // 对数据按照 data 排序
    bar_data = bar_data.sort(function(x, y) {
        return y.data - x.data;
    });
    return bar_data;
}

function find_node_label(label) {
    d3.selectAll(".finded").classed("finded", false);
    d3.selectAll(".node")
        .each(function(node) {
            if (node.label === label) {
                d3.select(this).classed("finded", true);
            }
        });
}