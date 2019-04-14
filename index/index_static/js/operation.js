// 屏蔽右键菜单
document.oncontextmenu=function(ev){
	ev.preventDefault();
}

// 上传数据功能
var upload_layout = d3.select("#upload-layout");
d3.select("#upload-data")
	.on("click", function() {
		upload_layout.style("display", "block");
	});
var offset_x, offset_y, isdown = false;
upload_layout.select("#upload-top-layout")
	.on("mousedown", function() {
		offset_x = event.pageX - this.parentNode.offsetLeft;
		offset_y = event.pageY - this.parentNode.offsetTop;
		isdown = true;
		d3.select("#svg")
			.on("mousemove.move-upload-layout", function() {
				if (isdown) {
					upload_layout.style("left", d3.event.pageX - offset_x + "px");
					upload_layout.style("top", d3.event.pageY - offset_y + "px");
				}
			})
	})
	.on("mouseup", function() {
		isdown = false;
	})
	.on("mousemove", function() {
		if (isdown) {
			upload_layout.style("left", event.pageX - offset_x + "px");
			upload_layout.style("top", event.pageY - offset_y + "px");
		}
	});

d3.select("#close-button")
	.on("click", function() {
		upload_layout.style("display", "none");
	});
d3.select("#file-close")
	.on("click", function() {
		upload_layout.style("display", "none");
	});
d3.select("#select-file")
	.on("click", function() {
		document.getElementById("file-input").click();
	});
d3.select("#file-input")
	.on("input propertychange", function() {
		d3.select("#file-name").text(this.value);
		d3.select("file-state").text("等待上传");
	})

// 导出图片
d3.select("#download-img")
	.on("click", function() {
		saveSvgAsPng(document.getElementById("svg"), "networkGraph.png");
	})

// 查找节点
d3.select("#search-button")
	.on("click", function() {
		const node_label = $("#search-line").val();
		let is_find = false;
		d3.selectAll(".node")
			.each(function(node) {
				if (node.label == node_label) {
					d3.select(this).classed("find-node", true);
					is_find = true;
				}
			})
		if (is_find === false) {
			alert("未查找到此节点");
		}
	})
