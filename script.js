(function () {
  var c = document.getElementById("sky"),
    x = c.getContext("2d"),
    W,
    H,
    dpr = Math.min(devicePixelRatio || 1, 2);
  var mx = -999,
    my = -999,
    tx = 0,
    ty = 0,
    warp = 0,
    warpOn = false,
    sv = 0,
    lastY = scrollY,
    shock = [];
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var disk = [],
    stars = [];
  function size() {
    W = innerWidth;
    H = innerHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  addEventListener("resize", size);
  function rd() {
    return {
      a: Math.random() * 6.283,
      r: 70 + Math.pow(Math.random(), 1.6) * Math.min(W, 900) * 0.5,
      s: Math.random() * 0.7 + 0.6,
      z: Math.random() * 1.4 + 0.4,
      h: Math.random(),
    };
  }
  for (var i = 0; i < (innerWidth < 700 ? 500 : 1100); i++) disk.push(rd());
  for (var i = 0; i < (innerWidth < 700 ? 90 : 200); i++)
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: 0,
      vy: 0,
      z: Math.random() * 1.5 + 0.3,
      ox: 0,
      oy: 0,
    });
  stars.forEach(function (s) {
    s.ox = s.x;
    s.oy = s.y;
  });
  addEventListener("pointermove", function (e) {
    mx = e.clientX;
    my = e.clientY;
    tx = mx / W - 0.5;
    ty = my / H - 0.5;
    cur.style.transform = "translate(" + mx + "px," + my + "px)";
  });
  var ptype = "mouse";
  function feed(x, y) {
    shock.push({ x: x, y: y, t: 0 });
    var dx = x - cx,
      dy = y - cy,
      d = Math.hypot(dx, dy) + 1;
    fall.push({ x: x, y: y, vx: (-dy / d) * 3, vy: (dx / d) * 3 });
  }
  addEventListener("pointerdown", function (e) {
    ptype = e.pointerType;
    if (e.target.closest && e.target.closest("a,button,.card")) return;
    if (e.pointerType === "mouse") {
      feed(e.clientX, e.clientY);
      drag = true;
      lx = e.clientX;
      ly = e.clientY;
    }
  });
  addEventListener("click", function (e) {
    if (ptype === "mouse" || (e.target.closest && e.target.closest("a,button,.card,header,nav")))
      return;
    feed(e.clientX, e.clientY);
  });
  addEventListener("pointermove", function (e) {
    if (!drag) return;
    dY += (e.clientX - lx) * 0.004;
    dI = Math.max(-0.3, Math.min(1, dI + (e.clientY - ly) * 0.004));
    lx = e.clientX;
    ly = e.clientY;
  });
  addEventListener("pointerup", function () {
    drag = false;
  });
  var cur = document.getElementById("cur");
  document.querySelectorAll("a,button,.card").forEach(function (el) {
    el.addEventListener("pointerenter", function () {
      cur.classList.add("on");
    });
    el.addEventListener("pointerleave", function () {
      cur.classList.remove("on");
    });
  });
  var MOB = matchMedia("(pointer:coarse)").matches || innerWidth < 700;
  var cx = 0,
    cy = 0,
    sy = 0,
    uT = 0,
    ps = 0,
    flare = 0,
    dY = 0,
    dI = 0,
    drag = false,
    lx = 0,
    ly = 0,
    fall = [];
  var bhc = document.getElementById("bh"),
    gl = bhc.getContext("webgl", { antialias: false, alpha: false }),
    U = {},
    sc = MOB ? 0.55 : 1,
    ft = 0,
    fc = 0,
    lt = performance.now();
  function glsize() {
    bhc.width = Math.floor(innerWidth * sc);
    bhc.height = Math.floor(innerHeight * sc);
    if (gl) gl.viewport(0, 0, bhc.width, bhc.height);
  }
  if (gl) {
    try {
      function sh(t, src) {
        var o = gl.createShader(t);
        gl.shaderSource(o, src);
        gl.compileShader(o);
        if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o);
        return o;
      }
      var pg = gl.createProgram();
      gl.attachShader(
        pg,
        sh(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"),
      );
      gl.attachShader(
        pg,
        sh(
          gl.FRAGMENT_SHADER,
          `
      precision highp float;
      uniform vec2 uRes,uC;uniform float uR,uT,uInc,uYaw,uExp,uDist,uWarp,uFlare;
      float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.1+7.;a*=.5;}return s;}
      vec3 stars(vec3 d){vec3 col=vec3(0.);
        for(int L=0;L<3;L++){float k=40.+float(L)*50.,fl=float(L);vec3 p=d*k,c=floor(p)+fl*13.,f=p-floor(p)-.5;
          float h=h3(c);vec3 o=vec3(h3(c+1.),h3(c+2.),h3(c+3.))-.5;float dd=length(f-o*.6);
          float b=step(.78+.05*fl,h)*(.5+3.*pow(h3(c+9.),4.))*(.85+.15*sin(uT*2.+h*60.));
          col+=mix(vec3(1.,.75,.5),vec3(.65,.78,1.),h3(c+5.))*b*(smoothstep(.2,0.,dd)+exp(-dd*dd*30.)*.35);}
      return col;}

      float pat(float a,float rho){vec2 cs=vec2(cos(a),sin(a));float sp=a+log(rho)*2.2;
      return fbm(vec2(cos(sp),sin(sp))*rho*1.2+rho*.9)*.6+fbm(cs*rho*6.+vec2(rho*5.,-rho*3.))*.4;}
      vec3 bb(float t){return mix(mix(vec3(.55,.08,.01),vec3(1.,.5,.12),smoothstep(.15,.6,t)),mix(vec3(1.,.8,.45),vec3(1.,.97,.9),smoothstep(1.1,1.8,t)),smoothstep(.6,1.2,t));}
      
      void main(){
        vec2 uv=(gl_FragCoord.xy-uC)/uR*.12;
        float ci=cos(-uInc),si=sin(-uInc),cy=cos(uYaw),sy=sin(uYaw);
        mat3 Rx=mat3(1.,0.,0.,0.,ci,-si,0.,si,ci);mat3 Ry=mat3(cy,0.,-sy,0.,1.,0.,sy,0.,cy);mat3 M=Ry*Rx;
        vec3 pos=M*vec3(0.,0.,-uDist),vel=normalize(M*vec3(uv,1.));
        float h2=dot(cross(pos,vel),cross(pos,vel));pos+=vel*h1(gl_FragCoord.xy)*.3;
        vec3 col=vec3(0.);float tr=1.;bool hit=false;float pg=0.;
          for(int i=0;i<${MOB ? 150 : 240};i++){
              float r=length(pos);
              if(r<1.){hit=true;break;}
              if(r>30.&&dot(pos,vel)>0.)break;
              float dt=clamp(.06*(r-.8),.02,.55);if(abs(pos.y)<1.5&&r<13.)dt=min(dt,.05+.4*abs(pos.y));
              vel=normalize(vel-1.5*h2*pos/(r*r*r*r*r)*dt);
              pos+=vel*dt;pg+=exp(-pow((r-1.5)*10.,2.))*dt;
              float rho=length(pos.xz);
              if(rho>2.6&&rho<12.&&abs(pos.y)<1.2){
                float th=.035+.03*rho,dens=exp(-pos.y*pos.y/(th*th));
                float om=1.4/pow(rho,1.5),P=60.,t0=mod(uT,P),t1=mod(uT+P*.5,P),q0=1.-smoothstep(P-6.,P,t0),q1=1.-smoothstep(P-6.,P,t1),qs=q0+q1,ab=atan(pos.z,pos.x);
                float pt=pat(ab-om*t0,rho)*q0/qs;if(q1>.002)pt+=pat(ab-om*t1,rho)*q1/qs;
                float grain=.7+.6*(vn(vec2(rho*9.,1.))*.5+vn(vec2(rho*23.,3.))*.5);
                float arm=.75+.25*cos(2.*ab-uT*.9+log(rho)*2.5);
                float n=clamp(pt*1.3-.1,0.,1.2)*grain*arm;
                vec3 tg=normalize(vec3(-pos.z,0.,pos.x));
                float D=1./(1.-sqrt(.5/rho)*.95*dot(tg,-vel));
                float T=pow(2.8/rho,.7)*D*(.85+uWarp*.5)*(.8+.4*n);
                float fo=pow(2.8/rho,1.5)*smoothstep(12.,8.,rho)*pow(D,3.);
                float rim=exp(-pow((rho-2.95)*6.,2.))*1.6;
                float e=(1.+uFlare*2.)*dens*(.18+1.7*n+rim)*fo*smoothstep(2.6,3.2,rho);
                col+=tr*bb(T)*e*dt*7.;
                float hz=exp(-pos.y*pos.y/(th*th*30.));
                col+=tr*bb(T*.8)*hz*fo*(.12+.5*n)*smoothstep(2.6,3.4,rho)*dt*.9;
                tr*=exp(-dens*dt*2.2);
            }
          }
        if(!hit)col+=tr*(stars(normalize(vel))*2.+vec3(1.,.78,.5)*min(pg,3.)*.8);
        col*=uExp*1.3;col=(col*(2.51*col+.03))/(col*(2.43*col+.59)+.14);col=pow(clamp(col,0.,1.),vec3(.95));
      gl_FragColor=vec4(col,1.);
    }`,
        ),
      );
      gl.linkProgram(pg);
      gl.useProgram(pg);
      var bf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var lc = gl.getAttribLocation(pg, "p");
      gl.enableVertexAttribArray(lc);
      gl.vertexAttribPointer(lc, 2, gl.FLOAT, false, 0, 0);
      ["uRes", "uC", "uR", "uT", "uInc", "uYaw", "uExp", "uDist", "uWarp", "uFlare"].forEach(
        function (n) {
          U[n] = gl.getUniformLocation(pg, n);
        },
      );
    } catch (err) {
      console.error(err);
      gl = null;
    }
  }
  glsize();
  addEventListener("resize", glsize);
  function render(cx, cy, R, p) {
    if (!gl) return;
    var nw = performance.now();
    ft += nw - lt;
    lt = nw;
    fc++;
    if (fc == 40) {
      var av = ft / 40;
      ft = 0;
      fc = 0;
      if (av > 24 && sc > (MOB ? 0.35 : 0.45)) {
        sc = Math.max(MOB ? 0.35 : 0.45, sc - 0.1);
        glsize();
      } else if (av < 10 && sc < (MOB ? 0.7 : 1)) {
        sc = Math.min(MOB ? 0.7 : 1, sc + 0.1);
        glsize();
      }
    }
    uT += reduce ? 0 : 0.03 * (1 + warp * 5);
    gl.uniform2f(U.uRes, bhc.width, bhc.height);
    gl.uniform2f(U.uC, cx * sc, (H - cy) * sc);
    gl.uniform1f(U.uR, R * sc);
    gl.uniform1f(U.uT, uT);
    gl.uniform1f(U.uInc, 0.17 + ty * 0.2 + dI);
    gl.uniform1f(U.uYaw, tx * 0.18 + dY);
    gl.uniform1f(U.uDist, (14 - p * 3.5) * (1 - 0.45 * warp));
    gl.uniform1f(U.uWarp, warp);
    gl.uniform1f(U.uFlare, flare);
    gl.uniform1f(
      U.uExp,
      (1.1 - Math.min(0.5, (scrollY / H) * 0.35)) * (W < 700 ? 0.7 : 1) * (1 + warp * 0.3),
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame() {
    var p = scrollY / Math.max(1, document.body.scrollHeight - H);
    sv += (scrollY - lastY - sv) * 0.1;
    lastY = scrollY;
    warp += ((warpOn ? 1 : 0) - warp) * 0.06;
    if (!drag) {
      dY *= 0.993;
      dI *= 0.993;
    }
    var tcx = W * (W < 700 ? 0.5 : 0.7) + tx * -40,
      tcy = H * 0.5 + ty * -30;
    cx += (tcx - cx) * 0.08;
    cy += (tcy - cy) * 0.08;
    var R = Math.min(W, H) * 0.1,
      tilt = 0.28 + ty * 0.25 + Math.abs(sv) * 0.004;
    x.clearRect(0, 0, W, H);
    // free stars: gravity toward cursor and the black hole
    x.globalCompositeOperation = "lighter";
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var dx = mx - s.x,
        dy = my - s.y,
        d = Math.hypot(dx, dy) + 1;
      if (d < 220) {
        var f = ((220 - d) / 220) * 0.35;
        s.vx += (dx / d) * f;
        s.vy += (dy / d) * f;
      }
      var bx = cx - s.x,
        by = cy - s.y,
        bd = Math.hypot(bx, by) + 1;
      var gk = 4 / bd - warp * (0.35 + bd * 0.0009);
      s.vx += (bx / bd) * gk;
      s.vy += (by / bd) * gk;
      for (var k = 0; k < shock.length; k++) {
        var sh = shock[k],
          ex = s.x - sh.x,
          ey = s.y - sh.y,
          ed = Math.hypot(ex, ey) + 1,
          w = Math.abs(ed - sh.t * 9);
        if (w < 40) {
          s.vx += (ex / ed) * 1.2;
          s.vy += (ey / ed) * 1.2;
        }
      }
      s.vx += (s.ox - s.x) * 0.0008 * (1 - warp);
      s.vy += (s.oy - s.y) * 0.0008 * (1 - warp);
      s.vx *= 0.95;
      s.vy *= 0.95;
      s.x += s.vx;
      s.y += s.vy - sv * 0.05 * s.z;
      if (
        bd < R * 1.4 ||
        (warp > 0.05 && (s.x < -20 || s.x > W + 20 || s.y < -20 || s.y > H + 20))
      ) {
        if (warp > 0.05) {
          var ra = Math.random() * 6.283,
            rr = R * 2 + Math.random() * R * 3;
          s.x = cx + Math.cos(ra) * rr;
          s.y = cy + Math.sin(ra) * rr;
        } else {
          s.x = Math.random() * W;
          s.y = Math.random() * H;
        }
        s.ox = s.x;
        s.oy = s.y;
        s.vx = s.vy = 0;
      }
      var len = Math.min(70, Math.hypot(s.vx, s.vy) * 2 + warp * 70 * s.z);
      var a = Math.atan2(s.vy, s.vx);
      x.strokeStyle = "rgba(220,225,255," + (0.35 + s.z * 0.25) + ")";
      x.lineWidth = s.z * 0.8;
      x.beginPath();
      x.moveTo(s.x, s.y);
      x.lineTo(s.x - Math.cos(a) * len, s.y - Math.sin(a) * len - 0.01);
      x.stroke();
    }
    for (var k = shock.length - 1; k >= 0; k--) {
      var sh = shock[k];
      sh.t++;
      x.strokeStyle = "rgba(255,180,110," + (1 - sh.t / 50) + ")";
      x.lineWidth = 2;
      x.beginPath();
      x.arc(sh.x, sh.y, sh.t * 9, 0, 6.283);
      x.stroke();
      if (sh.t > 50) shock.splice(k, 1);
    }
    for (var k = fall.length - 1; k >= 0; k--) {
      var f = fall[k],
        dx = cx - f.x,
        dy = cy - f.y,
        d = Math.hypot(dx, dy) + 1,
        ac = 220 / d;
      f.vx = (f.vx + (dx / d) * ac) * 0.985;
      f.vy = (f.vy + (dy / d) * ac) * 0.985;
      f.x += f.vx;
      f.y += f.vy;
      var sp = Math.hypot(f.vx, f.vy),
        ln = Math.min(170, sp * 5 * (1 + (R * 3) / d));
      x.strokeStyle = "rgba(255," + (170 + Math.min(80, sp * 4)) + ",120,.9)";
      x.lineWidth = Math.max(0.8, Math.min(4, d / 90));
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(f.x, f.y);
      x.lineTo(f.x - (f.vx / (sp + 0.01)) * ln, f.y - (f.vy / (sp + 0.01)) * ln);
      x.stroke();
      if (d < R * 1.4) {
        flare = Math.min(2, flare + 0.9);
        fall.splice(k, 1);
        shock.push({ x: cx, y: cy, t: 0 });
      }
    }
    flare *= 0.95;
    x.globalCompositeOperation = "source-over";
    ps += (p - ps) * 0.06;
    render(cx, cy, R, ps);
    requestAnimationFrame(frame);
  }
  frame();
  // scroll depth meter + spaghettification of headings
  var bar = document.querySelector("#depth i"),
    lab = document.querySelector("#depth b"),
    hs = document.querySelectorAll("h2");
  var names = ["Outer space", "Accretion disk", "Photon sphere", "Event horizon", "Singularity"];
  function onscroll() {
    var p = scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
    bar.style.height = p * 100 + "%";
    lab.style.top = p * 100 + "%";
    lab.textContent = names[Math.min(4, Math.floor(p * 4.99))];
    var v = Math.min(1.6, Math.abs(sv) / 22);
    hs.forEach(function (h) {
      h.style.transform = reduce
        ? ""
        : "scaleY(" +
          (1 + v * 0.35) +
          ") scaleX(" +
          (1 - v * 0.12) +
          ") skewX(" +
          -sv * 0.12 +
          "deg)";
    });
  }
  addEventListener("scroll", onscroll, { passive: true });
  setInterval(onscroll, 60);
  onscroll();
  // name decode effect
  var nm = document.getElementById("name"),
    final = ["Muhammad", "Tauha"],
    ch = "01#*+=<>/\\";
  function startDecode() {
    if (reduce) return;
    var f = 0;
    var iv = setInterval(function () {
      f++;
      nm.innerHTML = final
        .map(function (w) {
          return w
            .split("")
            .map(function (c, i) {
              return f / 2 > i + 2 ? c : ch[(Math.random() * ch.length) | 0];
            })
            .join("");
        })
        .join("<br>");
      if (f > 18) {
        clearInterval(iv);
        nm.innerHTML = "Muhammad<br>Tauha";
      }
    }, 55);
  }
  if (document.getElementById("loader")) document.addEventListener("portfolio:ready", startDecode);
  else startDecode();
  // card tilt and light
  document.querySelectorAll(".card").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = el.getBoundingClientRect(),
        px = (e.clientX - r.left) / r.width,
        py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", px * 100 + "%");
      el.style.setProperty("--my", py * 100 + "%");
      el.style.transform =
        "rotateY(" + (px - 0.5) * 14 + "deg) rotateX(" + (0.5 - py) * 14 + "deg) translateZ(10px)";
    });
    el.addEventListener("pointerleave", function () {
      el.style.transform = "";
    });
  });
  // buttons pull toward the cursor
  document.querySelectorAll(".btn").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = b.getBoundingClientRect();
      b.style.transform =
        "translate(" +
        (e.clientX - r.left - r.width / 2) * 0.25 +
        "px," +
        (e.clientY - r.top - r.height / 2) * 0.4 +
        "px)";
    });
    b.addEventListener("pointerleave", function () {
      b.style.transform = "";
    });
  });
  // skill orbits
  var rings = [
      { n: "Web", c: "#ff8a3d", r: 0.2, t: 22, l: ["HTML", "CSS", "JavaScript"] },
      { n: "Languages", c: "#9b82ff", r: 0.335, t: 36, l: ["Java", "Python", "Kotlin", "C++", "C#"] },
      { n: "Frameworks", c: "#ffd9a8", r: 0.47, t: 54, l: ["React", "Node.js", "Flutter", "Drupal"] },
      { n: "Tools", c: "#82ff9b", r: 0.6, t: 72, l: ["IntelliJ IDEA", "Android Studio", "VS Code", "Visual Studio", "Git", "GitHub"] }
    ],
    o = document.getElementById("orbit");
  rings.forEach(function (g, idx) {
    var d = document.createElement("div");
    d.className = "ring";
    d.style.cssText =
      "--t:" +
      g.t +
      "s;--c:" +
      g.c +
      ";left:" +
      (50 - g.r * 100) +
      "%;top:" +
      (50 - g.r * 100) +
      "%;width:" +
      g.r * 200 +
      "%;height:" +
      g.r * 200 +
      "%";
    g.l.forEach(function (n, i) {
      var sp = document.createElement("span");
      sp.innerHTML = "<em><i></i><b>" + n + "</b></em>";
      sp.style.cssText = "--a:" + (360 / g.l.length) * i + "deg";
      sp.dataset.k = g.r;
      d.appendChild(sp);
    });
    o.appendChild(d);
  });
  rings.forEach(function (g, idx) {
    var d = document.createElement("div");
    d.className = "ring tr";
    d.style.cssText =
      "--t:" +
      g.t +
      "s;--c:" +
      g.c +
      ";left:" +
      (50 - g.r * 100) +
      "%;top:" +
      (50 - g.r * 100) +
      "%;width:" +
      g.r * 200 +
      "%;height:" +
      g.r * 200 +
      "%";
    var nn = g.l.length,
      ff = [0, nn % 2 ? 2 : nn / 2].map(function (k) {
        return ((((360 / nn) * (k + 0.5) - 270 + 360) % 360) / 360) * 100;
      });
    var sv = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    sv.setAttribute("class", "rt");
    sv.innerHTML =
      '<defs><path id="rp' +
      idx +
      '"/></defs><text text-anchor="middle"><textPath href="#rp' +
      idx +
      '" startOffset="' +
      ff[0] +
      '%">' +
      g.n +
      '</textPath></text><text text-anchor="middle"><textPath href="#rp' +
      idx +
      '" startOffset="' +
      ff[1] +
      '%">' +
      g.n +
      "</textPath></text>";
    d.appendChild(sv);
    o.appendChild(d);
  });
  function fit() {
    var w = o.clientWidth;
    o.querySelectorAll(".ring span").forEach(function (sp) {
      sp.style.setProperty("--r", sp.dataset.k * w + "px");
    });
    o.querySelectorAll(".ring.tr").forEach(function (d) {
      var S = d.clientWidth,
        q = S / 2 - 4,
        sv = d.firstChild;
      sv.setAttribute("viewBox", "0 0 " + S + " " + S);
      sv.querySelector("path").setAttribute(
        "d",
        "M" +
          S / 2 +
          " " +
          (S / 2 - q) +
          "a" +
          q +
          " " +
          q +
          " 0 1 1 0 " +
          2 * q +
          "a" +
          q +
          " " +
          q +
          " 0 1 1 0 " +
          -2 * q,
      );
    });
  }
  fit();
  addEventListener("resize", fit);
  // counters
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var n = e.target,
        t = +n.dataset.n,
        i = 0;
      io.unobserve(n);
      var iv = setInterval(function () {
        i++;
        n.textContent = Math.round((t * i) / 30);
        if (i >= 30) clearInterval(iv);
      }, 30);
    });
  });
  document.querySelectorAll("[data-n]").forEach(function (n) {
    io.observe(n);
  });
  // mobile menu
  var mb = document.getElementById("menu"),
    nv = document.getElementById("nav");
  mb.addEventListener("click", function () {
    var o = nv.classList.toggle("open");
    mb.setAttribute("aria-expanded", o);
  });
  nv.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nv.classList.remove("open");
      mb.setAttribute("aria-expanded", "false");
    }
  });
})();

