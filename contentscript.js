function AB_Repeater(video, height, color) {
  this.on = false;
  this.stime = -1;
  this.etime = -1;
  this.duration = -1;
  this.elem = null;
  this.video = video;
  this.vpos = null;
  this.dragelem = null;
  this.timerid = null;
  this.timerid2 = null;
  this.timerid3 = null;
  this.timerid4 = null;
  this.timerid5 = null;
  height ? (this.h = height) : (this.h = 14);
  color ? (this.color = color) : (this.color = "rgba(180,180,180,.6)");

  this.init = () => {
    this.createBar();
    this.getVideoPosition();
    this.attachDragEvent();
  };
  this.del = () => {
    this.removeBar();
    this.elem = null;
    this.video = null;
  };
  this.attachDragEvent = () => {
    let tid0 = null;
    let tid1 = null;
    let tid2 = null;

    window.addEventListener(
      "mouseup",
      (e) => {
        this.dragelem = null;
      },
      true
    );
    window.addEventListener(
      "mousemove",
      (e) => {
        let vpos = this.vpos;
        if (vpos) {
          clearTimeout(tid1);
          tid1 = setTimeout(() => {
            this.checkMousePosition(e, vpos);
          }, 10);
        }
        if (!this.dragelem) return;
        clearTimeout(tid0);
        tid0 = setTimeout(() => {
          let handle = this.dragelem;
          let left = e.clientX;
          let rect = handle.parentNode.getBoundingClientRect();
          let hwidth = handle.offsetWidth;
          let rval = rect.width - hwidth;
          let value = left - rect.left - hwidth / 2;
          if (value < 1) {
            value = 0;
          } else if (value > rval) {
            value = rval;
          }
          handle.style.left = value + "px";
          let rflg = handle.style.right;
          this.updateTime(rflg, value);
          this.setProgressBar();
        }, 10);
      },
      true
    );
  };
  this.checkMousePosition = (e, vpos) => {
    let px = e.pageX;
    let py = e.pageY;
    if (vpos.left < px && px < vpos.left + vpos.width) {
      if (vpos.top < py && py < vpos.top + vpos.height) {
        this.showBar();
        clearTimeout(this.timerid5);
        this.timerid5 = setTimeout(() => {
          this.hideBar();
        }, 3600);
      }
    }
  };
  this.setProgressBar = () => {
    let cont = this.elem;
    let bar = cont.firstChild;
    let bw = bar.offsetWidth;
    let pbar = bar.querySelector("div");
    let handles = bar.querySelectorAll("span");
    let h1pos = -1.0;
    let h2pos = -1.0;
    for (let handle of handles) {
      if (handle.style.right) {
        if (handle.style.left) h2pos = parseFloat(handle.style.left);
      } else {
        h1pos = parseFloat(handle.style.left);
      }
    }
    if (h2pos < 0) {
      pbar.style.left = h1pos + "px";
      pbar.style.right = 0;
    } else if (h1pos < h2pos) {
      pbar.style.left = h1pos + "px";
      pbar.style.right = bw - h2pos + "px";
    } else {
      pbar.style.left = h2pos + "px";
      pbar.style.right = bw - h1pos + "px";
    }
    pbar.style.background = "deeppink";
  };
  this.resetsetProgressBar = () => {
    let cont = this.elem;
    let bar = cont.firstChild;
    let pbar = bar.querySelector("div");
    pbar.style.background = "";
  };
  this.updateTime = (rflg, value) => {
    let rpos = 0;
    let lpos = 0;
    let handles = this.elem.querySelectorAll("span");
    let bw = this.elem.offsetWidth - this.h;
    for (let handle of handles) {
      if (handle.style.right) {
        let left = handle.style.left;
        if (left) {
          rpos = parseFloat(left);
        } else {
          rpos = bw;
        }
      } else {
        lpos = parseFloat(handle.style.left);
      }
    }
    this.showInfo(lpos, rpos, bw, rflg, value);
    let epos = 0;
    let spos = 0;
    if (lpos <= rpos) {
      spos = lpos;
      epos = rpos;
    } else {
      spos = rpos;
      epos = lpos;
      if (rflg) {
        rflg = false;
      } else {
        rflg = true;
      }
    }

    clearTimeout(this.timerid2);
    this.timerid2 = setTimeout(() => {
      this.updatePlayerTime(spos, epos, bw, rflg);
    }, 350);
  };
  this.showInfo = (lpos, rpos, bw, rflg, value) => {
    let duration = this.duration;
    let lbls = this.elem.querySelectorAll("label");
    let rtime = duration * (rpos / bw);
    let ltime = duration * (lpos / bw);
    let lbl = null;
    for (lbl of lbls) {
      if (lbl.style.right) {
        if (rflg) {
          lbl.textContent = this.hhmmss(rtime) + "";
          break;
        }
      } else {
        if (!rflg) {
          lbl.textContent = this.hhmmss(ltime) + "";
          break;
        }
      }
    }
    lbl.style.left = value - 25 + "px";
    lbl.style.display = "block";
    let tid = null;
    rflg ? (tid = this.timerid3) : (tid = this.timerid4);
    clearTimeout(tid);
    tid = setTimeout(() => {
      lbl.style.display = "none";
    }, 2800);
  };
  this.stopEventBubbling = (e) => {
    e.stopPropagation();
    // e.preventDefault();
  };
  this.seeked = (e) => {
    this.stopEventBubbling(e);
    this.detachVideoEvent(e);
    this.video.play();
  };
  this.attachVideoEvent = () => {
    video.addEventListener("seeked", this.seeked, true);
    video.addEventListener("waiting", this.stopEventBubbling, true);
    video.addEventListener("seeking", this.stopEventBubbling, true);
  };
  this.detachVideoEvent = () => {
    video.removeEventListener("seeked", this.seeked, true);
    video.removeEventListener("waiting", this.stopEventBubbling, true);
    video.removeEventListener("seeking", this.stopEventBubbling, true);
  };
  this.updatePlayerTime = (spos, epos, bw, rflg) => {
    let video = this.video;
    let duration = this.duration;
    let crntt = video.currentTime;
    let stime = duration * (spos / bw);
    let etime = duration * (epos / bw);
    let abs = Math.abs(stime - etime);
    if (abs < 1) return;
    video.removeEventListener("timeupdate", this.setLoop, true);

    if (stime === 0 && etime === duration) {
      console.log("");
      console.log("---clear loop---");
      this.clearLoop();
      this.resetsetProgressBar();
    } else {
      console.log("");
      console.log("---set loop---");
      console.log("duration : " + duration);
      console.log("stime    : " + stime);
      console.log("etime    : " + etime);
      this.stime = stime;
      this.etime = etime;
      if (!rflg && stime < crntt) video.currentTime = stime;
      this.on = true;
      video.addEventListener("timeupdate", this.setLoop, true);
    }
  };
  this.setLoop = () => {
    if (!this.on) return;
    let stime = this.stime;
    let etime = this.etime;
    let duration = this.duration;
    let video = this.video;
    let crntt = video.currentTime;

    if (duration < etime + 1.4) crntt += 1.4;
    if (crntt < stime || etime < crntt) {
      this.detachVideoEvent();
      this.attachVideoEvent();
      video.currentTime = stime;
    }
  };
  this.hhmmss = (seconds) => {
    let ss = parseInt(seconds);
    let mm = 0;
    let hh = 0;
    if (ss > 60) {
      mm = parseInt(ss / 60);
      ss = parseInt(ss % 60);
    }
    if (mm > 60) {
      hh = parseInt(mm / 60);
      mm = parseInt(mm % 60);
    }
    let result = ("00" + parseInt(ss)).slice(-2);
    if (mm > 0) {
      result = ("00" + parseInt(mm)).slice(-2) + ":" + result;
    } else {
      result = "00:" + result;
    }
    if (hh > 0) {
      result = ("00" + parseInt(hh)).slice(-2) + ":" + result;
    }
    return result;
  };
  this.clearLoop = () => {
    this.resetValue();
    this.video.removeEventListener("timeupdate", this.setLoop, true);
  };
  this.resetValue = () => {
    this.on = false;
    this.stime = -1;
    this.etime = -1;
  };
  this.resetRepeater = (cflg) => {
    this.clearLoop();
    this.setHandlePosition(0, 0);
    this.resetsetProgressBar();
    if (cflg) this.video.currentTime = 0;
  };
  this.createBar = () => {
    let cont = document.createElement("div");
    document.body.appendChild(cont);
    cont.style.display = "none";
    cont.style.position = "absolute";
    cont.style.top = 0;
    cont.style.right = 0;
    cont.style.left = 0;
    cont.style.padding = 0;
    cont.style.margin = 0;
    cont.style.zIndex = 2147483647;
    cont.style.opacity = 0;
    cont.style.transition = "0.5s";
    cont.style.transitionProperty = "opacity";
    this.elem = cont;

    let bar = document.createElement("div");
    cont.appendChild(bar);
    bar.style.position = "relative";
    bar.style.textAlign = "left";
    bar.style.padding = 0;
    bar.style.margin = 0;
    bar.style.marginTop = "5px";
    bar.style.boxSizing = "border-box";
    bar.style.height = "4px";
    bar.style.background = this.color;

    let pbar = document.createElement("div");
    bar.appendChild(pbar);
    pbar.style.position = "absolute";
    pbar.style.left = 0;
    pbar.style.right = 0;
    pbar.style.textAlign = "left";
    pbar.style.padding = 0;
    pbar.style.margin = 0;
    pbar.style.boxSizing = "border-box";
    pbar.style.height = "4px";

    this.createHandle(true, bar);
    this.createHandle(false, bar);
    this.createLabel(true, cont);
    this.createLabel(false, cont);
  };
  this.createHandle = (left, bar, cname) => {
    let handle = document.createElement("span");
    bar.appendChild(handle);

    handle.style.position = "absolute";
    handle.style.top = 0;
    handle.style.margin = 0;
    handle.style.marginTop = "-5px";
    handle.style.padding = 0;
    left ? (handle.style.zIndex = 3) : (handle.style.zIndex = 2);
    left ? (handle.style.left = 0) : (handle.style.right = 0);
    handle.style.height = this.h - 2 + "px";
    handle.style.width = this.h - 2 + "px";
    handle.style.cursor = "col-resize";
    handle.style.background = "#e50914";
    handle.style.border = "1px solid #e50914";
    handle.style.borderRadius = "12px";
    handle.addEventListener(
      "mousedown",
      (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.dragelem = e.target;
      },
      true
    );
    handle.addEventListener(
      "click",
      (e) => {
        e.stopPropagation();
        e.preventDefault();
      },
      true
    );
  };
  this.createLabel = (left, cont) => {
    let lbl = document.createElement("label");
    cont.appendChild(lbl);

    lbl.style.display = "none";
    lbl.style.position = "absolute";
    lbl.style.top = 0;
    lbl.style.margin = "36px 18px 0 18px";
    lbl.style.padding = "3px";
    left ? (lbl.style.left = 0) : (lbl.style.right = 0);
    lbl.style.fontSize = "13px";
    lbl.style.fontFamily = "Arial, sans-serif";
    lbl.style.height = this.h + "px";
    lbl.style.background = "#000000";
    lbl.style.color = "#ffffff";
    lbl.style.width = "fit-content";
    lbl.textContent = "";
  };
  this.setHandlePosition = (lpos, rpos) => {
    let handles = this.elem.querySelectorAll("span");
    for (let handle of handles) {
      if (handle.style.right) {
        handle.style.right = "0px";
        if (rpos) {
          handle.style.left = rpos + "px";
        } else {
          handle.style.left = "";
        }
      } else {
        lpos ? (lpos = lpos + "px") : (lpos = "0px");
        handle.style.left = lpos;
      }
    }
  };
  this.removeBar = () => {
    let elem = this.elem;
    if (elem) document.body.removeChild(elem);
  };
  this.hideBar = (flg) => {
    let elem = this.elem;
    if (elem) elem.style.opacity = 0;
    if (flg) {
      elem.style.display = "none";
    } else {
      setTimeout(() => {
        elem.style.display = "none";
      }, 500);
    }
  };
  this.showBar = () => {
    let elem = this.elem;
    if (!elem) return;
    elem.style.display = "block";
    setTimeout(() => {
      elem.style.opacity = 1;
    }, 10);
  };
  this.resize = () => {
    this.getVideoPosition();
    if (this.on) {
      let bw = this.elem.offsetWidth - this.h;
      let stime = this.stime;
      let etime = this.etime;
      let duration = this.duration;
      let lpos = (stime / duration) * bw;
      let rpos = (etime / duration) * bw;
      this.setHandlePosition(lpos, rpos);
      this.setProgressBar();
    } else {
      this.setHandlePosition(0, 0);
      this.resetsetProgressBar();
    }
  };
  this.getVideoPosition = () => {
    let video = this.video;
    let pos = this.getAbsolutePosition(video);
    if (pos) {
      this.vpos = pos;
      this.setPosition(pos);
    } else {
      this.vpos = null;
      this.hideBar(true);
    }
  };
  this.getAbsolutePosition = (video) => {
    let html = document.documentElement;
    let body = document.body;
    let rect = video.getClientRects()[0];
    if (rect) {
      let recr = rect.right,
        recl = rect.left;
      let left = (body.scrollLeft || html.scrollLeft) - html.clientLeft + recl;
      let top = (body.scrollTop || html.scrollTop) - html.clientTop + rect.top;
      if (top < 0) top = 0;
      if (left < 0) left = 0;
      var pos = {
        top: top,
        left: left,
        width: rect.width,
        height: rect.height,
      };
      return pos;
    } else if (
      video.style.position === "absolute" &&
      video.style.width === "100%" &&
      video.style.height === "100%"
    ) {
      var pos = {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
      return pos;
    }
    return false;
  };
  this.setPosition = (pos) => {
    let elem = this.elem;
    elem.style.top = pos.top + 4 + "px";
    elem.style.left = pos.left + "px";
    elem.style.width = pos.width + "px";
  };
  this.init();
}
const AB_Repeaters = {
  items: [],
  observer: null,
  resizeObserver: null,
  init: function (count) {
    let videos = document.querySelectorAll("video");
    if (0 < videos.length) {
      let vfunc = (video) => {
        let abr = new AB_Repeater(video, 15, "rgba(60, 60, 60, 0.5)");
        this.items.push(abr);
        this.resizeObserver.observe(video);
        let func = (flg) => {
          abr.duration = video.duration;
          abr.resize();
          abr.resetRepeater(flg);
        };
        if (1 < video.readyState) func();
        video.addEventListener(
          "loadeddata",
          (e) => {
            console.log("---loadeddata---");
            func(true);
          },
          true
        );
        video.addEventListener(
          "durationchange",
          (e) => {
            console.log("---durationchange---");
            abr.resize();
          },
          true
        );
        video.addEventListener(
          "canplay",
          (e) => {
            console.log("---canplay---");
            abr.resize();
          },
          true
        );
      };
      this.attachEvent(vfunc);
      videos.forEach((video, index) => {
        vfunc(video);
      });
    } else if (count < 8) {
      setTimeout(() => {
        this.init(++count);
      }, 1000);
    }
  },
  attachEvent: function (vfunc) {
    let tid = null;
    this.resizeObserver = new ResizeObserver((entries) => {
      clearTimeout(tid);
      tid = setTimeout(() => {
        this.resize();
      }, 1100);
    });
    let attrModified = (mutation) => {
      let addnodes = mutation.addedNodes;
      if (addnodes.length < 1) return;
      addnodes.forEach((node, index) => {
        if (node.tagName === "VIDEO") {
          vfunc(node);
        }
      });
    };
    this.observer = new MutationObserver(function (mutations) {
      mutations.forEach(attrModified);
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("fullscreenchange", (e) => {
      this.resize();
    });
  },
  resize: function () {
    this.items.forEach((abr, index) => {
      abr.resize();
    });
  },
};
setTimeout(function () {
  AB_Repeaters.init(0);
}, 2000);
