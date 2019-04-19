// 全屏切换
d3.select("#screen-button")
    .on("click", function() {
        network_config.screen_state = !network_config.screen_state;
        network_config.screen_state === true ? enterFullScreen() : exitFullScreen();
        d3.select("#screen-switch")
            .attr("class", network_config.screen_state === true ? "fa fa-compress" : "fa fa-expand");
    });

//进入全屏
function enterFullScreen() {
    var de = document.documentElement;
    if (de.requestFullscreen) {
        de.requestFullscreen();
    } else if (de.mozRequestFullScreen) {
        de.mozRequestFullScreen();
    } else if (de.webkitRequestFullScreen) {
        de.webkitRequestFullScreen();
    }
}
//退出全屏
function exitFullScreen() {
    var de = document;
    if (de.exitFullscreen) {
        de.exitFullscreen();
    } else if (de.mozCancelFullScreen) {
        de.mozCancelFullScreen();
    } else if (de.webkitCancelFullScreen) {
        de.webkitCancelFullScreen();
    }
}