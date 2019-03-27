// 屏蔽右键菜单
document.oncontextmenu=function(ev){
	ev.preventDefault();
}

// 上传数据功能
var upload_layout = d3.select("#upload_layout");
d3.select("#upload_data")
	.on("click", function() {
		upload_layout.style("display", "block");
	});
var offset_x, offset_y, isdown = false;
var upload_layout = d3.select("#upload_layout");
upload_layout.on("mousedown", function() {
		offset_x = event.pageX - this.offsetLeft;
		offset_y = event.pageY- this.offsetTop;
		isdown = true;
	})
	.on("mousemove", function() {
		if (isdown) {
			upload_layout.style("left", event.pageX - offset_x + "px");
			upload_layout.style("top", event.pageY - offset_y + "px");
		}
	})
	.on("mouseup", function() {
		isdown = false;
	});
d3.select("#close_button")
	.on("click", function() {
		upload_layout.style("display", "none");
	});
d3.select("#file_close")
	.on("click", function() {
		upload_layout.style("display", "none");
	});
d3.select("#select_file")
	.on("click", function() {
		document.getElementById("file_input").click();
	});
d3.select("#file_input")
	.on("input propertychange", function() {
		var file_item = d3.select("#info_file")
							.append("div")
							.attr("id", "file_item");
		file_item.append("div")
			.attr("id", "file_name")
			.text(this.value);
		file_item.append("div")
			.attr("id", "state")
			.text("等待上传");
	})
// 下载图片
d3.select("#download_img")
	.on("click", function() {
		saveSvgAsPng(document.getElementById("svg"), "networkGraph.png");
	})
