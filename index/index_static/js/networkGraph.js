var width = window.innerWidth
var height = window.innerHeight
var svg = d3.select('svg')
            .attr('width', width)
            .attr('height', height);

var brush = svg.append("g")
    .attr("class", "brush")
    .attr("width", width)
    .attr("height", height);

d3.json("static/ok.json").then(function(data) {
    var linkForce = d3
      .forceLink()
      .id(function (link) { return link.id })
      .strength(0.7);

    var linkElements = svg.append("g")
      .attr("class", "link_layout")
      .selectAll("g")
      .data(data.links)
      .enter().append("line")

    var nodeElements = svg.append("g")
      .attr("class", "node_layout")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(node, i){ return 12; })            
      .on("mousedown", mousedowned)
      .on("mouseover", hoverNode)
      .call(d3.drag().on("drag", function() {
          nudge(d3.event.dx, d3.event.dy);
      }));

    var textElements = svg.append("g")
      .attr("class", "texts")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("text")
      .text(function (node) { return  node.label })
      .style("display", "none")
      .attr("font-size", 13)
      .attr("dx", 15)
      .attr("dy", 4);

    var simulation = d3
      .forceSimulation()
      .force('link', linkForce)
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .nodes(data.nodes).on('tick', () => {
          nodeElements
              .attr('cx', function (node) { return node.x })
              .attr('cy', function (node) { return node.y })
          textElements
              .attr('x', function (node) { return node.x })
              .attr('y', function (node) { return node.y })
          linkElements
              .attr('x1', function (link) { return link.source.x })
              .attr('y1', function (link) { return link.source.y })
              .attr('x2', function (link) { return link.target.x })
              .attr('y2', function (link) { return link.target.y })
        })
      .force("link").links(data.links);;

    function getNeighbors(node) {
      return data.links.reduce(function (neighbors, link) {
          if (link.target.id === node.id) {
            neighbors.push(link.source.id)
          } else if (link.source.id === node.id) {
            neighbors.push(link.target.id)
          }
          return neighbors
        },
        [node.id]
      )
    }

    function isNeighborLink(node, link) {
      return link.target.id === node.id || link.source.id === node.id;
    }


    function getNodeColor(node, neighbors) {
      if (Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1) {
        return node.level === 1 ? 'blue' : 'green';
      }

      return node.level === 1 ? 'red' : 'gray';
    }

    function getLinkColor(node, link) {
      return isNeighborLink(node, link) ? 'yellow' : 'yellow';
    }

    function getTextColor(node, neighbors) {
      return Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1 ? 'white' : 'black';
    }
    
    // 掠过显示节点信息
    function hoverNode(hover_node) {
        var node_info = d3.select("#node_info")
                          .style("display", "block");
        node_info.selectAll(".info").remove();
        for(var item in hover_node){
            if(['x', 'y', 'vx', 'vy', 'index', 'selected', 'previouslySelected']
                .indexOf(item.toString()) != -1) {
                continue;
            }
            node_info.append('p')
                     .attr("class", "info")
                     .text(item + ": " + hover_node[item]);
        }
    }

    function mousedowned(node) {
        if (node.selected){
            return;
        }
        else{
            d3.select(this).classed("selected", node.selected = true);
        }
    }
    
    function brushstarted() {
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

    function brushended() {
        if (d3.event.selection != null) {
          d3.select(this).call(d3.event.target.move, null);
        }
    }

    // 框选功能
    data.nodes.forEach(function(d) {
        d.selected = false;
        d.previouslySelected = false;
    });
    
    brush.call(d3.brush()
        .extent([[0, 0], [width, height]])
        .on("start", brushstarted)
        .on("brush", brushed)
        .on("end", brushended));

    function nudge(dx, dy) {
        nodeElements.filter(function(d) { return d.selected; })
          .attr("cx", function(d) { return d.x += dx; })
          .attr("cy", function(d) { return d.y += dy; })

        textElements.filter(function(d) { return d.selected; })
          .attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.y; })

        linkElements.filter(function(d) { return d.source.selected; })
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; });

        linkElements.filter(function(d) { return d.target.selected; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
    }

    // 左侧工具栏功能实现
    var zoom = d3.zoom()
             .scaleExtent([1, 10])
             .on("zoom", zoomed);
    svg.call(zoom)
       .on('dblclick.zoom', null);
    function zoomed() {
       svg.selectAll("g").attr("transform", d3.event.transform);
    }
    // 按钮缩放
    d3.select("#zoom_out").on("click", function() {
       zoom.scaleBy(svg, 2);
    });      
    d3.select("#zoom_in").on("click", function() {
       zoom.scaleBy(svg, 0.5);
    });      
    d3.select("#zoom_reset").on("click", function() {
       svg.call(zoom.transform, d3.zoomIdentity);
    });

    // 重置布局
    d3.select("#reset").on("click", function() {
        simulation.force('center', d3.forceCenter(width / 2, height / 2));
        simulation.restart();
    });

    // 标签显示开关功能实现
    var is_show_label = false;
    var label_switch_button = d3.select("#label_switch");
    label_switch_button.on("click", function() {
        if (is_show_label) {
            label_switch_button.select("i").attr("class","fa fa-toggle-off");
            textElements.style("display", "none");
        }
        else {
            label_switch_button.select("i").attr("class","fa fa-toggle-on");
            textElements.style("display", "block");
        }
        is_show_label = !is_show_label;
    })

    // 调整图参数
    d3.select("#node_size").on("input propertychange", function() {
        var size = this.value;
        nodeElements.attr("r", function(node, i){
            return size;
        });
    });
    d3.select("#node_opacity").on("input propertychange", function() {
        var opacity = this.value;
        nodeElements.style("opacity", function(node, i){
            return opacity;
        });
    });        
    d3.select("#node_stroke").on("input propertychange", function() {
        var stroke_width = this.value;
        nodeElements.style("stroke-width", function(node, i){
            return stroke_width;
        });
    });
    d3.select("#line_stroke_width").on("input propertychange", function() {
        var line_stroke_width = this.value;
        console.log(line_stroke_width)
        linkElements.style("stroke-width", function(node, i){
            return line_stroke_width;
        });
    });
    
    // 颜色标记
    d3.selectAll(".color_item")
      .on("click", changeColor);
    function changeColor() {
        nodeElements.filter(function(d) { return d.selected; })
            .attr("fill", d3.select(this).style("background-color"));
    }
    d3.select("#color_select").on("change", function () {
        console.log(this.value);
        nodeElements.filter(function(d) { return d.selected; })
            .attr("fill", this.value);
    });

    d3.select("#setting_button").on("click", changeShowState);
    var setting_box = d3.select("#setting_box");
    var hide_setting = d3.select("#hide_setting")
                         .on("click", hideSettingBox);
    var isShow = false;
    function changeShowState() {
        isShow = !isShow;
        if (isShow) {
            setting_box.style("display", "block");
        }
        else {
            setting_box.style("display", "none");
        }
    }
    function hideSettingBox() {
        isShow = false;
        setting_box.style("display", "none");
    }

    d3.select("#resize").on("click", resize);
    var check = true;
    var resize_button = d3.select("#resize").select("i");
    function resize() {
        if (check) {
            enterFullScreen()
            resize_button.attr("class","fa fa-compress");
        }
        else {
            exitFullScreen()
            resize_button.attr("class","fa fa-expand");
        }
        check = !check;
    }
});
