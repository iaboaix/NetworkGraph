var bar_config = {width: 400,
                  height: 300,
                  top: 20, 
                  bottom: 70, 
                  left: 20, 
                  right: 20,
                 }

function drawBarChart(data){
    var bar_graph = d3.select("#bargraph")
        .attr("width", bar_config.width)
        .attr("height", bar_config.height)
        .attr("transform", "translate(" + (width - bar_config.width + 2) + ", " + 32 + ")")
        .attr("display", "none");

    var bar_data = translate_to_bardata(data);

    // x 轴
    var x_label = [];
    bar_data.forEach(function(data) {
        x_label.push(data.label);
    });
    var xScale = d3.scaleBand()
        .domain(x_label)
        .range([0, bar_config.width - bar_config.left - bar_config.right]);
    var xAxis = d3.axisBottom(xScale);
    // y 轴
    var yScale = d3.scaleLinear()
        .domain([0, bar_data[0].data])
        .range([bar_config.height - bar_config.top - bar_config.bottom, 0]);
    var yAxis = d3.axisLeft(yScale);
    // 颜色比例尺
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var step = (bar_config.width - bar_config.left - bar_config.right) / bar_data.length;
    var padding = step * 0.3;

    bar_graph.selectAll("*").remove();

    bar_graph.append("g")
        .attr("id", "text-rotate")
        .attr("transform", "translate(" + bar_config.left + ", " + (bar_config.height - bar_config.bottom) + ")")
        .call(xAxis);

    bar_graph.append("g")
        .attr("transform", "translate(" + bar_config.left + ", " + bar_config.top + ")")
        .call(yAxis);

    var bars = bar_graph.append("g")
        .selectAll(".rect")
        .data(bar_data)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            return i * step + bar_config.left + padding/ 2;
        })  
        .attr("y", function(d) {
            return yScale(d.data) + bar_config.top;
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
            return bar_config.height - bar_config.top - bar_config.bottom - yScale(d.data);
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
        })
}