import me from "./lib/melon";
import { connect } from "./connection";

me.device.onReady(() => {
  if (
    !me.video.init(8 * 16 * 8, 8 * 9 * 8, {
      parent: "content",
      scale: "auto",
      scaleMethod: "fill-max",
    })
  ) {
    alert("Your browser does not support HTML5 canvas.");
    return;
  }

  // add a keyboard shortcut to toggle Fullscreen mode on/off
  me.input.bindKey(me.input.KEY.F, "toggleFullscreen");
  me.event.on(me.event.KEYDOWN, (action: string) => {
    // toggle fullscreen on/off
    if (action === "toggleFullscreen") {
      me.device.requestFullscreen();
    } else {
      me.device.exitFullscreen();
    }
  });

  connect();
});