// loading screen
(function () {
  var L = document.getElementById("loader");
  if (!L) return;
  var cv = L.querySelector("canvas"),
    x = cv.getContext("2d"),
    nm = L.querySelector(".lo-name"),
    pct = L.querySelector(".lo-pct"),
    de = document.documentElement,
    reduce = matchMedia("(prefers-reduced-motion:reduce)").matches,
    MIN = reduce ? 400 : 3400,
    MAX = 7000,
    dpr = Math.min(devicePixelRatio || 1, 2),
    t0 = performance.now(),
    fl = !(document.fonts && document.fonts.ready),
    wl = document.readyState === "complete",
    p = 0,
    w = 0,
    fin = false,
    fs = 0,
    last = t0,
    lastTxt = 0,
    W,
    H,
    parts = [],
    stars = [],
    bits = [],
    word = "Muhammad Tauha",
    glyphs = "01#*+=<>/\\";
  if (!fl)
    document.fonts.ready.then(function () {
      fl = true;
    });
  if (!wl)
    addEventListener("load", function () {
      wl = true;
    });
  function size() {
    W = innerWidth;
    H = innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  addEventListener("resize", size);
  function rp(init) {
    var m = Math.min(W, H) * 0.45;
    return {
      a: Math.random() * 6.283,
      r: init ? 50 + Math.random() * m : m + Math.random() * 60,
      s: 0.6 + Math.random() * 0.8,
      z: Math.random() * 1.4 + 0.5,
      h: Math.random(),
    };
  }
  var i,
    N = innerWidth < 700 ? 260 : 520;
  for (i = 0; i < N; i++) parts.push(rp(true));
  for (i = 0; i < 150; i++)
    stars.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 1.5 + 0.3 });
  for (i = 0; i < 3; i++) bits.push({ a: i * 2.1, k: 1.15 + i * 0.25, s: 1.1 - i * 0.22, t: [] });
  function label(v) {
    return v < 40
      ? "Approaching the horizon"
      : v < 80
        ? "Crossing the event horizon"
        : "Falling in";
  }
  function startFinish(now) {
    fin = true;
    fs = now;
    L.classList.add("go");
    de.classList.remove("loading");
    de.classList.add("ready");
    nm.textContent = word;
    pct.innerHTML = '<span class="lo-n">100</span><span class="lo-m">Welcome</span>';
    document.dispatchEvent(new Event("portfolio:ready"));
  }
  function draw(now, dt) {
    var cx = W / 2,
      cy = H * 0.44,
      m = Math.min(W, H),
      pe = p * p * (3 - 2 * p),
      R = m * 0.09 * (0.3 + 0.7 * pe),
      rr = m * 0.2,
      tilt = 0.32,
      j,
      q;
    x.globalCompositeOperation = "source-over";
    x.fillStyle = "#000";
    x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = "lighter";
    for (j = 0; j < stars.length; j++) {
      q = stars[j];
      var dx = q.x - cx,
        dy = q.y - cy,
        d = Math.hypot(dx, dy) + 1,
        v = (0.12 + w * 60 + p * 0.4) * q.z;
      q.x += (dx / d) * v * dt;
      q.y += (dy / d) * v * dt;
      if (q.x < -30 || q.x > W + 30 || q.y < -30 || q.y > H + 30 || d < 30) {
        var ang = Math.random() * 6.283,
          rad = 40 + Math.random() * m * 0.5;
        q.x = cx + Math.cos(ang) * rad;
        q.y = cy + Math.sin(ang) * rad;
      }
      var ln = Math.min(160, v * 2.5 + 1);
      x.strokeStyle = "rgba(220,225,255," + (0.25 + q.z * 0.3) + ")";
      x.lineWidth = q.z * 0.8;
      x.beginPath();
      x.moveTo(q.x, q.y);
      x.lineTo(q.x - (dx / d) * ln, q.y - (dy / d) * ln);
      x.stroke();
    }
    function disk(front) {
      for (var k = 0; k < parts.length; k++) {
        var o = parts[k];
        o.a += ((o.s * 2.2) / Math.sqrt(o.r)) * 0.55 * dt * (1 + w * 2);
        o.r += (-(0.12 + p * 0.3) * o.s + w * o.r * 0.05) * dt;
        if (o.r < R * 1.1) {
          parts[k] = o = rp(false);
        }
        var sn = Math.sin(o.a);
        if (sn > 0 !== front) continue;
        var px = cx + Math.cos(o.a) * o.r,
          py = cy + sn * o.r * tilt,
          heat = Math.max(0, 1 - (o.r - R) / (m * 0.4));
        if (!front) py -= Math.max(0, 1 - o.r / (R * 4)) * R * 0.9 * Math.abs(sn);
        x.fillStyle =
          "hsla(" +
          (18 + heat * 32 + o.h * 8) +
          ",100%," +
          (48 + heat * 38) +
          "%," +
          Math.min(1, (0.2 + heat * 0.7) * (0.35 + 0.65 * p) * (front ? 1.2 : 0.7)) +
          ")";
        x.fillRect(px, py, o.z * 1.4, o.z * 1.4);
      }
    }
    disk(false);
    x.globalCompositeOperation = "source-over";
    var g = x.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 2.8);
    g.addColorStop(0, "rgba(255,150,60," + 0.55 * (0.3 + 0.7 * pe) + ")");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.beginPath();
    x.arc(cx, cy, R * 2.8, 0, 6.283);
    x.fill();
    x.fillStyle = "#000";
    x.beginPath();
    x.arc(cx, cy, R, 0, 6.283);
    x.fill();
    x.strokeStyle = "rgba(255,214,160," + (0.3 + 0.7 * pe) + ")";
    x.lineWidth = 2;
    x.shadowColor = "#ff8a3d";
    x.shadowBlur = 22;
    x.beginPath();
    x.arc(cx, cy, R * 1.03, 0, 6.283);
    x.stroke();
    x.globalCompositeOperation = "lighter";
    disk(true);
    // comets with trails
    for (j = 0; j < bits.length; j++) {
      var b = bits[j];
      b.a += 0.025 * b.s * dt * (1 + w * 3);
      var bx = cx + Math.cos(b.a) * rr * b.k * 1.1,
        by = cy + Math.sin(b.a) * rr * b.k * 0.5;
      b.t.push([bx, by]);
      if (b.t.length > 26) b.t.shift();
      for (var t = 1; t < b.t.length; t++) {
        x.strokeStyle = "rgba(255," + (170 + t * 3) + ",110," + (t / b.t.length) * 0.8 + ")";
        x.lineWidth = (t / b.t.length) * 3;
        x.beginPath();
        x.moveTo(b.t[t - 1][0], b.t[t - 1][1]);
        x.lineTo(b.t[t][0], b.t[t][1]);
        x.stroke();
      }
      x.fillStyle = "#fff";
      x.shadowBlur = 16;
      x.beginPath();
      x.arc(bx, by, 2.4, 0, 6.283);
      x.fill();
    }
    // progress ring
    x.shadowBlur = 0;
    x.strokeStyle = "rgba(255,255,255,0.1)";
    x.lineWidth = 1;
    x.beginPath();
    x.arc(cx, cy, rr, 0, 6.283);
    x.stroke();
    x.strokeStyle = "#ffb26b";
    x.lineWidth = 3;
    x.lineCap = "round";
    x.shadowColor = "#ff8a3d";
    x.shadowBlur = 16;
    x.beginPath();
    x.arc(cx, cy, rr, -1.5708, -1.5708 + 6.283 * p);
    x.stroke();
    x.shadowBlur = 0;
    // flash on dive
    if (w > 0) {
      var f = x.createRadialGradient(cx, cy, 0, cx, cy, R * 7);
      f.addColorStop(0, "rgba(255,225,180," + Math.sin(Math.min(1, w * 1.4) * 3.1416) * 0.5 + ")");
      f.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = f;
      x.fillRect(0, 0, W, H);
    }
  }
  function frame(now) {
    var dt = Math.min(2.5, (now - last) / 16.7);
    last = now;
    if (!fin) {
      var el = now - t0,
        tgt = Math.min(el / MIN, 1);
      if (!(fl && wl) && el < MAX) tgt = Math.min(tgt, 0.92);
      p += (tgt - p) * 0.1 * dt;
      var v = Math.round(p * 100);
      if (now - lastTxt > 60) {
        lastTxt = now;
        var k = Math.floor(p * word.length * 1.15),
          s = "";
        for (var c = 0; c < word.length; c++)
          s += c < k || word[c] === " " ? word[c] : glyphs[(Math.random() * glyphs.length) | 0];
        nm.textContent = s;
      }
      pct.innerHTML =
        '<span class="lo-n">' + v + '</span><span class="lo-m">' + label(v) + "</span>";
      if (p > 0.995 && tgt >= 1) startFinish(now);
    } else {
      var kk = Math.min(1, (now - fs) / (reduce ? 1 : 1400));
      w = kk * kk;
      var r = kk * kk * kk * (Math.hypot(W, H) / 2 + 20),
        mk = "radial-gradient(circle at 50% 44%, transparent " + r + "px, #000 " + (r + 2) + "px)";
      L.style.webkitMaskImage = mk;
      L.style.maskImage = mk;
      if (kk >= 1) return L.remove();
    }
    draw(now, dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setTimeout(function () {
    if (!fin) startFinish(performance.now());
  }, MAX + 1500);
})();