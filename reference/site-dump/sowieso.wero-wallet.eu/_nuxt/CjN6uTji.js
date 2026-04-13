import {
  _ as He,
  a as Ne,
  b as Re,
  c as qe,
  d as We,
  e as je,
  f as Xe,
  g as Ye,
} from "./Cd_iCvQE.js";
import {
  N as Ue,
  d as _e,
  O as Ke,
  H as Pe,
  G as Qe,
  o as Le,
  z as K,
  A as Q,
  B as A,
  P as ve,
  Q as Se,
  I as N,
  D,
  R as Je,
  C as ee,
  l as ae,
  i as B,
  S as Ze,
  J as et,
  _ as Ie,
  y as tt,
  L as st,
  a as it,
  M as nt,
} from "./De_CX4X5.js";
import { u as rt } from "./g2wV7CKQ.js";
const be = Ue("/media/images/play-btn.png");
function ye(e) {
  return (
    e !== null &&
    typeof e == "object" &&
    "constructor" in e &&
    e.constructor === Object
  );
}
function ge(e = {}, s = {}) {
  const t = ["__proto__", "constructor", "prototype"];
  Object.keys(s)
    .filter((i) => t.indexOf(i) < 0)
    .forEach((i) => {
      typeof e[i] > "u"
        ? (e[i] = s[i])
        : ye(s[i]) &&
          ye(e[i]) &&
          Object.keys(s[i]).length > 0 &&
          ge(e[i], s[i]);
    });
}
const ke = {
  body: {},
  addEventListener() {},
  removeEventListener() {},
  activeElement: { blur() {}, nodeName: "" },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  getElementById() {
    return null;
  },
  createEvent() {
    return { initEvent() {} };
  },
  createElement() {
    return {
      children: [],
      childNodes: [],
      style: {},
      setAttribute() {},
      getElementsByTagName() {
        return [];
      },
    };
  },
  createElementNS() {
    return {};
  },
  importNode() {
    return null;
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: "",
  },
};
function Y() {
  const e = typeof document < "u" ? document : {};
  return ge(e, ke), e;
}
const at = {
  document: ke,
  navigator: { userAgent: "" },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: "",
  },
  history: { replaceState() {}, pushState() {}, go() {}, back() {} },
  CustomEvent: function () {
    return this;
  },
  addEventListener() {},
  removeEventListener() {},
  getComputedStyle() {
    return {
      getPropertyValue() {
        return "";
      },
    };
  },
  Image() {},
  Date() {},
  screen: {},
  setTimeout() {},
  clearTimeout() {},
  matchMedia() {
    return {};
  },
  requestAnimationFrame(e) {
    return typeof setTimeout > "u" ? (e(), null) : setTimeout(e, 0);
  },
  cancelAnimationFrame(e) {
    typeof setTimeout > "u" || clearTimeout(e);
  },
};
function G() {
  const e = typeof window < "u" ? window : {};
  return ge(e, at), e;
}
function lt(e = "") {
  return e
    .trim()
    .split(" ")
    .filter((s) => !!s.trim());
}
function ot(e) {
  const s = e;
  Object.keys(s).forEach((t) => {
    try {
      s[t] = null;
    } catch {}
    try {
      delete s[t];
    } catch {}
  });
}
function Ae(e, s = 0) {
  return setTimeout(e, s);
}
function se() {
  return Date.now();
}
function dt(e) {
  const s = G();
  let t;
  return (
    s.getComputedStyle && (t = s.getComputedStyle(e, null)),
    !t && e.currentStyle && (t = e.currentStyle),
    t || (t = e.style),
    t
  );
}
function ct(e, s = "x") {
  const t = G();
  let i, n, r;
  const l = dt(e);
  return (
    t.WebKitCSSMatrix
      ? ((n = l.transform || l.webkitTransform),
        n.split(",").length > 6 &&
          (n = n
            .split(", ")
            .map((o) => o.replace(",", "."))
            .join(", ")),
        (r = new t.WebKitCSSMatrix(n === "none" ? "" : n)))
      : ((r =
          l.MozTransform ||
          l.OTransform ||
          l.MsTransform ||
          l.msTransform ||
          l.transform ||
          l
            .getPropertyValue("transform")
            .replace("translate(", "matrix(1, 0, 0, 1,")),
        (i = r.toString().split(","))),
    s === "x" &&
      (t.WebKitCSSMatrix
        ? (n = r.m41)
        : i.length === 16
        ? (n = parseFloat(i[12]))
        : (n = parseFloat(i[4]))),
    s === "y" &&
      (t.WebKitCSSMatrix
        ? (n = r.m42)
        : i.length === 16
        ? (n = parseFloat(i[13]))
        : (n = parseFloat(i[5]))),
    n || 0
  );
}
function Z(e) {
  return (
    typeof e == "object" &&
    e !== null &&
    e.constructor &&
    Object.prototype.toString.call(e).slice(8, -1) === "Object"
  );
}
function ut(e) {
  return typeof window < "u" && typeof window.HTMLElement < "u"
    ? e instanceof HTMLElement
    : e && (e.nodeType === 1 || e.nodeType === 11);
}
function V(...e) {
  const s = Object(e[0]);
  for (let t = 1; t < e.length; t += 1) {
    const i = e[t];
    if (i != null && !ut(i)) {
      const n = Object.keys(Object(i)).filter(
        (r) => r !== "__proto__" && r !== "constructor" && r !== "prototype"
      );
      for (let r = 0, l = n.length; r < l; r += 1) {
        const o = n[r],
          a = Object.getOwnPropertyDescriptor(i, o);
        a !== void 0 &&
          a.enumerable &&
          (Z(s[o]) && Z(i[o])
            ? i[o].__swiper__
              ? (s[o] = i[o])
              : V(s[o], i[o])
            : !Z(s[o]) && Z(i[o])
            ? ((s[o] = {}), i[o].__swiper__ ? (s[o] = i[o]) : V(s[o], i[o]))
            : (s[o] = i[o]));
      }
    }
  }
  return s;
}
function U(e, s, t) {
  e.style.setProperty(s, t);
}
function Oe({ swiper: e, targetPosition: s, side: t }) {
  const i = G(),
    n = -e.translate;
  let r = null,
    l;
  const o = e.params.speed;
  (e.wrapperEl.style.scrollSnapType = "none"),
    i.cancelAnimationFrame(e.cssModeFrameID);
  const a = s > n ? "next" : "prev",
    d = (c, v) => (a === "next" && c >= v) || (a === "prev" && c <= v),
    m = () => {
      (l = new Date().getTime()), r === null && (r = l);
      const c = Math.max(Math.min((l - r) / o, 1), 0),
        v = 0.5 - Math.cos(c * Math.PI) / 2;
      let p = n + v * (s - n);
      if ((d(p, s) && (p = s), e.wrapperEl.scrollTo({ [t]: p }), d(p, s))) {
        (e.wrapperEl.style.overflow = "hidden"),
          (e.wrapperEl.style.scrollSnapType = ""),
          setTimeout(() => {
            (e.wrapperEl.style.overflow = ""), e.wrapperEl.scrollTo({ [t]: p });
          }),
          i.cancelAnimationFrame(e.cssModeFrameID);
        return;
      }
      e.cssModeFrameID = i.requestAnimationFrame(m);
    };
  m();
}
function H(e, s = "") {
  const t = G(),
    i = [...e.children];
  return (
    t.HTMLSlotElement &&
      e instanceof HTMLSlotElement &&
      i.push(...e.assignedElements()),
    s ? i.filter((n) => n.matches(s)) : i
  );
}
function ft(e, s) {
  const t = [s];
  for (; t.length > 0; ) {
    const i = t.shift();
    if (e === i) return !0;
    t.push(
      ...i.children,
      ...(i.shadowRoot ? i.shadowRoot.children : []),
      ...(i.assignedElements ? i.assignedElements() : [])
    );
  }
}
function pt(e, s) {
  const t = G();
  let i = s.contains(e);
  return (
    !i &&
      t.HTMLSlotElement &&
      s instanceof HTMLSlotElement &&
      ((i = [...s.assignedElements()].includes(e)), i || (i = ft(e, s))),
    i
  );
}
function ie(e) {
  try {
    console.warn(e);
    return;
  } catch {}
}
function ne(e, s = []) {
  const t = document.createElement(e);
  return t.classList.add(...(Array.isArray(s) ? s : lt(s))), t;
}
function mt(e, s) {
  const t = [];
  for (; e.previousElementSibling; ) {
    const i = e.previousElementSibling;
    s ? i.matches(s) && t.push(i) : t.push(i), (e = i);
  }
  return t;
}
function ht(e, s) {
  const t = [];
  for (; e.nextElementSibling; ) {
    const i = e.nextElementSibling;
    s ? i.matches(s) && t.push(i) : t.push(i), (e = i);
  }
  return t;
}
function j(e, s) {
  return G().getComputedStyle(e, null).getPropertyValue(s);
}
function re(e) {
  let s = e,
    t;
  if (s) {
    for (t = 0; (s = s.previousSibling) !== null; )
      s.nodeType === 1 && (t += 1);
    return t;
  }
}
function ze(e, s) {
  const t = [];
  let i = e.parentElement;
  for (; i; ) s ? i.matches(s) && t.push(i) : t.push(i), (i = i.parentElement);
  return t;
}
function me(e, s, t) {
  const i = G();
  return (
    e[s === "width" ? "offsetWidth" : "offsetHeight"] +
    parseFloat(
      i
        .getComputedStyle(e, null)
        .getPropertyValue(s === "width" ? "margin-right" : "margin-top")
    ) +
    parseFloat(
      i
        .getComputedStyle(e, null)
        .getPropertyValue(s === "width" ? "margin-left" : "margin-bottom")
    )
  );
}
function R(e) {
  return (Array.isArray(e) ? e : [e]).filter((s) => !!s);
}
function we(e, s = "") {
  typeof trustedTypes < "u"
    ? (e.innerHTML = trustedTypes
        .createPolicy("html", { createHTML: (t) => t })
        .createHTML(s))
    : (e.innerHTML = s);
}
let le;
function gt() {
  const e = G(),
    s = Y();
  return {
    smoothScroll:
      s.documentElement &&
      s.documentElement.style &&
      "scrollBehavior" in s.documentElement.style,
    touch: !!(
      "ontouchstart" in e ||
      (e.DocumentTouch && s instanceof e.DocumentTouch)
    ),
  };
}
function Ge() {
  return le || (le = gt()), le;
}
let oe;
function vt({ userAgent: e } = {}) {
  const s = Ge(),
    t = G(),
    i = t.navigator.platform,
    n = e || t.navigator.userAgent,
    r = { ios: !1, android: !1 },
    l = t.screen.width,
    o = t.screen.height,
    a = n.match(/(Android);?[\s\/]+([\d.]+)?/);
  let d = n.match(/(iPad)(?!\1).*OS\s([\d_]+)/);
  const m = n.match(/(iPod)(.*OS\s([\d_]+))?/),
    c = !d && n.match(/(iPhone\sOS|iOS)\s([\d_]+)/),
    v = i === "Win32";
  let p = i === "MacIntel";
  const b = [
    "1024x1366",
    "1366x1024",
    "834x1194",
    "1194x834",
    "834x1112",
    "1112x834",
    "768x1024",
    "1024x768",
    "820x1180",
    "1180x820",
    "810x1080",
    "1080x810",
  ];
  return (
    !d &&
      p &&
      s.touch &&
      b.indexOf(`${l}x${o}`) >= 0 &&
      ((d = n.match(/(Version)\/([\d.]+)/)),
      d || (d = [0, 1, "13_0_0"]),
      (p = !1)),
    a && !v && ((r.os = "android"), (r.android = !0)),
    (d || c || m) && ((r.os = "ios"), (r.ios = !0)),
    r
  );
}
function $e(e = {}) {
  return oe || (oe = vt(e)), oe;
}
let de;
function St() {
  const e = G(),
    s = $e();
  let t = !1;
  function i() {
    const o = e.navigator.userAgent.toLowerCase();
    return (
      o.indexOf("safari") >= 0 &&
      o.indexOf("chrome") < 0 &&
      o.indexOf("android") < 0
    );
  }
  if (i()) {
    const o = String(e.navigator.userAgent);
    if (o.includes("Version/")) {
      const [a, d] = o
        .split("Version/")[1]
        .split(" ")[0]
        .split(".")
        .map((m) => Number(m));
      t = a < 16 || (a === 16 && d < 2);
    }
  }
  const n = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
      e.navigator.userAgent
    ),
    r = i(),
    l = r || (n && s.ios);
  return {
    isSafari: t || r,
    needPerspectiveFix: t,
    need3dFix: l,
    isWebView: n,
  };
}
function Be() {
  return de || (de = St()), de;
}
function bt({ swiper: e, on: s, emit: t }) {
  const i = G();
  let n = null,
    r = null;
  const l = () => {
      !e || e.destroyed || !e.initialized || (t("beforeResize"), t("resize"));
    },
    o = () => {
      !e ||
        e.destroyed ||
        !e.initialized ||
        ((n = new ResizeObserver((m) => {
          r = i.requestAnimationFrame(() => {
            const { width: c, height: v } = e;
            let p = c,
              b = v;
            m.forEach(({ contentBoxSize: y, contentRect: P, target: u }) => {
              (u && u !== e.el) ||
                ((p = P ? P.width : (y[0] || y).inlineSize),
                (b = P ? P.height : (y[0] || y).blockSize));
            }),
              (p !== c || b !== v) && l();
          });
        })),
        n.observe(e.el));
    },
    a = () => {
      r && i.cancelAnimationFrame(r),
        n && n.unobserve && e.el && (n.unobserve(e.el), (n = null));
    },
    d = () => {
      !e || e.destroyed || !e.initialized || t("orientationchange");
    };
  s("init", () => {
    if (e.params.resizeObserver && typeof i.ResizeObserver < "u") {
      o();
      return;
    }
    i.addEventListener("resize", l), i.addEventListener("orientationchange", d);
  }),
    s("destroy", () => {
      a(),
        i.removeEventListener("resize", l),
        i.removeEventListener("orientationchange", d);
    });
}
function yt({ swiper: e, extendParams: s, on: t, emit: i }) {
  const n = [],
    r = G(),
    l = (d, m = {}) => {
      const c = r.MutationObserver || r.WebkitMutationObserver,
        v = new c((p) => {
          if (e.__preventObserver__) return;
          if (p.length === 1) {
            i("observerUpdate", p[0]);
            return;
          }
          const b = function () {
            i("observerUpdate", p[0]);
          };
          r.requestAnimationFrame
            ? r.requestAnimationFrame(b)
            : r.setTimeout(b, 0);
        });
      v.observe(d, {
        attributes: typeof m.attributes > "u" ? !0 : m.attributes,
        childList: e.isElement || (typeof m.childList > "u" ? !0 : m).childList,
        characterData: typeof m.characterData > "u" ? !0 : m.characterData,
      }),
        n.push(v);
    },
    o = () => {
      if (e.params.observer) {
        if (e.params.observeParents) {
          const d = ze(e.hostEl);
          for (let m = 0; m < d.length; m += 1) l(d[m]);
        }
        l(e.hostEl, { childList: e.params.observeSlideChildren }),
          l(e.wrapperEl, { attributes: !1 });
      }
    },
    a = () => {
      n.forEach((d) => {
        d.disconnect();
      }),
        n.splice(0, n.length);
    };
  s({ observer: !1, observeParents: !1, observeSlideChildren: !1 }),
    t("init", o),
    t("destroy", a);
}
var wt = {
  on(e, s, t) {
    const i = this;
    if (!i.eventsListeners || i.destroyed || typeof s != "function") return i;
    const n = t ? "unshift" : "push";
    return (
      e.split(" ").forEach((r) => {
        i.eventsListeners[r] || (i.eventsListeners[r] = []),
          i.eventsListeners[r][n](s);
      }),
      i
    );
  },
  once(e, s, t) {
    const i = this;
    if (!i.eventsListeners || i.destroyed || typeof s != "function") return i;
    function n(...r) {
      i.off(e, n), n.__emitterProxy && delete n.__emitterProxy, s.apply(i, r);
    }
    return (n.__emitterProxy = s), i.on(e, n, t);
  },
  onAny(e, s) {
    const t = this;
    if (!t.eventsListeners || t.destroyed || typeof e != "function") return t;
    const i = s ? "unshift" : "push";
    return t.eventsAnyListeners.indexOf(e) < 0 && t.eventsAnyListeners[i](e), t;
  },
  offAny(e) {
    const s = this;
    if (!s.eventsListeners || s.destroyed || !s.eventsAnyListeners) return s;
    const t = s.eventsAnyListeners.indexOf(e);
    return t >= 0 && s.eventsAnyListeners.splice(t, 1), s;
  },
  off(e, s) {
    const t = this;
    return (
      !t.eventsListeners ||
        t.destroyed ||
        !t.eventsListeners ||
        e.split(" ").forEach((i) => {
          typeof s > "u"
            ? (t.eventsListeners[i] = [])
            : t.eventsListeners[i] &&
              t.eventsListeners[i].forEach((n, r) => {
                (n === s || (n.__emitterProxy && n.__emitterProxy === s)) &&
                  t.eventsListeners[i].splice(r, 1);
              });
        }),
      t
    );
  },
  emit(...e) {
    const s = this;
    if (!s.eventsListeners || s.destroyed || !s.eventsListeners) return s;
    let t, i, n;
    return (
      typeof e[0] == "string" || Array.isArray(e[0])
        ? ((t = e[0]), (i = e.slice(1, e.length)), (n = s))
        : ((t = e[0].events), (i = e[0].data), (n = e[0].context || s)),
      i.unshift(n),
      (Array.isArray(t) ? t : t.split(" ")).forEach((l) => {
        s.eventsAnyListeners &&
          s.eventsAnyListeners.length &&
          s.eventsAnyListeners.forEach((o) => {
            o.apply(n, [l, ...i]);
          }),
          s.eventsListeners &&
            s.eventsListeners[l] &&
            s.eventsListeners[l].forEach((o) => {
              o.apply(n, i);
            });
      }),
      s
    );
  },
};
function Tt() {
  const e = this;
  let s, t;
  const i = e.el;
  typeof e.params.width < "u" && e.params.width !== null
    ? (s = e.params.width)
    : (s = i.clientWidth),
    typeof e.params.height < "u" && e.params.height !== null
      ? (t = e.params.height)
      : (t = i.clientHeight),
    !((s === 0 && e.isHorizontal()) || (t === 0 && e.isVertical())) &&
      ((s =
        s -
        parseInt(j(i, "padding-left") || 0, 10) -
        parseInt(j(i, "padding-right") || 0, 10)),
      (t =
        t -
        parseInt(j(i, "padding-top") || 0, 10) -
        parseInt(j(i, "padding-bottom") || 0, 10)),
      Number.isNaN(s) && (s = 0),
      Number.isNaN(t) && (t = 0),
      Object.assign(e, {
        width: s,
        height: t,
        size: e.isHorizontal() ? s : t,
      }));
}
function xt() {
  const e = this;
  function s(T, x) {
    return parseFloat(T.getPropertyValue(e.getDirectionLabel(x)) || 0);
  }
  const t = e.params,
    { wrapperEl: i, slidesEl: n, rtlTranslate: r, wrongRTL: l } = e,
    o = e.virtual && t.virtual.enabled,
    a = o ? e.virtual.slides.length : e.slides.length,
    d = H(n, `.${e.params.slideClass}, swiper-slide`),
    m = o ? e.virtual.slides.length : d.length;
  let c = [];
  const v = [],
    p = [];
  let b = t.slidesOffsetBefore;
  typeof b == "function" && (b = t.slidesOffsetBefore.call(e));
  let y = t.slidesOffsetAfter;
  typeof y == "function" && (y = t.slidesOffsetAfter.call(e));
  const P = e.snapGrid.length,
    u = e.slidesGrid.length,
    f = e.size - b - y;
  let h = t.spaceBetween,
    w = -b,
    g = 0,
    C = 0;
  if (typeof f > "u") return;
  typeof h == "string" && h.indexOf("%") >= 0
    ? (h = (parseFloat(h.replace("%", "")) / 100) * f)
    : typeof h == "string" && (h = parseFloat(h)),
    (e.virtualSize = -h - b - y),
    d.forEach((T) => {
      r ? (T.style.marginLeft = "") : (T.style.marginRight = ""),
        (T.style.marginBottom = ""),
        (T.style.marginTop = "");
    }),
    t.centeredSlides &&
      t.cssMode &&
      (U(i, "--swiper-centered-offset-before", ""),
      U(i, "--swiper-centered-offset-after", "")),
    t.cssMode &&
      (U(i, "--swiper-slides-offset-before", `${b}px`),
      U(i, "--swiper-slides-offset-after", `${y}px`));
  const M = t.grid && t.grid.rows > 1 && e.grid;
  M ? e.grid.initSlides(d) : e.grid && e.grid.unsetSlides();
  let S;
  const _ =
    t.slidesPerView === "auto" &&
    t.breakpoints &&
    Object.keys(t.breakpoints).filter(
      (T) => typeof t.breakpoints[T].slidesPerView < "u"
    ).length > 0;
  for (let T = 0; T < m; T += 1) {
    S = 0;
    const x = d[T];
    if (
      !(x && (M && e.grid.updateSlide(T, x, d), j(x, "display") === "none"))
    ) {
      if (o && t.slidesPerView === "auto")
        t.virtual.slidesPerViewAutoSlideSize &&
          (S = t.virtual.slidesPerViewAutoSlideSize),
          S &&
            x &&
            (t.roundLengths && (S = Math.floor(S)),
            (x.style[e.getDirectionLabel("width")] = `${S}px`));
      else if (t.slidesPerView === "auto") {
        _ && (x.style[e.getDirectionLabel("width")] = "");
        const E = getComputedStyle(x),
          L = x.style.transform,
          k = x.style.webkitTransform;
        if (
          (L && (x.style.transform = "none"),
          k && (x.style.webkitTransform = "none"),
          t.roundLengths)
        )
          S = e.isHorizontal() ? me(x, "width") : me(x, "height");
        else {
          const O = s(E, "width"),
            q = s(E, "padding-left"),
            X = s(E, "padding-right"),
            I = s(E, "margin-left"),
            z = s(E, "margin-right"),
            $ = E.getPropertyValue("box-sizing");
          if ($ && $ === "border-box") S = O + I + z;
          else {
            const { clientWidth: W, offsetWidth: Fe } = x;
            S = O + q + X + I + z + (Fe - W);
          }
        }
        L && (x.style.transform = L),
          k && (x.style.webkitTransform = k),
          t.roundLengths && (S = Math.floor(S));
      } else
        (S = (f - (t.slidesPerView - 1) * h) / t.slidesPerView),
          t.roundLengths && (S = Math.floor(S)),
          x && (x.style[e.getDirectionLabel("width")] = `${S}px`);
      x && (x.swiperSlideSize = S),
        p.push(S),
        t.centeredSlides
          ? ((w = w + S / 2 + g / 2 + h),
            g === 0 && T !== 0 && (w = w - f / 2 - h),
            T === 0 && (w = w - f / 2 - h),
            Math.abs(w) < 1 / 1e3 && (w = 0),
            t.roundLengths && (w = Math.floor(w)),
            C % t.slidesPerGroup === 0 && c.push(w),
            v.push(w))
          : (t.roundLengths && (w = Math.floor(w)),
            (C - Math.min(e.params.slidesPerGroupSkip, C)) %
              e.params.slidesPerGroup ===
              0 && c.push(w),
            v.push(w),
            (w = w + S + h)),
        (e.virtualSize += S + h),
        (g = S),
        (C += 1);
    }
  }
  if (
    ((e.virtualSize = Math.max(e.virtualSize, f) + y),
    r &&
      l &&
      (t.effect === "slide" || t.effect === "coverflow") &&
      (i.style.width = `${e.virtualSize + h}px`),
    t.setWrapperSize &&
      (i.style[e.getDirectionLabel("width")] = `${e.virtualSize + h}px`),
    M && e.grid.updateWrapperSize(S, c),
    !t.centeredSlides)
  ) {
    const T = t.slidesPerView !== "auto" && t.slidesPerView % 1 !== 0,
      x = t.snapToSlideEdge && !t.loop && (t.slidesPerView === "auto" || T);
    let E = c.length;
    if (x) {
      let k;
      if (t.slidesPerView === "auto") {
        k = 1;
        let O = 0;
        for (
          let q = p.length - 1;
          q >= 0 && ((O += p[q] + (q < p.length - 1 ? h : 0)), O <= f);
          q -= 1
        )
          k = p.length - q;
      } else k = Math.floor(t.slidesPerView);
      E = Math.max(m - k, 0);
    }
    const L = [];
    for (let k = 0; k < c.length; k += 1) {
      let O = c[k];
      t.roundLengths && (O = Math.floor(O)),
        x ? k <= E && L.push(O) : c[k] <= e.virtualSize - f && L.push(O);
    }
    (c = L),
      Math.floor(e.virtualSize - f) - Math.floor(c[c.length - 1]) > 1 &&
        (x || c.push(e.virtualSize - f));
  }
  if (o && t.loop) {
    const T = p[0] + h;
    if (t.slidesPerGroup > 1) {
      const x = Math.ceil(
          (e.virtual.slidesBefore + e.virtual.slidesAfter) / t.slidesPerGroup
        ),
        E = T * t.slidesPerGroup;
      for (let L = 0; L < x; L += 1) c.push(c[c.length - 1] + E);
    }
    for (let x = 0; x < e.virtual.slidesBefore + e.virtual.slidesAfter; x += 1)
      t.slidesPerGroup === 1 && c.push(c[c.length - 1] + T),
        v.push(v[v.length - 1] + T),
        (e.virtualSize += T);
  }
  if ((c.length === 0 && (c = [0]), h !== 0)) {
    const T =
      e.isHorizontal() && r ? "marginLeft" : e.getDirectionLabel("marginRight");
    d.filter((x, E) =>
      !t.cssMode || t.loop ? !0 : E !== d.length - 1
    ).forEach((x) => {
      x.style[T] = `${h}px`;
    });
  }
  if (t.centeredSlides && t.centeredSlidesBounds) {
    let T = 0;
    p.forEach((E) => {
      T += E + (h || 0);
    }),
      (T -= h);
    const x = T > f ? T - f : 0;
    c = c.map((E) => (E <= 0 ? -b : E > x ? x + y : E));
  }
  if (t.centerInsufficientSlides) {
    let T = 0;
    if (
      (p.forEach((x) => {
        T += x + (h || 0);
      }),
      (T -= h),
      T < f)
    ) {
      const x = (f - T) / 2;
      c.forEach((E, L) => {
        c[L] = E - x;
      }),
        v.forEach((E, L) => {
          v[L] = E + x;
        });
    }
  }
  if (
    (Object.assign(e, {
      slides: d,
      snapGrid: c,
      slidesGrid: v,
      slidesSizesGrid: p,
    }),
    t.centeredSlides && t.cssMode && !t.centeredSlidesBounds)
  ) {
    U(i, "--swiper-centered-offset-before", `${-c[0]}px`),
      U(
        i,
        "--swiper-centered-offset-after",
        `${e.size / 2 - p[p.length - 1] / 2}px`
      );
    const T = -e.snapGrid[0],
      x = -e.slidesGrid[0];
    (e.snapGrid = e.snapGrid.map((E) => E + T)),
      (e.slidesGrid = e.slidesGrid.map((E) => E + x));
  }
  if (
    (m !== a && e.emit("slidesLengthChange"),
    c.length !== P &&
      (e.params.watchOverflow && e.checkOverflow(),
      e.emit("snapGridLengthChange")),
    v.length !== u && e.emit("slidesGridLengthChange"),
    t.watchSlidesProgress && e.updateSlidesOffset(),
    e.emit("slidesUpdated"),
    !o && !t.cssMode && (t.effect === "slide" || t.effect === "fade"))
  ) {
    const T = `${t.containerModifierClass}backface-hidden`,
      x = e.el.classList.contains(T);
    m <= t.maxBackfaceHiddenSlides
      ? x || e.el.classList.add(T)
      : x && e.el.classList.remove(T);
  }
}
function Ct(e) {
  const s = this,
    t = [],
    i = s.virtual && s.params.virtual.enabled;
  let n = 0,
    r;
  typeof e == "number"
    ? s.setTransition(e)
    : e === !0 && s.setTransition(s.params.speed);
  const l = (o) => (i ? s.slides[s.getSlideIndexByData(o)] : s.slides[o]);
  if (s.params.slidesPerView !== "auto" && s.params.slidesPerView > 1)
    if (s.params.centeredSlides)
      (s.visibleSlides || []).forEach((o) => {
        t.push(o);
      });
    else
      for (r = 0; r < Math.ceil(s.params.slidesPerView); r += 1) {
        const o = s.activeIndex + r;
        if (o > s.slides.length && !i) break;
        t.push(l(o));
      }
  else t.push(l(s.activeIndex));
  for (r = 0; r < t.length; r += 1)
    if (typeof t[r] < "u") {
      const o = t[r].offsetHeight;
      n = o > n ? o : n;
    }
  (n || n === 0) && (s.wrapperEl.style.height = `${n}px`);
}
function Et() {
  const e = this,
    s = e.slides,
    t = e.isElement
      ? e.isHorizontal()
        ? e.wrapperEl.offsetLeft
        : e.wrapperEl.offsetTop
      : 0;
  for (let i = 0; i < s.length; i += 1)
    s[i].swiperSlideOffset =
      (e.isHorizontal() ? s[i].offsetLeft : s[i].offsetTop) -
      t -
      e.cssOverflowAdjustment();
}
const Te = (e, s, t) => {
  s && !e.classList.contains(t)
    ? e.classList.add(t)
    : !s && e.classList.contains(t) && e.classList.remove(t);
};
function Mt(e = (this && this.translate) || 0) {
  const s = this,
    t = s.params,
    { slides: i, rtlTranslate: n, snapGrid: r } = s;
  if (i.length === 0) return;
  typeof i[0].swiperSlideOffset > "u" && s.updateSlidesOffset();
  let l = -e;
  n && (l = e), (s.visibleSlidesIndexes = []), (s.visibleSlides = []);
  let o = t.spaceBetween;
  typeof o == "string" && o.indexOf("%") >= 0
    ? (o = (parseFloat(o.replace("%", "")) / 100) * s.size)
    : typeof o == "string" && (o = parseFloat(o));
  for (let a = 0; a < i.length; a += 1) {
    const d = i[a];
    let m = d.swiperSlideOffset;
    t.cssMode && t.centeredSlides && (m -= i[0].swiperSlideOffset);
    const c =
        (l + (t.centeredSlides ? s.minTranslate() : 0) - m) /
        (d.swiperSlideSize + o),
      v =
        (l - r[0] + (t.centeredSlides ? s.minTranslate() : 0) - m) /
        (d.swiperSlideSize + o),
      p = -(l - m),
      b = p + s.slidesSizesGrid[a],
      y = p >= 0 && p <= s.size - s.slidesSizesGrid[a],
      P =
        (p >= 0 && p < s.size - 1) ||
        (b > 1 && b <= s.size) ||
        (p <= 0 && b >= s.size);
    P && (s.visibleSlides.push(d), s.visibleSlidesIndexes.push(a)),
      Te(d, P, t.slideVisibleClass),
      Te(d, y, t.slideFullyVisibleClass),
      (d.progress = n ? -c : c),
      (d.originalProgress = n ? -v : v);
  }
}
function _t(e) {
  const s = this;
  if (typeof e > "u") {
    const m = s.rtlTranslate ? -1 : 1;
    e = (s && s.translate && s.translate * m) || 0;
  }
  const t = s.params,
    i = s.maxTranslate() - s.minTranslate();
  let { progress: n, isBeginning: r, isEnd: l, progressLoop: o } = s;
  const a = r,
    d = l;
  if (i === 0) (n = 0), (r = !0), (l = !0);
  else {
    n = (e - s.minTranslate()) / i;
    const m = Math.abs(e - s.minTranslate()) < 1,
      c = Math.abs(e - s.maxTranslate()) < 1;
    (r = m || n <= 0), (l = c || n >= 1), m && (n = 0), c && (n = 1);
  }
  if (t.loop) {
    const m = s.getSlideIndexByData(0),
      c = s.getSlideIndexByData(s.slides.length - 1),
      v = s.slidesGrid[m],
      p = s.slidesGrid[c],
      b = s.slidesGrid[s.slidesGrid.length - 1],
      y = Math.abs(e);
    y >= v ? (o = (y - v) / b) : (o = (y + b - p) / b), o > 1 && (o -= 1);
  }
  Object.assign(s, { progress: n, progressLoop: o, isBeginning: r, isEnd: l }),
    (t.watchSlidesProgress || (t.centeredSlides && t.autoHeight)) &&
      s.updateSlidesProgress(e),
    r && !a && s.emit("reachBeginning toEdge"),
    l && !d && s.emit("reachEnd toEdge"),
    ((a && !r) || (d && !l)) && s.emit("fromEdge"),
    s.emit("progress", n);
}
const ce = (e, s, t) => {
  s && !e.classList.contains(t)
    ? e.classList.add(t)
    : !s && e.classList.contains(t) && e.classList.remove(t);
};
function Pt() {
  const e = this,
    { slides: s, params: t, slidesEl: i, activeIndex: n } = e,
    r = e.virtual && t.virtual.enabled,
    l = e.grid && t.grid && t.grid.rows > 1,
    o = (c) => H(i, `.${t.slideClass}${c}, swiper-slide${c}`)[0];
  let a, d, m;
  if (r)
    if (t.loop) {
      let c = n - e.virtual.slidesBefore;
      c < 0 && (c = e.virtual.slides.length + c),
        c >= e.virtual.slides.length && (c -= e.virtual.slides.length),
        (a = o(`[data-swiper-slide-index="${c}"]`));
    } else a = o(`[data-swiper-slide-index="${n}"]`);
  else
    l
      ? ((a = s.find((c) => c.column === n)),
        (m = s.find((c) => c.column === n + 1)),
        (d = s.find((c) => c.column === n - 1)))
      : (a = s[n]);
  a &&
    (l ||
      ((m = ht(a, `.${t.slideClass}, swiper-slide`)[0]),
      t.loop && !m && (m = s[0]),
      (d = mt(a, `.${t.slideClass}, swiper-slide`)[0]),
      t.loop && !d === 0 && (d = s[s.length - 1]))),
    s.forEach((c) => {
      ce(c, c === a, t.slideActiveClass),
        ce(c, c === m, t.slideNextClass),
        ce(c, c === d, t.slidePrevClass);
    }),
    e.emitSlidesClasses();
}
const te = (e, s) => {
    if (!e || e.destroyed || !e.params) return;
    const t = () => (e.isElement ? "swiper-slide" : `.${e.params.slideClass}`),
      i = s.closest(t());
    if (i) {
      let n = i.querySelector(`.${e.params.lazyPreloaderClass}`);
      !n &&
        e.isElement &&
        (i.shadowRoot
          ? (n = i.shadowRoot.querySelector(`.${e.params.lazyPreloaderClass}`))
          : requestAnimationFrame(() => {
              i.shadowRoot &&
                ((n = i.shadowRoot.querySelector(
                  `.${e.params.lazyPreloaderClass}`
                )),
                n && !n.lazyPreloaderManaged && n.remove());
            })),
        n && !n.lazyPreloaderManaged && n.remove();
    }
  },
  ue = (e, s) => {
    if (!e.slides[s]) return;
    const t = e.slides[s].querySelector('[loading="lazy"]');
    t && t.removeAttribute("loading");
  },
  he = (e) => {
    if (!e || e.destroyed || !e.params) return;
    let s = e.params.lazyPreloadPrevNext;
    const t = e.slides.length;
    if (!t || !s || s < 0) return;
    s = Math.min(s, t);
    const i =
        e.params.slidesPerView === "auto"
          ? e.slidesPerViewDynamic()
          : Math.ceil(e.params.slidesPerView),
      n = e.activeIndex;
    if (e.params.grid && e.params.grid.rows > 1) {
      const l = n,
        o = [l - s];
      o.push(...Array.from({ length: s }).map((a, d) => l + i + d)),
        e.slides.forEach((a, d) => {
          o.includes(a.column) && ue(e, d);
        });
      return;
    }
    const r = n + i - 1;
    if (e.params.rewind || e.params.loop)
      for (let l = n - s; l <= r + s; l += 1) {
        const o = ((l % t) + t) % t;
        (o < n || o > r) && ue(e, o);
      }
    else
      for (let l = Math.max(n - s, 0); l <= Math.min(r + s, t - 1); l += 1)
        l !== n && (l > r || l < n) && ue(e, l);
  };
function Lt(e) {
  const { slidesGrid: s, params: t } = e,
    i = e.rtlTranslate ? e.translate : -e.translate;
  let n;
  for (let r = 0; r < s.length; r += 1)
    typeof s[r + 1] < "u"
      ? i >= s[r] && i < s[r + 1] - (s[r + 1] - s[r]) / 2
        ? (n = r)
        : i >= s[r] && i < s[r + 1] && (n = r + 1)
      : i >= s[r] && (n = r);
  return t.normalizeSlideIndex && (n < 0 || typeof n > "u") && (n = 0), n;
}
function It(e) {
  const s = this,
    t = s.rtlTranslate ? s.translate : -s.translate,
    { snapGrid: i, params: n, activeIndex: r, realIndex: l, snapIndex: o } = s;
  let a = e,
    d;
  const m = (p) => {
    let b = p - s.virtual.slidesBefore;
    return (
      b < 0 && (b = s.virtual.slides.length + b),
      b >= s.virtual.slides.length && (b -= s.virtual.slides.length),
      b
    );
  };
  if ((typeof a > "u" && (a = Lt(s)), i.indexOf(t) >= 0)) d = i.indexOf(t);
  else {
    const p = Math.min(n.slidesPerGroupSkip, a);
    d = p + Math.floor((a - p) / n.slidesPerGroup);
  }
  if ((d >= i.length && (d = i.length - 1), a === r && !s.params.loop)) {
    d !== o && ((s.snapIndex = d), s.emit("snapIndexChange"));
    return;
  }
  if (a === r && s.params.loop && s.virtual && s.params.virtual.enabled) {
    s.realIndex = m(a);
    return;
  }
  const c = s.grid && n.grid && n.grid.rows > 1;
  let v;
  if (s.virtual && n.virtual.enabled) n.loop ? (v = m(a)) : (v = a);
  else if (c) {
    const p = s.slides.find((y) => y.column === a);
    let b = parseInt(p.getAttribute("data-swiper-slide-index"), 10);
    Number.isNaN(b) && (b = Math.max(s.slides.indexOf(p), 0)),
      (v = Math.floor(b / n.grid.rows));
  } else if (s.slides[a]) {
    const p = s.slides[a].getAttribute("data-swiper-slide-index");
    p ? (v = parseInt(p, 10)) : (v = a);
  } else v = a;
  Object.assign(s, {
    previousSnapIndex: o,
    snapIndex: d,
    previousRealIndex: l,
    realIndex: v,
    previousIndex: r,
    activeIndex: a,
  }),
    s.initialized && he(s),
    s.emit("activeIndexChange"),
    s.emit("snapIndexChange"),
    (s.initialized || s.params.runCallbacksOnInit) &&
      (l !== v && s.emit("realIndexChange"), s.emit("slideChange"));
}
function kt(e, s) {
  const t = this,
    i = t.params;
  let n = e.closest(`.${i.slideClass}, swiper-slide`);
  !n &&
    t.isElement &&
    s &&
    s.length > 1 &&
    s.includes(e) &&
    [...s.slice(s.indexOf(e) + 1, s.length)].forEach((o) => {
      !n && o.matches && o.matches(`.${i.slideClass}, swiper-slide`) && (n = o);
    });
  let r = !1,
    l;
  if (n) {
    for (let o = 0; o < t.slides.length; o += 1)
      if (t.slides[o] === n) {
        (r = !0), (l = o);
        break;
      }
  }
  if (n && r)
    (t.clickedSlide = n),
      t.virtual && t.params.virtual.enabled
        ? (t.clickedIndex = parseInt(
            n.getAttribute("data-swiper-slide-index"),
            10
          ))
        : (t.clickedIndex = l);
  else {
    (t.clickedSlide = void 0), (t.clickedIndex = void 0);
    return;
  }
  i.slideToClickedSlide &&
    t.clickedIndex !== void 0 &&
    t.clickedIndex !== t.activeIndex &&
    t.slideToClickedSlide();
}
var At = {
  updateSize: Tt,
  updateSlides: xt,
  updateAutoHeight: Ct,
  updateSlidesOffset: Et,
  updateSlidesProgress: Mt,
  updateProgress: _t,
  updateSlidesClasses: Pt,
  updateActiveIndex: It,
  updateClickedSlide: kt,
};
function Ot(e = this.isHorizontal() ? "x" : "y") {
  const s = this,
    { params: t, rtlTranslate: i, translate: n, wrapperEl: r } = s;
  if (t.virtualTranslate) return i ? -n : n;
  if (t.cssMode) return n;
  let l = ct(r, e);
  return (l += s.cssOverflowAdjustment()), i && (l = -l), l || 0;
}
function zt(e, s) {
  const t = this,
    { rtlTranslate: i, params: n, wrapperEl: r, progress: l } = t;
  let o = 0,
    a = 0;
  const d = 0;
  t.isHorizontal() ? (o = i ? -e : e) : (a = e),
    n.roundLengths && ((o = Math.floor(o)), (a = Math.floor(a))),
    (t.previousTranslate = t.translate),
    (t.translate = t.isHorizontal() ? o : a),
    n.cssMode
      ? (r[t.isHorizontal() ? "scrollLeft" : "scrollTop"] = t.isHorizontal()
          ? -o
          : -a)
      : n.virtualTranslate ||
        (t.isHorizontal()
          ? (o -= t.cssOverflowAdjustment())
          : (a -= t.cssOverflowAdjustment()),
        (r.style.transform = `translate3d(${o}px, ${a}px, ${d}px)`));
  let m;
  const c = t.maxTranslate() - t.minTranslate();
  c === 0 ? (m = 0) : (m = (e - t.minTranslate()) / c),
    m !== l && t.updateProgress(e),
    t.emit("setTranslate", t.translate, s);
}
function Gt() {
  return -this.snapGrid[0];
}
function $t() {
  return -this.snapGrid[this.snapGrid.length - 1];
}
function Bt(e = 0, s = this.params.speed, t = !0, i = !0, n) {
  const r = this,
    { params: l, wrapperEl: o } = r;
  if (r.animating && l.preventInteractionOnTransition) return !1;
  const a = r.minTranslate(),
    d = r.maxTranslate();
  let m;
  if (
    (i && e > a ? (m = a) : i && e < d ? (m = d) : (m = e),
    r.updateProgress(m),
    l.cssMode)
  ) {
    const c = r.isHorizontal();
    if (s === 0) o[c ? "scrollLeft" : "scrollTop"] = -m;
    else {
      if (!r.support.smoothScroll)
        return (
          Oe({ swiper: r, targetPosition: -m, side: c ? "left" : "top" }), !0
        );
      o.scrollTo({ [c ? "left" : "top"]: -m, behavior: "smooth" });
    }
    return !0;
  }
  return (
    s === 0
      ? (r.setTransition(0),
        r.setTranslate(m),
        t && (r.emit("beforeTransitionStart", s, n), r.emit("transitionEnd")))
      : (r.setTransition(s),
        r.setTranslate(m),
        t && (r.emit("beforeTransitionStart", s, n), r.emit("transitionStart")),
        r.animating ||
          ((r.animating = !0),
          r.onTranslateToWrapperTransitionEnd ||
            (r.onTranslateToWrapperTransitionEnd = function (v) {
              !r ||
                r.destroyed ||
                (v.target === this &&
                  (r.wrapperEl.removeEventListener(
                    "transitionend",
                    r.onTranslateToWrapperTransitionEnd
                  ),
                  (r.onTranslateToWrapperTransitionEnd = null),
                  delete r.onTranslateToWrapperTransitionEnd,
                  (r.animating = !1),
                  t && r.emit("transitionEnd")));
            }),
          r.wrapperEl.addEventListener(
            "transitionend",
            r.onTranslateToWrapperTransitionEnd
          ))),
    !0
  );
}
var Vt = {
  getTranslate: Ot,
  setTranslate: zt,
  minTranslate: Gt,
  maxTranslate: $t,
  translateTo: Bt,
};
function Dt(e, s) {
  const t = this;
  t.params.cssMode ||
    ((t.wrapperEl.style.transitionDuration = `${e}ms`),
    (t.wrapperEl.style.transitionDelay = e === 0 ? "0ms" : "")),
    t.emit("setTransition", e, s);
}
function Ve({ swiper: e, runCallbacks: s, direction: t, step: i }) {
  const { activeIndex: n, previousIndex: r } = e;
  let l = t;
  l || (n > r ? (l = "next") : n < r ? (l = "prev") : (l = "reset")),
    e.emit(`transition${i}`),
    s && l === "reset"
      ? e.emit(`slideResetTransition${i}`)
      : s &&
        n !== r &&
        (e.emit(`slideChangeTransition${i}`),
        l === "next"
          ? e.emit(`slideNextTransition${i}`)
          : e.emit(`slidePrevTransition${i}`));
}
function Ft(e = !0, s) {
  const t = this,
    { params: i } = t;
  i.cssMode ||
    (i.autoHeight && t.updateAutoHeight(),
    Ve({ swiper: t, runCallbacks: e, direction: s, step: "Start" }));
}
function Ht(e = !0, s) {
  const t = this,
    { params: i } = t;
  (t.animating = !1),
    !i.cssMode &&
      (t.setTransition(0),
      Ve({ swiper: t, runCallbacks: e, direction: s, step: "End" }));
}
var Nt = { setTransition: Dt, transitionStart: Ft, transitionEnd: Ht };
function Rt(e = 0, s, t = !0, i, n) {
  typeof e == "string" && (e = parseInt(e, 10));
  const r = this;
  let l = e;
  l < 0 && (l = 0);
  const {
    params: o,
    snapGrid: a,
    slidesGrid: d,
    previousIndex: m,
    activeIndex: c,
    rtlTranslate: v,
    wrapperEl: p,
    enabled: b,
  } = r;
  if (
    (!b && !i && !n) ||
    r.destroyed ||
    (r.animating && o.preventInteractionOnTransition)
  )
    return !1;
  typeof s > "u" && (s = r.params.speed);
  const y = Math.min(r.params.slidesPerGroupSkip, l);
  let P = y + Math.floor((l - y) / r.params.slidesPerGroup);
  P >= a.length && (P = a.length - 1);
  const u = -a[P];
  if (o.normalizeSlideIndex)
    for (let M = 0; M < d.length; M += 1) {
      const S = -Math.floor(u * 100),
        _ = Math.floor(d[M] * 100),
        T = Math.floor(d[M + 1] * 100);
      typeof d[M + 1] < "u"
        ? S >= _ && S < T - (T - _) / 2
          ? (l = M)
          : S >= _ && S < T && (l = M + 1)
        : S >= _ && (l = M);
    }
  if (
    r.initialized &&
    l !== c &&
    ((!r.allowSlideNext &&
      (v
        ? u > r.translate && u > r.minTranslate()
        : u < r.translate && u < r.minTranslate())) ||
      (!r.allowSlidePrev &&
        u > r.translate &&
        u > r.maxTranslate() &&
        (c || 0) !== l))
  )
    return !1;
  l !== (m || 0) && t && r.emit("beforeSlideChangeStart"), r.updateProgress(u);
  let f;
  l > c ? (f = "next") : l < c ? (f = "prev") : (f = "reset");
  const h = r.virtual && r.params.virtual.enabled;
  if (!(h && n) && ((v && -u === r.translate) || (!v && u === r.translate)))
    return (
      r.updateActiveIndex(l),
      o.autoHeight && r.updateAutoHeight(),
      r.updateSlidesClasses(),
      o.effect !== "slide" && r.setTranslate(u),
      f !== "reset" && (r.transitionStart(t, f), r.transitionEnd(t, f)),
      !1
    );
  if (o.cssMode) {
    const M = r.isHorizontal(),
      S = v ? u : -u;
    if (s === 0)
      h &&
        ((r.wrapperEl.style.scrollSnapType = "none"),
        (r._immediateVirtual = !0)),
        h && !r._cssModeVirtualInitialSet && r.params.initialSlide > 0
          ? ((r._cssModeVirtualInitialSet = !0),
            requestAnimationFrame(() => {
              p[M ? "scrollLeft" : "scrollTop"] = S;
            }))
          : (p[M ? "scrollLeft" : "scrollTop"] = S),
        h &&
          requestAnimationFrame(() => {
            (r.wrapperEl.style.scrollSnapType = ""), (r._immediateVirtual = !1);
          });
    else {
      if (!r.support.smoothScroll)
        return (
          Oe({ swiper: r, targetPosition: S, side: M ? "left" : "top" }), !0
        );
      p.scrollTo({ [M ? "left" : "top"]: S, behavior: "smooth" });
    }
    return !0;
  }
  const C = Be().isSafari;
  return (
    h && !n && C && r.isElement && r.virtual.update(!1, !1, l),
    r.setTransition(s),
    r.setTranslate(u),
    r.updateActiveIndex(l),
    r.updateSlidesClasses(),
    r.emit("beforeTransitionStart", s, i),
    r.transitionStart(t, f),
    s === 0
      ? r.transitionEnd(t, f)
      : r.animating ||
        ((r.animating = !0),
        r.onSlideToWrapperTransitionEnd ||
          (r.onSlideToWrapperTransitionEnd = function (S) {
            !r ||
              r.destroyed ||
              (S.target === this &&
                (r.wrapperEl.removeEventListener(
                  "transitionend",
                  r.onSlideToWrapperTransitionEnd
                ),
                (r.onSlideToWrapperTransitionEnd = null),
                delete r.onSlideToWrapperTransitionEnd,
                r.transitionEnd(t, f)));
          }),
        r.wrapperEl.addEventListener(
          "transitionend",
          r.onSlideToWrapperTransitionEnd
        )),
    !0
  );
}
function qt(e = 0, s, t = !0, i) {
  typeof e == "string" && (e = parseInt(e, 10));
  const n = this;
  if (n.destroyed) return;
  typeof s > "u" && (s = n.params.speed);
  const r = n.grid && n.params.grid && n.params.grid.rows > 1;
  let l = e;
  if (n.params.loop)
    if (n.virtual && n.params.virtual.enabled) l = l + n.virtual.slidesBefore;
    else {
      let o;
      if (r) {
        const y = l * n.params.grid.rows;
        o = n.slides.find(
          (P) => P.getAttribute("data-swiper-slide-index") * 1 === y
        ).column;
      } else o = n.getSlideIndexByData(l);
      const a = r
          ? Math.ceil(n.slides.length / n.params.grid.rows)
          : n.slides.length,
        {
          centeredSlides: d,
          slidesOffsetBefore: m,
          slidesOffsetAfter: c,
        } = n.params,
        v = d || !!m || !!c;
      let p = n.params.slidesPerView;
      p === "auto"
        ? (p = n.slidesPerViewDynamic())
        : ((p = Math.ceil(parseFloat(n.params.slidesPerView, 10))),
          v && p % 2 === 0 && (p = p + 1));
      let b = a - o < p;
      if (
        (v && (b = b || o < Math.ceil(p / 2)),
        i && v && n.params.slidesPerView !== "auto" && !r && (b = !1),
        b)
      ) {
        const y = v
          ? o < n.activeIndex
            ? "prev"
            : "next"
          : o - n.activeIndex - 1 < n.params.slidesPerView
          ? "next"
          : "prev";
        n.loopFix({
          direction: y,
          slideTo: !0,
          activeSlideIndex: y === "next" ? o + 1 : o - a + 1,
          slideRealIndex: y === "next" ? n.realIndex : void 0,
        });
      }
      if (r) {
        const y = l * n.params.grid.rows;
        l = n.slides.find(
          (P) => P.getAttribute("data-swiper-slide-index") * 1 === y
        ).column;
      } else l = n.getSlideIndexByData(l);
    }
  return (
    requestAnimationFrame(() => {
      n.slideTo(l, s, t, i);
    }),
    n
  );
}
function Wt(e, s = !0, t) {
  const i = this,
    { enabled: n, params: r, animating: l } = i;
  if (!n || i.destroyed) return i;
  typeof e > "u" && (e = i.params.speed);
  let o = r.slidesPerGroup;
  r.slidesPerView === "auto" &&
    r.slidesPerGroup === 1 &&
    r.slidesPerGroupAuto &&
    (o = Math.max(i.slidesPerViewDynamic("current", !0), 1));
  const a = i.activeIndex < r.slidesPerGroupSkip ? 1 : o,
    d = i.virtual && r.virtual.enabled;
  if (r.loop) {
    if (l && !d && r.loopPreventsSliding) return !1;
    if (
      (i.loopFix({ direction: "next" }),
      (i._clientLeft = i.wrapperEl.clientLeft),
      i.activeIndex === i.slides.length - 1 && r.cssMode)
    )
      return (
        requestAnimationFrame(() => {
          i.slideTo(i.activeIndex + a, e, s, t);
        }),
        !0
      );
  }
  return r.rewind && i.isEnd
    ? i.slideTo(0, e, s, t)
    : i.slideTo(i.activeIndex + a, e, s, t);
}
function jt(e, s = !0, t) {
  const i = this,
    {
      params: n,
      snapGrid: r,
      slidesGrid: l,
      rtlTranslate: o,
      enabled: a,
      animating: d,
    } = i;
  if (!a || i.destroyed) return i;
  typeof e > "u" && (e = i.params.speed);
  const m = i.virtual && n.virtual.enabled;
  if (n.loop) {
    if (d && !m && n.loopPreventsSliding) return !1;
    i.loopFix({ direction: "prev" }), (i._clientLeft = i.wrapperEl.clientLeft);
  }
  const c = o ? i.translate : -i.translate;
  function v(f) {
    return f < 0 ? -Math.floor(Math.abs(f)) : Math.floor(f);
  }
  const p = v(c),
    b = r.map((f) => v(f)),
    y = n.freeMode && n.freeMode.enabled;
  let P = r[b.indexOf(p) - 1];
  if (typeof P > "u" && (n.cssMode || y)) {
    let f;
    r.forEach((h, w) => {
      p >= h && (f = w);
    }),
      typeof f < "u" && (P = y ? r[f] : r[f > 0 ? f - 1 : f]);
  }
  let u = 0;
  if (
    (typeof P < "u" &&
      ((u = l.indexOf(P)),
      u < 0 && (u = i.activeIndex - 1),
      n.slidesPerView === "auto" &&
        n.slidesPerGroup === 1 &&
        n.slidesPerGroupAuto &&
        ((u = u - i.slidesPerViewDynamic("previous", !0) + 1),
        (u = Math.max(u, 0)))),
    n.rewind && i.isBeginning)
  ) {
    const f =
      i.params.virtual && i.params.virtual.enabled && i.virtual
        ? i.virtual.slides.length - 1
        : i.slides.length - 1;
    return i.slideTo(f, e, s, t);
  } else if (n.loop && i.activeIndex === 0 && n.cssMode)
    return (
      requestAnimationFrame(() => {
        i.slideTo(u, e, s, t);
      }),
      !0
    );
  return i.slideTo(u, e, s, t);
}
function Xt(e, s = !0, t) {
  const i = this;
  if (!i.destroyed)
    return (
      typeof e > "u" && (e = i.params.speed), i.slideTo(i.activeIndex, e, s, t)
    );
}
function Yt(e, s = !0, t, i = 0.5) {
  const n = this;
  if (n.destroyed) return;
  typeof e > "u" && (e = n.params.speed);
  let r = n.activeIndex;
  const l = Math.min(n.params.slidesPerGroupSkip, r),
    o = l + Math.floor((r - l) / n.params.slidesPerGroup),
    a = n.rtlTranslate ? n.translate : -n.translate;
  if (a >= n.snapGrid[o]) {
    const d = n.snapGrid[o],
      m = n.snapGrid[o + 1];
    a - d > (m - d) * i && (r += n.params.slidesPerGroup);
  } else {
    const d = n.snapGrid[o - 1],
      m = n.snapGrid[o];
    a - d <= (m - d) * i && (r -= n.params.slidesPerGroup);
  }
  return (
    (r = Math.max(r, 0)),
    (r = Math.min(r, n.slidesGrid.length - 1)),
    n.slideTo(r, e, s, t)
  );
}
function Ut() {
  const e = this;
  if (e.destroyed) return;
  const { params: s, slidesEl: t } = e,
    i = s.slidesPerView === "auto" ? e.slidesPerViewDynamic() : s.slidesPerView;
  let n = e.getSlideIndexWhenGrid(e.clickedIndex),
    r;
  const l = e.isElement ? "swiper-slide" : `.${s.slideClass}`,
    o = e.grid && e.params.grid && e.params.grid.rows > 1;
  if (s.loop) {
    if (e.animating) return;
    (r = parseInt(e.clickedSlide.getAttribute("data-swiper-slide-index"), 10)),
      s.centeredSlides
        ? e.slideToLoop(r)
        : n >
          (o
            ? (e.slides.length - i) / 2 - (e.params.grid.rows - 1)
            : e.slides.length - i)
        ? (e.loopFix(),
          (n = e.getSlideIndex(
            H(t, `${l}[data-swiper-slide-index="${r}"]`)[0]
          )),
          Ae(() => {
            e.slideTo(n);
          }))
        : e.slideTo(n);
  } else e.slideTo(n);
}
var Kt = {
  slideTo: Rt,
  slideToLoop: qt,
  slideNext: Wt,
  slidePrev: jt,
  slideReset: Xt,
  slideToClosest: Yt,
  slideToClickedSlide: Ut,
};
function Qt(e, s) {
  const t = this,
    { params: i, slidesEl: n } = t;
  if (!i.loop || (t.virtual && t.params.virtual.enabled)) return;
  const r = () => {
      H(n, `.${i.slideClass}, swiper-slide`).forEach((b, y) => {
        b.setAttribute("data-swiper-slide-index", y);
      });
    },
    l = () => {
      const p = H(n, `.${i.slideBlankClass}`);
      p.forEach((b) => {
        b.remove();
      }),
        p.length > 0 && (t.recalcSlides(), t.updateSlides());
    },
    o = t.grid && i.grid && i.grid.rows > 1;
  i.loopAddBlankSlides && (i.slidesPerGroup > 1 || o) && l();
  const a = i.slidesPerGroup * (o ? i.grid.rows : 1),
    d = t.slides.length % a !== 0,
    m = o && t.slides.length % i.grid.rows !== 0,
    c = (p) => {
      for (let b = 0; b < p; b += 1) {
        const y = t.isElement
          ? ne("swiper-slide", [i.slideBlankClass])
          : ne("div", [i.slideClass, i.slideBlankClass]);
        t.slidesEl.append(y);
      }
    };
  if (d) {
    if (i.loopAddBlankSlides) {
      const p = a - (t.slides.length % a);
      c(p), t.recalcSlides(), t.updateSlides();
    } else
      ie(
        "Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)"
      );
    r();
  } else if (m) {
    if (i.loopAddBlankSlides) {
      const p = i.grid.rows - (t.slides.length % i.grid.rows);
      c(p), t.recalcSlides(), t.updateSlides();
    } else
      ie(
        "Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)"
      );
    r();
  } else r();
  const v = i.centeredSlides || !!i.slidesOffsetBefore || !!i.slidesOffsetAfter;
  t.loopFix({ slideRealIndex: e, direction: v ? void 0 : "next", initial: s });
}
function Jt({
  slideRealIndex: e,
  slideTo: s = !0,
  direction: t,
  setTranslate: i,
  activeSlideIndex: n,
  initial: r,
  byController: l,
  byMousewheel: o,
} = {}) {
  const a = this;
  if (!a.params.loop) return;
  a.emit("beforeLoopFix");
  const {
      slides: d,
      allowSlidePrev: m,
      allowSlideNext: c,
      slidesEl: v,
      params: p,
    } = a,
    {
      centeredSlides: b,
      slidesOffsetBefore: y,
      slidesOffsetAfter: P,
      initialSlide: u,
    } = p,
    f = b || !!y || !!P;
  if (
    ((a.allowSlidePrev = !0),
    (a.allowSlideNext = !0),
    a.virtual && p.virtual.enabled)
  ) {
    s &&
      (!f && a.snapIndex === 0
        ? a.slideTo(a.virtual.slides.length, 0, !1, !0)
        : f && a.snapIndex < p.slidesPerView
        ? a.slideTo(a.virtual.slides.length + a.snapIndex, 0, !1, !0)
        : a.snapIndex === a.snapGrid.length - 1 &&
          a.slideTo(a.virtual.slidesBefore, 0, !1, !0)),
      (a.allowSlidePrev = m),
      (a.allowSlideNext = c),
      a.emit("loopFix");
    return;
  }
  let h = p.slidesPerView;
  h === "auto"
    ? (h = a.slidesPerViewDynamic())
    : ((h = Math.ceil(parseFloat(p.slidesPerView, 10))),
      f && h % 2 === 0 && (h = h + 1));
  const w = p.slidesPerGroupAuto ? h : p.slidesPerGroup;
  let g = f ? Math.max(w, Math.ceil(h / 2)) : w;
  g % w !== 0 && (g += w - (g % w)),
    (g += p.loopAdditionalSlides),
    (a.loopedSlides = g);
  const C = a.grid && p.grid && p.grid.rows > 1;
  d.length < h + g || (a.params.effect === "cards" && d.length < h + g * 2)
    ? ie(
        "Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters"
      )
    : C &&
      p.grid.fill === "row" &&
      ie(
        "Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`"
      );
  const M = [],
    S = [],
    _ = C ? Math.ceil(d.length / p.grid.rows) : d.length,
    T = r && _ - u < h && !f;
  let x = T ? u : a.activeIndex;
  typeof n > "u"
    ? (n = a.getSlideIndex(
        d.find((I) => I.classList.contains(p.slideActiveClass))
      ))
    : (x = n);
  const E = t === "next" || !t,
    L = t === "prev" || !t;
  let k = 0,
    O = 0;
  const X = (C ? d[n].column : n) + (f && typeof i > "u" ? -h / 2 + 0.5 : 0);
  if (X < g) {
    k = Math.max(g - X, w);
    for (let I = 0; I < g - X; I += 1) {
      const z = I - Math.floor(I / _) * _;
      if (C) {
        const $ = _ - z - 1;
        for (let W = d.length - 1; W >= 0; W -= 1)
          d[W].column === $ && M.push(W);
      } else M.push(_ - z - 1);
    }
  } else if (X + h > _ - g) {
    (O = Math.max(X - (_ - g * 2), w)), T && (O = Math.max(O, h - _ + u + 1));
    for (let I = 0; I < O; I += 1) {
      const z = I - Math.floor(I / _) * _;
      C
        ? d.forEach(($, W) => {
            $.column === z && S.push(W);
          })
        : S.push(z);
    }
  }
  if (
    ((a.__preventObserver__ = !0),
    requestAnimationFrame(() => {
      a.__preventObserver__ = !1;
    }),
    a.params.effect === "cards" &&
      d.length < h + g * 2 &&
      (S.includes(n) && S.splice(S.indexOf(n), 1),
      M.includes(n) && M.splice(M.indexOf(n), 1)),
    L &&
      M.forEach((I) => {
        (d[I].swiperLoopMoveDOM = !0),
          v.prepend(d[I]),
          (d[I].swiperLoopMoveDOM = !1);
      }),
    E &&
      S.forEach((I) => {
        (d[I].swiperLoopMoveDOM = !0),
          v.append(d[I]),
          (d[I].swiperLoopMoveDOM = !1);
      }),
    a.recalcSlides(),
    p.slidesPerView === "auto"
      ? a.updateSlides()
      : C &&
        ((M.length > 0 && L) || (S.length > 0 && E)) &&
        a.slides.forEach((I, z) => {
          a.grid.updateSlide(z, I, a.slides);
        }),
    p.watchSlidesProgress && a.updateSlidesOffset(),
    s)
  ) {
    if (M.length > 0 && L) {
      if (typeof e > "u") {
        const I = a.slidesGrid[x],
          $ = a.slidesGrid[x + k] - I;
        o
          ? a.setTranslate(a.translate - $)
          : (a.slideTo(x + Math.ceil(k), 0, !1, !0),
            i &&
              ((a.touchEventsData.startTranslate =
                a.touchEventsData.startTranslate - $),
              (a.touchEventsData.currentTranslate =
                a.touchEventsData.currentTranslate - $)));
      } else if (i) {
        const I = C ? M.length / p.grid.rows : M.length;
        a.slideTo(a.activeIndex + I, 0, !1, !0),
          (a.touchEventsData.currentTranslate = a.translate);
      }
    } else if (S.length > 0 && E)
      if (typeof e > "u") {
        const I = a.slidesGrid[x],
          $ = a.slidesGrid[x - O] - I;
        o
          ? a.setTranslate(a.translate - $)
          : (a.slideTo(x - O, 0, !1, !0),
            i &&
              ((a.touchEventsData.startTranslate =
                a.touchEventsData.startTranslate - $),
              (a.touchEventsData.currentTranslate =
                a.touchEventsData.currentTranslate - $)));
      } else {
        const I = C ? S.length / p.grid.rows : S.length;
        a.slideTo(a.activeIndex - I, 0, !1, !0);
      }
  }
  if (
    ((a.allowSlidePrev = m),
    (a.allowSlideNext = c),
    a.controller && a.controller.control && !l)
  ) {
    const I = {
      slideRealIndex: e,
      direction: t,
      setTranslate: i,
      activeSlideIndex: n,
      byController: !0,
    };
    Array.isArray(a.controller.control)
      ? a.controller.control.forEach((z) => {
          !z.destroyed &&
            z.params.loop &&
            z.loopFix({
              ...I,
              slideTo: z.params.slidesPerView === p.slidesPerView ? s : !1,
            });
        })
      : a.controller.control instanceof a.constructor &&
        a.controller.control.params.loop &&
        a.controller.control.loopFix({
          ...I,
          slideTo:
            a.controller.control.params.slidesPerView === p.slidesPerView
              ? s
              : !1,
        });
  }
  a.emit("loopFix");
}
function Zt() {
  const e = this,
    { params: s, slidesEl: t } = e;
  if (!s.loop || !t || (e.virtual && e.params.virtual.enabled)) return;
  e.recalcSlides();
  const i = [];
  e.slides.forEach((n) => {
    const r =
      typeof n.swiperSlideIndex > "u"
        ? n.getAttribute("data-swiper-slide-index") * 1
        : n.swiperSlideIndex;
    i[r] = n;
  }),
    e.slides.forEach((n) => {
      n.removeAttribute("data-swiper-slide-index");
    }),
    i.forEach((n) => {
      t.append(n);
    }),
    e.recalcSlides(),
    e.slideTo(e.realIndex, 0);
}
var es = { loopCreate: Qt, loopFix: Jt, loopDestroy: Zt };
function ts(e) {
  const s = this;
  if (
    !s.params.simulateTouch ||
    (s.params.watchOverflow && s.isLocked) ||
    s.params.cssMode
  )
    return;
  const t = s.params.touchEventsTarget === "container" ? s.el : s.wrapperEl;
  s.isElement && (s.__preventObserver__ = !0),
    (t.style.cursor = "move"),
    (t.style.cursor = e ? "grabbing" : "grab"),
    s.isElement &&
      requestAnimationFrame(() => {
        s.__preventObserver__ = !1;
      });
}
function ss() {
  const e = this;
  (e.params.watchOverflow && e.isLocked) ||
    e.params.cssMode ||
    (e.isElement && (e.__preventObserver__ = !0),
    (e[
      e.params.touchEventsTarget === "container" ? "el" : "wrapperEl"
    ].style.cursor = ""),
    e.isElement &&
      requestAnimationFrame(() => {
        e.__preventObserver__ = !1;
      }));
}
var is = { setGrabCursor: ts, unsetGrabCursor: ss };
function ns(e, s = this) {
  function t(i) {
    if (!i || i === Y() || i === G()) return null;
    i.assignedSlot && (i = i.assignedSlot);
    const n = i.closest(e);
    return !n && !i.getRootNode ? null : n || t(i.getRootNode().host);
  }
  return t(s);
}
function xe(e, s, t) {
  const i = G(),
    { params: n } = e,
    r = n.edgeSwipeDetection,
    l = n.edgeSwipeThreshold;
  return r && (t <= l || t >= i.innerWidth - l)
    ? r === "prevent"
      ? (s.preventDefault(), !0)
      : !1
    : !0;
}
function rs(e) {
  const s = this,
    t = Y();
  let i = e;
  i.originalEvent && (i = i.originalEvent);
  const n = s.touchEventsData;
  if (i.type === "pointerdown") {
    if (n.pointerId !== null && n.pointerId !== i.pointerId) return;
    n.pointerId = i.pointerId;
  } else
    i.type === "touchstart" &&
      i.targetTouches.length === 1 &&
      (n.touchId = i.targetTouches[0].identifier);
  if (i.type === "touchstart") {
    xe(s, i, i.targetTouches[0].pageX);
    return;
  }
  const { params: r, touches: l, enabled: o } = s;
  if (
    !o ||
    (!r.simulateTouch && i.pointerType === "mouse") ||
    (s.animating && r.preventInteractionOnTransition)
  )
    return;
  !s.animating && r.cssMode && r.loop && s.loopFix();
  let a = i.target;
  if (
    (r.touchEventsTarget === "wrapper" && !pt(a, s.wrapperEl)) ||
    ("which" in i && i.which === 3) ||
    ("button" in i && i.button > 0) ||
    (n.isTouched && n.isMoved)
  )
    return;
  const d = !!r.noSwipingClass && r.noSwipingClass !== "",
    m = i.composedPath ? i.composedPath() : i.path;
  d && i.target && i.target.shadowRoot && m && (a = m[0]);
  const c = r.noSwipingSelector ? r.noSwipingSelector : `.${r.noSwipingClass}`,
    v = !!(i.target && i.target.shadowRoot);
  if (r.noSwiping && (v ? ns(c, a) : a.closest(c))) {
    s.allowClick = !0;
    return;
  }
  if (r.swipeHandler && !a.closest(r.swipeHandler)) return;
  (l.currentX = i.pageX), (l.currentY = i.pageY);
  const p = l.currentX,
    b = l.currentY;
  if (!xe(s, i, p)) return;
  Object.assign(n, {
    isTouched: !0,
    isMoved: !1,
    allowTouchCallbacks: !0,
    isScrolling: void 0,
    startMoving: void 0,
  }),
    (l.startX = p),
    (l.startY = b),
    (n.touchStartTime = se()),
    (s.allowClick = !0),
    s.updateSize(),
    (s.swipeDirection = void 0),
    r.threshold > 0 && (n.allowThresholdMove = !1);
  let y = !0;
  a.matches(n.focusableElements) &&
    ((y = !1), a.nodeName === "SELECT" && (n.isTouched = !1)),
    t.activeElement &&
      t.activeElement.matches(n.focusableElements) &&
      t.activeElement !== a &&
      (i.pointerType === "mouse" ||
        (i.pointerType !== "mouse" && !a.matches(n.focusableElements))) &&
      t.activeElement.blur();
  const P = y && s.allowTouchMove && r.touchStartPreventDefault;
  (r.touchStartForcePreventDefault || P) &&
    !a.isContentEditable &&
    i.preventDefault(),
    r.freeMode &&
      r.freeMode.enabled &&
      s.freeMode &&
      s.animating &&
      !r.cssMode &&
      s.freeMode.onTouchStart(),
    s.emit("touchStart", i);
}
function as(e) {
  const s = Y(),
    t = this,
    i = t.touchEventsData,
    { params: n, touches: r, rtlTranslate: l, enabled: o } = t;
  if (!o || (!n.simulateTouch && e.pointerType === "mouse")) return;
  let a = e;
  if (
    (a.originalEvent && (a = a.originalEvent),
    a.type === "pointermove" &&
      (i.touchId !== null || a.pointerId !== i.pointerId))
  )
    return;
  let d;
  if (a.type === "touchmove") {
    if (
      ((d = [...a.changedTouches].find((g) => g.identifier === i.touchId)),
      !d || d.identifier !== i.touchId)
    )
      return;
  } else d = a;
  if (!i.isTouched) {
    i.startMoving && i.isScrolling && t.emit("touchMoveOpposite", a);
    return;
  }
  const m = d.pageX,
    c = d.pageY;
  if (a.preventedByNestedSwiper) {
    (r.startX = m), (r.startY = c);
    return;
  }
  if (!t.allowTouchMove) {
    a.target.matches(i.focusableElements) || (t.allowClick = !1),
      i.isTouched &&
        (Object.assign(r, { startX: m, startY: c, currentX: m, currentY: c }),
        (i.touchStartTime = se()));
    return;
  }
  if (n.touchReleaseOnEdges && !n.loop)
    if (t.isVertical()) {
      if (
        (c < r.startY && t.translate <= t.maxTranslate()) ||
        (c > r.startY && t.translate >= t.minTranslate())
      ) {
        (i.isTouched = !1), (i.isMoved = !1);
        return;
      }
    } else {
      if (
        l &&
        ((m > r.startX && -t.translate <= t.maxTranslate()) ||
          (m < r.startX && -t.translate >= t.minTranslate()))
      )
        return;
      if (
        !l &&
        ((m < r.startX && t.translate <= t.maxTranslate()) ||
          (m > r.startX && t.translate >= t.minTranslate()))
      )
        return;
    }
  if (
    (s.activeElement &&
      s.activeElement.matches(i.focusableElements) &&
      s.activeElement !== a.target &&
      a.pointerType !== "mouse" &&
      s.activeElement.blur(),
    s.activeElement &&
      a.target === s.activeElement &&
      a.target.matches(i.focusableElements))
  ) {
    (i.isMoved = !0), (t.allowClick = !1);
    return;
  }
  i.allowTouchCallbacks && t.emit("touchMove", a),
    (r.previousX = r.currentX),
    (r.previousY = r.currentY),
    (r.currentX = m),
    (r.currentY = c);
  const v = r.currentX - r.startX,
    p = r.currentY - r.startY;
  if (t.params.threshold && Math.sqrt(v ** 2 + p ** 2) < t.params.threshold)
    return;
  if (typeof i.isScrolling > "u") {
    let g;
    (t.isHorizontal() && r.currentY === r.startY) ||
    (t.isVertical() && r.currentX === r.startX)
      ? (i.isScrolling = !1)
      : v * v + p * p >= 25 &&
        ((g = (Math.atan2(Math.abs(p), Math.abs(v)) * 180) / Math.PI),
        (i.isScrolling = t.isHorizontal()
          ? g > n.touchAngle
          : 90 - g > n.touchAngle));
  }
  if (
    (i.isScrolling && t.emit("touchMoveOpposite", a),
    typeof i.startMoving > "u" &&
      (r.currentX !== r.startX || r.currentY !== r.startY) &&
      (i.startMoving = !0),
    i.isScrolling ||
      (a.type === "touchmove" && i.preventTouchMoveFromPointerMove))
  ) {
    i.isTouched = !1;
    return;
  }
  if (!i.startMoving) return;
  (t.allowClick = !1),
    !n.cssMode && a.cancelable && a.preventDefault(),
    n.touchMoveStopPropagation && !n.nested && a.stopPropagation();
  let b = t.isHorizontal() ? v : p,
    y = t.isHorizontal() ? r.currentX - r.previousX : r.currentY - r.previousY;
  n.oneWayMovement &&
    ((b = Math.abs(b) * (l ? 1 : -1)), (y = Math.abs(y) * (l ? 1 : -1))),
    (r.diff = b),
    (b *= n.touchRatio),
    l && ((b = -b), (y = -y));
  const P = t.touchesDirection;
  (t.swipeDirection = b > 0 ? "prev" : "next"),
    (t.touchesDirection = y > 0 ? "prev" : "next");
  const u = t.params.loop && !n.cssMode,
    f =
      (t.touchesDirection === "next" && t.allowSlideNext) ||
      (t.touchesDirection === "prev" && t.allowSlidePrev);
  if (!i.isMoved) {
    if (
      (u && f && t.loopFix({ direction: t.swipeDirection }),
      (i.startTranslate = t.getTranslate()),
      t.setTransition(0),
      t.animating)
    ) {
      const g = new window.CustomEvent("transitionend", {
        bubbles: !0,
        cancelable: !0,
        detail: { bySwiperTouchMove: !0 },
      });
      t.wrapperEl.dispatchEvent(g);
    }
    (i.allowMomentumBounce = !1),
      n.grabCursor &&
        (t.allowSlideNext === !0 || t.allowSlidePrev === !0) &&
        t.setGrabCursor(!0),
      t.emit("sliderFirstMove", a);
  }
  if (
    (new Date().getTime(),
    n._loopSwapReset !== !1 &&
      i.isMoved &&
      i.allowThresholdMove &&
      P !== t.touchesDirection &&
      u &&
      f &&
      Math.abs(b) >= 1)
  ) {
    Object.assign(r, {
      startX: m,
      startY: c,
      currentX: m,
      currentY: c,
      startTranslate: i.currentTranslate,
    }),
      (i.loopSwapReset = !0),
      (i.startTranslate = i.currentTranslate);
    return;
  }
  t.emit("sliderMove", a),
    (i.isMoved = !0),
    (i.currentTranslate = b + i.startTranslate);
  let h = !0,
    w = n.resistanceRatio;
  if (
    (n.touchReleaseOnEdges && (w = 0),
    b > 0
      ? (u &&
          f &&
          i.allowThresholdMove &&
          i.currentTranslate >
            (n.centeredSlides
              ? t.minTranslate() -
                t.slidesSizesGrid[t.activeIndex + 1] -
                (n.slidesPerView !== "auto" &&
                t.slides.length - n.slidesPerView >= 2
                  ? t.slidesSizesGrid[t.activeIndex + 1] + t.params.spaceBetween
                  : 0) -
                t.params.spaceBetween
              : t.minTranslate()) &&
          t.loopFix({
            direction: "prev",
            setTranslate: !0,
            activeSlideIndex: 0,
          }),
        i.currentTranslate > t.minTranslate() &&
          ((h = !1),
          n.resistance &&
            (i.currentTranslate =
              t.minTranslate() -
              1 +
              (-t.minTranslate() + i.startTranslate + b) ** w)))
      : b < 0 &&
        (u &&
          f &&
          i.allowThresholdMove &&
          i.currentTranslate <
            (n.centeredSlides
              ? t.maxTranslate() +
                t.slidesSizesGrid[t.slidesSizesGrid.length - 1] +
                t.params.spaceBetween +
                (n.slidesPerView !== "auto" &&
                t.slides.length - n.slidesPerView >= 2
                  ? t.slidesSizesGrid[t.slidesSizesGrid.length - 1] +
                    t.params.spaceBetween
                  : 0)
              : t.maxTranslate()) &&
          t.loopFix({
            direction: "next",
            setTranslate: !0,
            activeSlideIndex:
              t.slides.length -
              (n.slidesPerView === "auto"
                ? t.slidesPerViewDynamic()
                : Math.ceil(parseFloat(n.slidesPerView, 10))),
          }),
        i.currentTranslate < t.maxTranslate() &&
          ((h = !1),
          n.resistance &&
            (i.currentTranslate =
              t.maxTranslate() +
              1 -
              (t.maxTranslate() - i.startTranslate - b) ** w))),
    h && (a.preventedByNestedSwiper = !0),
    !t.allowSlideNext &&
      t.swipeDirection === "next" &&
      i.currentTranslate < i.startTranslate &&
      (i.currentTranslate = i.startTranslate),
    !t.allowSlidePrev &&
      t.swipeDirection === "prev" &&
      i.currentTranslate > i.startTranslate &&
      (i.currentTranslate = i.startTranslate),
    !t.allowSlidePrev &&
      !t.allowSlideNext &&
      (i.currentTranslate = i.startTranslate),
    n.threshold > 0)
  )
    if (Math.abs(b) > n.threshold || i.allowThresholdMove) {
      if (!i.allowThresholdMove) {
        (i.allowThresholdMove = !0),
          (r.startX = r.currentX),
          (r.startY = r.currentY),
          (i.currentTranslate = i.startTranslate),
          (r.diff = t.isHorizontal()
            ? r.currentX - r.startX
            : r.currentY - r.startY);
        return;
      }
    } else {
      i.currentTranslate = i.startTranslate;
      return;
    }
  !n.followFinger ||
    n.cssMode ||
    (((n.freeMode && n.freeMode.enabled && t.freeMode) ||
      n.watchSlidesProgress) &&
      (t.updateActiveIndex(), t.updateSlidesClasses()),
    n.freeMode && n.freeMode.enabled && t.freeMode && t.freeMode.onTouchMove(),
    t.updateProgress(i.currentTranslate),
    t.setTranslate(i.currentTranslate));
}
function ls(e) {
  const s = this,
    t = s.touchEventsData;
  let i = e;
  i.originalEvent && (i = i.originalEvent);
  let n;
  if (i.type === "touchend" || i.type === "touchcancel") {
    if (
      ((n = [...i.changedTouches].find((g) => g.identifier === t.touchId)),
      !n || n.identifier !== t.touchId)
    )
      return;
  } else {
    if (t.touchId !== null || i.pointerId !== t.pointerId) return;
    n = i;
  }
  if (
    ["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(
      i.type
    ) &&
    !(
      ["pointercancel", "contextmenu"].includes(i.type) &&
      (s.browser.isSafari || s.browser.isWebView)
    )
  )
    return;
  (t.pointerId = null), (t.touchId = null);
  const {
    params: l,
    touches: o,
    rtlTranslate: a,
    slidesGrid: d,
    enabled: m,
  } = s;
  if (!m || (!l.simulateTouch && i.pointerType === "mouse")) return;
  if (
    (t.allowTouchCallbacks && s.emit("touchEnd", i),
    (t.allowTouchCallbacks = !1),
    !t.isTouched)
  ) {
    t.isMoved && l.grabCursor && s.setGrabCursor(!1),
      (t.isMoved = !1),
      (t.startMoving = !1);
    return;
  }
  l.grabCursor &&
    t.isMoved &&
    t.isTouched &&
    (s.allowSlideNext === !0 || s.allowSlidePrev === !0) &&
    s.setGrabCursor(!1);
  const c = se(),
    v = c - t.touchStartTime;
  if (s.allowClick) {
    const g = i.path || (i.composedPath && i.composedPath());
    s.updateClickedSlide((g && g[0]) || i.target, g),
      s.emit("tap click", i),
      v < 300 &&
        c - t.lastClickTime < 300 &&
        s.emit("doubleTap doubleClick", i);
  }
  if (
    ((t.lastClickTime = se()),
    Ae(() => {
      s.destroyed || (s.allowClick = !0);
    }),
    !t.isTouched ||
      !t.isMoved ||
      !s.swipeDirection ||
      (o.diff === 0 && !t.loopSwapReset) ||
      (t.currentTranslate === t.startTranslate && !t.loopSwapReset))
  ) {
    (t.isTouched = !1), (t.isMoved = !1), (t.startMoving = !1);
    return;
  }
  (t.isTouched = !1), (t.isMoved = !1), (t.startMoving = !1);
  let p;
  if (
    (l.followFinger
      ? (p = a ? s.translate : -s.translate)
      : (p = -t.currentTranslate),
    l.cssMode)
  )
    return;
  if (l.freeMode && l.freeMode.enabled) {
    s.freeMode.onTouchEnd({ currentPos: p });
    return;
  }
  const b = p >= -s.maxTranslate() && !s.params.loop;
  let y = 0,
    P = s.slidesSizesGrid[0];
  for (
    let g = 0;
    g < d.length;
    g += g < l.slidesPerGroupSkip ? 1 : l.slidesPerGroup
  ) {
    const C = g < l.slidesPerGroupSkip - 1 ? 1 : l.slidesPerGroup;
    typeof d[g + C] < "u"
      ? (b || (p >= d[g] && p < d[g + C])) && ((y = g), (P = d[g + C] - d[g]))
      : (b || p >= d[g]) && ((y = g), (P = d[d.length - 1] - d[d.length - 2]));
  }
  let u = null,
    f = null;
  l.rewind &&
    (s.isBeginning
      ? (f =
          l.virtual && l.virtual.enabled && s.virtual
            ? s.virtual.slides.length - 1
            : s.slides.length - 1)
      : s.isEnd && (u = 0));
  const h = (p - d[y]) / P,
    w = y < l.slidesPerGroupSkip - 1 ? 1 : l.slidesPerGroup;
  if (v > l.longSwipesMs) {
    if (!l.longSwipes) {
      s.slideTo(s.activeIndex);
      return;
    }
    s.swipeDirection === "next" &&
      (h >= l.longSwipesRatio
        ? s.slideTo(l.rewind && s.isEnd ? u : y + w)
        : s.slideTo(y)),
      s.swipeDirection === "prev" &&
        (h > 1 - l.longSwipesRatio
          ? s.slideTo(y + w)
          : f !== null && h < 0 && Math.abs(h) > l.longSwipesRatio
          ? s.slideTo(f)
          : s.slideTo(y));
  } else {
    if (!l.shortSwipes) {
      s.slideTo(s.activeIndex);
      return;
    }
    s.navigation &&
    (i.target === s.navigation.nextEl || i.target === s.navigation.prevEl)
      ? i.target === s.navigation.nextEl
        ? s.slideTo(y + w)
        : s.slideTo(y)
      : (s.swipeDirection === "next" && s.slideTo(u !== null ? u : y + w),
        s.swipeDirection === "prev" && s.slideTo(f !== null ? f : y));
  }
}
function Ce() {
  const e = this,
    { params: s, el: t } = e;
  if (t && t.offsetWidth === 0) return;
  s.breakpoints && e.setBreakpoint();
  const { allowSlideNext: i, allowSlidePrev: n, snapGrid: r } = e,
    l = e.virtual && e.params.virtual.enabled;
  (e.allowSlideNext = !0),
    (e.allowSlidePrev = !0),
    e.updateSize(),
    e.updateSlides(),
    e.updateSlidesClasses();
  const o = l && s.loop;
  (s.slidesPerView === "auto" || s.slidesPerView > 1) &&
  e.isEnd &&
  !e.isBeginning &&
  !e.params.centeredSlides &&
  !o
    ? e.slideTo(e.slides.length - 1, 0, !1, !0)
    : e.params.loop && !l
    ? e.slideToLoop(e.realIndex, 0, !1, !0)
    : e.slideTo(e.activeIndex, 0, !1, !0),
    e.autoplay &&
      e.autoplay.running &&
      e.autoplay.paused &&
      (clearTimeout(e.autoplay.resizeTimeout),
      (e.autoplay.resizeTimeout = setTimeout(() => {
        e.autoplay &&
          e.autoplay.running &&
          e.autoplay.paused &&
          e.autoplay.resume();
      }, 500))),
    (e.allowSlidePrev = n),
    (e.allowSlideNext = i),
    e.params.watchOverflow && r !== e.snapGrid && e.checkOverflow();
}
function os(e) {
  const s = this;
  s.enabled &&
    (s.allowClick ||
      (s.params.preventClicks && e.preventDefault(),
      s.params.preventClicksPropagation &&
        s.animating &&
        (e.stopPropagation(), e.stopImmediatePropagation())));
}
function ds() {
  const e = this,
    { wrapperEl: s, rtlTranslate: t, enabled: i } = e;
  if (!i) return;
  (e.previousTranslate = e.translate),
    e.isHorizontal()
      ? (e.translate = -s.scrollLeft)
      : (e.translate = -s.scrollTop),
    e.translate === 0 && (e.translate = 0),
    e.updateActiveIndex(),
    e.updateSlidesClasses();
  let n;
  const r = e.maxTranslate() - e.minTranslate();
  r === 0 ? (n = 0) : (n = (e.translate - e.minTranslate()) / r),
    n !== e.progress && e.updateProgress(t ? -e.translate : e.translate),
    e.emit("setTranslate", e.translate, !1);
}
function cs(e) {
  const s = this;
  te(s, e.target),
    !(
      s.params.cssMode ||
      (s.params.slidesPerView !== "auto" && !s.params.autoHeight)
    ) && s.update();
}
function us() {
  const e = this;
  e.documentTouchHandlerProceeded ||
    ((e.documentTouchHandlerProceeded = !0),
    e.params.touchReleaseOnEdges && (e.el.style.touchAction = "auto"));
}
const De = (e, s) => {
  const t = Y(),
    { params: i, el: n, wrapperEl: r, device: l } = e,
    o = !!i.nested,
    a = s === "on" ? "addEventListener" : "removeEventListener",
    d = s;
  !n ||
    typeof n == "string" ||
    (t[a]("touchstart", e.onDocumentTouchStart, { passive: !1, capture: o }),
    n[a]("touchstart", e.onTouchStart, { passive: !1 }),
    n[a]("pointerdown", e.onTouchStart, { passive: !1 }),
    t[a]("touchmove", e.onTouchMove, { passive: !1, capture: o }),
    t[a]("pointermove", e.onTouchMove, { passive: !1, capture: o }),
    t[a]("touchend", e.onTouchEnd, { passive: !0 }),
    t[a]("pointerup", e.onTouchEnd, { passive: !0 }),
    t[a]("pointercancel", e.onTouchEnd, { passive: !0 }),
    t[a]("touchcancel", e.onTouchEnd, { passive: !0 }),
    t[a]("pointerout", e.onTouchEnd, { passive: !0 }),
    t[a]("pointerleave", e.onTouchEnd, { passive: !0 }),
    t[a]("contextmenu", e.onTouchEnd, { passive: !0 }),
    (i.preventClicks || i.preventClicksPropagation) &&
      n[a]("click", e.onClick, !0),
    i.cssMode && r[a]("scroll", e.onScroll),
    i.updateOnWindowResize
      ? e[d](
          l.ios || l.android
            ? "resize orientationchange observerUpdate"
            : "resize observerUpdate",
          Ce,
          !0
        )
      : e[d]("observerUpdate", Ce, !0),
    n[a]("load", e.onLoad, { capture: !0 }));
};
function fs() {
  const e = this,
    { params: s } = e;
  (e.onTouchStart = rs.bind(e)),
    (e.onTouchMove = as.bind(e)),
    (e.onTouchEnd = ls.bind(e)),
    (e.onDocumentTouchStart = us.bind(e)),
    s.cssMode && (e.onScroll = ds.bind(e)),
    (e.onClick = os.bind(e)),
    (e.onLoad = cs.bind(e)),
    De(e, "on");
}
function ps() {
  De(this, "off");
}
var ms = { attachEvents: fs, detachEvents: ps };
const Ee = (e, s) => e.grid && s.grid && s.grid.rows > 1;
function hs() {
  const e = this,
    { realIndex: s, initialized: t, params: i, el: n } = e,
    r = i.breakpoints;
  if (!r || (r && Object.keys(r).length === 0)) return;
  const l = Y(),
    o =
      i.breakpointsBase === "window" || !i.breakpointsBase
        ? i.breakpointsBase
        : "container",
    a =
      ["window", "container"].includes(i.breakpointsBase) || !i.breakpointsBase
        ? e.el
        : l.querySelector(i.breakpointsBase),
    d = e.getBreakpoint(r, o, a);
  if (!d || e.currentBreakpoint === d) return;
  const c = (d in r ? r[d] : void 0) || e.originalParams,
    v = Ee(e, i),
    p = Ee(e, c),
    b = e.params.grabCursor,
    y = c.grabCursor,
    P = i.enabled;
  v && !p
    ? (n.classList.remove(
        `${i.containerModifierClass}grid`,
        `${i.containerModifierClass}grid-column`
      ),
      e.emitContainerClasses())
    : !v &&
      p &&
      (n.classList.add(`${i.containerModifierClass}grid`),
      ((c.grid.fill && c.grid.fill === "column") ||
        (!c.grid.fill && i.grid.fill === "column")) &&
        n.classList.add(`${i.containerModifierClass}grid-column`),
      e.emitContainerClasses()),
    b && !y ? e.unsetGrabCursor() : !b && y && e.setGrabCursor(),
    ["navigation", "pagination", "scrollbar"].forEach((C) => {
      if (typeof c[C] > "u") return;
      const M = i[C] && i[C].enabled,
        S = c[C] && c[C].enabled;
      M && !S && e[C].disable(), !M && S && e[C].enable();
    });
  const u = c.direction && c.direction !== i.direction,
    f = i.loop && (c.slidesPerView !== i.slidesPerView || u),
    h = i.loop;
  u && t && e.changeDirection(), V(e.params, c);
  const w = e.params.enabled,
    g = e.params.loop;
  Object.assign(e, {
    allowTouchMove: e.params.allowTouchMove,
    allowSlideNext: e.params.allowSlideNext,
    allowSlidePrev: e.params.allowSlidePrev,
  }),
    P && !w ? e.disable() : !P && w && e.enable(),
    (e.currentBreakpoint = d),
    e.emit("_beforeBreakpoint", c),
    t &&
      (f
        ? (e.loopDestroy(), e.loopCreate(s), e.updateSlides())
        : !h && g
        ? (e.loopCreate(s), e.updateSlides())
        : h && !g && e.loopDestroy()),
    e.emit("breakpoint", c);
}
function gs(e, s = "window", t) {
  if (!e || (s === "container" && !t)) return;
  let i = !1;
  const n = G(),
    r = s === "window" ? n.innerHeight : t.clientHeight,
    l = Object.keys(e).map((o) => {
      if (typeof o == "string" && o.indexOf("@") === 0) {
        const a = parseFloat(o.substr(1));
        return { value: r * a, point: o };
      }
      return { value: o, point: o };
    });
  l.sort((o, a) => parseInt(o.value, 10) - parseInt(a.value, 10));
  for (let o = 0; o < l.length; o += 1) {
    const { point: a, value: d } = l[o];
    s === "window"
      ? n.matchMedia(`(min-width: ${d}px)`).matches && (i = a)
      : d <= t.clientWidth && (i = a);
  }
  return i || "max";
}
var vs = { setBreakpoint: hs, getBreakpoint: gs };
function Ss(e, s) {
  const t = [];
  return (
    e.forEach((i) => {
      typeof i == "object"
        ? Object.keys(i).forEach((n) => {
            i[n] && t.push(s + n);
          })
        : typeof i == "string" && t.push(s + i);
    }),
    t
  );
}
function bs() {
  const e = this,
    { classNames: s, params: t, rtl: i, el: n, device: r } = e,
    l = Ss(
      [
        "initialized",
        t.direction,
        { "free-mode": e.params.freeMode && t.freeMode.enabled },
        { autoheight: t.autoHeight },
        { rtl: i },
        { grid: t.grid && t.grid.rows > 1 },
        {
          "grid-column": t.grid && t.grid.rows > 1 && t.grid.fill === "column",
        },
        { android: r.android },
        { ios: r.ios },
        { "css-mode": t.cssMode },
        { centered: t.cssMode && t.centeredSlides },
        { "watch-progress": t.watchSlidesProgress },
      ],
      t.containerModifierClass
    );
  s.push(...l), n.classList.add(...s), e.emitContainerClasses();
}
function ys() {
  const e = this,
    { el: s, classNames: t } = e;
  !s ||
    typeof s == "string" ||
    (s.classList.remove(...t), e.emitContainerClasses());
}
var ws = { addClasses: bs, removeClasses: ys };
function Ts() {
  const e = this,
    { isLocked: s, params: t } = e,
    { slidesOffsetBefore: i } = t;
  if (i) {
    const n = e.slides.length - 1,
      r = e.slidesGrid[n] + e.slidesSizesGrid[n] + i * 2;
    e.isLocked = e.size > r;
  } else e.isLocked = e.snapGrid.length === 1;
  t.allowSlideNext === !0 && (e.allowSlideNext = !e.isLocked),
    t.allowSlidePrev === !0 && (e.allowSlidePrev = !e.isLocked),
    s && s !== e.isLocked && (e.isEnd = !1),
    s !== e.isLocked && e.emit(e.isLocked ? "lock" : "unlock");
}
var xs = { checkOverflow: Ts },
  Me = {
    init: !0,
    direction: "horizontal",
    oneWayMovement: !1,
    swiperElementNodeName: "SWIPER-CONTAINER",
    touchEventsTarget: "wrapper",
    initialSlide: 0,
    speed: 300,
    cssMode: !1,
    updateOnWindowResize: !0,
    resizeObserver: !0,
    nested: !1,
    createElements: !1,
    eventsPrefix: "swiper",
    enabled: !0,
    focusableElements: "input, select, option, textarea, button, video, label",
    width: null,
    height: null,
    preventInteractionOnTransition: !1,
    userAgent: null,
    url: null,
    edgeSwipeDetection: !1,
    edgeSwipeThreshold: 20,
    autoHeight: !1,
    setWrapperSize: !1,
    virtualTranslate: !1,
    effect: "slide",
    breakpoints: void 0,
    breakpointsBase: "window",
    spaceBetween: 0,
    slidesPerView: 1,
    slidesPerGroup: 1,
    slidesPerGroupSkip: 0,
    slidesPerGroupAuto: !1,
    centeredSlides: !1,
    centeredSlidesBounds: !1,
    slidesOffsetBefore: 0,
    slidesOffsetAfter: 0,
    normalizeSlideIndex: !0,
    centerInsufficientSlides: !1,
    snapToSlideEdge: !1,
    watchOverflow: !0,
    roundLengths: !1,
    touchRatio: 1,
    touchAngle: 45,
    simulateTouch: !0,
    shortSwipes: !0,
    longSwipes: !0,
    longSwipesRatio: 0.5,
    longSwipesMs: 300,
    followFinger: !0,
    allowTouchMove: !0,
    threshold: 5,
    touchMoveStopPropagation: !1,
    touchStartPreventDefault: !0,
    touchStartForcePreventDefault: !1,
    touchReleaseOnEdges: !1,
    uniqueNavElements: !0,
    resistance: !0,
    resistanceRatio: 0.85,
    watchSlidesProgress: !1,
    grabCursor: !1,
    preventClicks: !0,
    preventClicksPropagation: !0,
    slideToClickedSlide: !1,
    loop: !1,
    loopAddBlankSlides: !0,
    loopAdditionalSlides: 0,
    loopPreventsSliding: !0,
    rewind: !1,
    allowSlidePrev: !0,
    allowSlideNext: !0,
    swipeHandler: null,
    noSwiping: !0,
    noSwipingClass: "swiper-no-swiping",
    noSwipingSelector: null,
    passiveListeners: !0,
    maxBackfaceHiddenSlides: 10,
    containerModifierClass: "swiper-",
    slideClass: "swiper-slide",
    slideBlankClass: "swiper-slide-blank",
    slideActiveClass: "swiper-slide-active",
    slideVisibleClass: "swiper-slide-visible",
    slideFullyVisibleClass: "swiper-slide-fully-visible",
    slideNextClass: "swiper-slide-next",
    slidePrevClass: "swiper-slide-prev",
    wrapperClass: "swiper-wrapper",
    lazyPreloaderClass: "swiper-lazy-preloader",
    lazyPreloadPrevNext: 0,
    runCallbacksOnInit: !0,
    _emitClasses: !1,
  };
function Cs(e, s) {
  return function (i = {}) {
    const n = Object.keys(i)[0],
      r = i[n];
    if (typeof r != "object" || r === null) {
      V(s, i);
      return;
    }
    if (
      (e[n] === !0 && (e[n] = { enabled: !0 }),
      n === "navigation" &&
        e[n] &&
        e[n].enabled &&
        !e[n].prevEl &&
        !e[n].nextEl &&
        (e[n].auto = !0),
      ["pagination", "scrollbar"].indexOf(n) >= 0 &&
        e[n] &&
        e[n].enabled &&
        !e[n].el &&
        (e[n].auto = !0),
      !(n in e && "enabled" in r))
    ) {
      V(s, i);
      return;
    }
    typeof e[n] == "object" && !("enabled" in e[n]) && (e[n].enabled = !0),
      e[n] || (e[n] = { enabled: !1 }),
      V(s, i);
  };
}
const fe = {
    eventsEmitter: wt,
    update: At,
    translate: Vt,
    transition: Nt,
    slide: Kt,
    loop: es,
    grabCursor: is,
    events: ms,
    breakpoints: vs,
    checkOverflow: xs,
    classes: ws,
  },
  pe = {};
class F {
  constructor(...s) {
    let t, i;
    s.length === 1 &&
    s[0].constructor &&
    Object.prototype.toString.call(s[0]).slice(8, -1) === "Object"
      ? (i = s[0])
      : ([t, i] = s),
      i || (i = {}),
      (i = V({}, i)),
      t && !i.el && (i.el = t);
    const n = Y();
    if (
      i.el &&
      typeof i.el == "string" &&
      n.querySelectorAll(i.el).length > 1
    ) {
      const a = [];
      return (
        n.querySelectorAll(i.el).forEach((d) => {
          const m = V({}, i, { el: d });
          a.push(new F(m));
        }),
        a
      );
    }
    const r = this;
    (r.__swiper__ = !0),
      (r.support = Ge()),
      (r.device = $e({ userAgent: i.userAgent })),
      (r.browser = Be()),
      (r.eventsListeners = {}),
      (r.eventsAnyListeners = []),
      (r.modules = [...r.__modules__]),
      i.modules &&
        Array.isArray(i.modules) &&
        i.modules.forEach((a) => {
          typeof a == "function" &&
            r.modules.indexOf(a) < 0 &&
            r.modules.push(a);
        });
    const l = {};
    r.modules.forEach((a) => {
      a({
        params: i,
        swiper: r,
        extendParams: Cs(i, l),
        on: r.on.bind(r),
        once: r.once.bind(r),
        off: r.off.bind(r),
        emit: r.emit.bind(r),
      });
    });
    const o = V({}, Me, l);
    return (
      (r.params = V({}, o, pe, i)),
      (r.originalParams = V({}, r.params)),
      (r.passedParams = V({}, i)),
      r.params &&
        r.params.on &&
        Object.keys(r.params.on).forEach((a) => {
          r.on(a, r.params.on[a]);
        }),
      r.params && r.params.onAny && r.onAny(r.params.onAny),
      Object.assign(r, {
        enabled: r.params.enabled,
        el: t,
        classNames: [],
        slides: [],
        slidesGrid: [],
        snapGrid: [],
        slidesSizesGrid: [],
        isHorizontal() {
          return r.params.direction === "horizontal";
        },
        isVertical() {
          return r.params.direction === "vertical";
        },
        activeIndex: 0,
        realIndex: 0,
        isBeginning: !0,
        isEnd: !1,
        translate: 0,
        previousTranslate: 0,
        progress: 0,
        velocity: 0,
        animating: !1,
        cssOverflowAdjustment() {
          return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
        },
        allowSlideNext: r.params.allowSlideNext,
        allowSlidePrev: r.params.allowSlidePrev,
        touchEventsData: {
          isTouched: void 0,
          isMoved: void 0,
          allowTouchCallbacks: void 0,
          touchStartTime: void 0,
          isScrolling: void 0,
          currentTranslate: void 0,
          startTranslate: void 0,
          allowThresholdMove: void 0,
          focusableElements: r.params.focusableElements,
          lastClickTime: 0,
          clickTimeout: void 0,
          velocities: [],
          allowMomentumBounce: void 0,
          startMoving: void 0,
          pointerId: null,
          touchId: null,
        },
        allowClick: !0,
        allowTouchMove: r.params.allowTouchMove,
        touches: { startX: 0, startY: 0, currentX: 0, currentY: 0, diff: 0 },
        imagesToLoad: [],
        imagesLoaded: 0,
      }),
      r.emit("_swiper"),
      r.params.init && r.init(),
      r
    );
  }
  getDirectionLabel(s) {
    return this.isHorizontal()
      ? s
      : {
          width: "height",
          "margin-top": "margin-left",
          "margin-bottom ": "margin-right",
          "margin-left": "margin-top",
          "margin-right": "margin-bottom",
          "padding-left": "padding-top",
          "padding-right": "padding-bottom",
          marginRight: "marginBottom",
        }[s];
  }
  getSlideIndex(s) {
    const { slidesEl: t, params: i } = this,
      n = H(t, `.${i.slideClass}, swiper-slide`),
      r = re(n[0]);
    return re(s) - r;
  }
  getSlideIndexByData(s) {
    return this.getSlideIndex(
      this.slides.find(
        (t) => t.getAttribute("data-swiper-slide-index") * 1 === s
      )
    );
  }
  getSlideIndexWhenGrid(s) {
    return (
      this.grid &&
        this.params.grid &&
        this.params.grid.rows > 1 &&
        (this.params.grid.fill === "column"
          ? (s = Math.floor(s / this.params.grid.rows))
          : this.params.grid.fill === "row" &&
            (s = s % Math.ceil(this.slides.length / this.params.grid.rows))),
      s
    );
  }
  recalcSlides() {
    const s = this,
      { slidesEl: t, params: i } = s;
    s.slides = H(t, `.${i.slideClass}, swiper-slide`);
  }
  enable() {
    const s = this;
    s.enabled ||
      ((s.enabled = !0),
      s.params.grabCursor && s.setGrabCursor(),
      s.emit("enable"));
  }
  disable() {
    const s = this;
    s.enabled &&
      ((s.enabled = !1),
      s.params.grabCursor && s.unsetGrabCursor(),
      s.emit("disable"));
  }
  setProgress(s, t) {
    const i = this;
    s = Math.min(Math.max(s, 0), 1);
    const n = i.minTranslate(),
      l = (i.maxTranslate() - n) * s + n;
    i.translateTo(l, typeof t > "u" ? 0 : t),
      i.updateActiveIndex(),
      i.updateSlidesClasses();
  }
  emitContainerClasses() {
    const s = this;
    if (!s.params._emitClasses || !s.el) return;
    const t = s.el.className
      .split(" ")
      .filter(
        (i) =>
          i.indexOf("swiper") === 0 ||
          i.indexOf(s.params.containerModifierClass) === 0
      );
    s.emit("_containerClasses", t.join(" "));
  }
  getSlideClasses(s) {
    const t = this;
    return t.destroyed
      ? ""
      : s.className
          .split(" ")
          .filter(
            (i) =>
              i.indexOf("swiper-slide") === 0 ||
              i.indexOf(t.params.slideClass) === 0
          )
          .join(" ");
  }
  emitSlidesClasses() {
    const s = this;
    if (!s.params._emitClasses || !s.el) return;
    const t = [];
    s.slides.forEach((i) => {
      const n = s.getSlideClasses(i);
      t.push({ slideEl: i, classNames: n }), s.emit("_slideClass", i, n);
    }),
      s.emit("_slideClasses", t);
  }
  slidesPerViewDynamic(s = "current", t = !1) {
    const i = this,
      {
        params: n,
        slides: r,
        slidesGrid: l,
        slidesSizesGrid: o,
        size: a,
        activeIndex: d,
      } = i;
    let m = 1;
    if (typeof n.slidesPerView == "number") return n.slidesPerView;
    if (n.centeredSlides) {
      let c = r[d] ? Math.ceil(r[d].swiperSlideSize) : 0,
        v;
      for (let p = d + 1; p < r.length; p += 1)
        r[p] &&
          !v &&
          ((c += Math.ceil(r[p].swiperSlideSize)), (m += 1), c > a && (v = !0));
      for (let p = d - 1; p >= 0; p -= 1)
        r[p] &&
          !v &&
          ((c += r[p].swiperSlideSize), (m += 1), c > a && (v = !0));
    } else if (s === "current")
      for (let c = d + 1; c < r.length; c += 1)
        (t ? l[c] + o[c] - l[d] < a : l[c] - l[d] < a) && (m += 1);
    else for (let c = d - 1; c >= 0; c -= 1) l[d] - l[c] < a && (m += 1);
    return m;
  }
  update() {
    const s = this;
    if (!s || s.destroyed) return;
    const { snapGrid: t, params: i } = s;
    i.breakpoints && s.setBreakpoint(),
      [...s.el.querySelectorAll('[loading="lazy"]')].forEach((l) => {
        l.complete && te(s, l);
      }),
      s.updateSize(),
      s.updateSlides(),
      s.updateProgress(),
      s.updateSlidesClasses();
    function n() {
      const l = s.rtlTranslate ? s.translate * -1 : s.translate,
        o = Math.min(Math.max(l, s.maxTranslate()), s.minTranslate());
      s.setTranslate(o), s.updateActiveIndex(), s.updateSlidesClasses();
    }
    let r;
    if (i.freeMode && i.freeMode.enabled && !i.cssMode)
      n(), i.autoHeight && s.updateAutoHeight();
    else {
      if (
        (i.slidesPerView === "auto" || i.slidesPerView > 1) &&
        s.isEnd &&
        !i.centeredSlides
      ) {
        const l = s.virtual && i.virtual.enabled ? s.virtual.slides : s.slides;
        r = s.slideTo(l.length - 1, 0, !1, !0);
      } else r = s.slideTo(s.activeIndex, 0, !1, !0);
      r || n();
    }
    i.watchOverflow && t !== s.snapGrid && s.checkOverflow(), s.emit("update");
  }
  changeDirection(s, t = !0) {
    const i = this,
      n = i.params.direction;
    return (
      s || (s = n === "horizontal" ? "vertical" : "horizontal"),
      s === n ||
        (s !== "horizontal" && s !== "vertical") ||
        (i.el.classList.remove(`${i.params.containerModifierClass}${n}`),
        i.el.classList.add(`${i.params.containerModifierClass}${s}`),
        i.emitContainerClasses(),
        (i.params.direction = s),
        i.slides.forEach((r) => {
          s === "vertical" ? (r.style.width = "") : (r.style.height = "");
        }),
        i.emit("changeDirection"),
        t && i.update()),
      i
    );
  }
  changeLanguageDirection(s) {
    const t = this;
    (t.rtl && s === "rtl") ||
      (!t.rtl && s === "ltr") ||
      ((t.rtl = s === "rtl"),
      (t.rtlTranslate = t.params.direction === "horizontal" && t.rtl),
      t.rtl
        ? (t.el.classList.add(`${t.params.containerModifierClass}rtl`),
          (t.el.dir = "rtl"))
        : (t.el.classList.remove(`${t.params.containerModifierClass}rtl`),
          (t.el.dir = "ltr")),
      t.update());
  }
  mount(s) {
    const t = this;
    if (t.mounted) return !0;
    let i = s || t.params.el;
    if ((typeof i == "string" && (i = document.querySelector(i)), !i))
      return !1;
    (i.swiper = t),
      i.parentNode &&
        i.parentNode.host &&
        i.parentNode.host.nodeName ===
          t.params.swiperElementNodeName.toUpperCase() &&
        (t.isElement = !0);
    const n = () =>
      `.${(t.params.wrapperClass || "").trim().split(" ").join(".")}`;
    let l =
      i && i.shadowRoot && i.shadowRoot.querySelector
        ? i.shadowRoot.querySelector(n())
        : H(i, n())[0];
    return (
      !l &&
        t.params.createElements &&
        ((l = ne("div", t.params.wrapperClass)),
        i.append(l),
        H(i, `.${t.params.slideClass}`).forEach((o) => {
          l.append(o);
        })),
      Object.assign(t, {
        el: i,
        wrapperEl: l,
        slidesEl:
          t.isElement && !i.parentNode.host.slideSlots ? i.parentNode.host : l,
        hostEl: t.isElement ? i.parentNode.host : i,
        mounted: !0,
        rtl: i.dir.toLowerCase() === "rtl" || j(i, "direction") === "rtl",
        rtlTranslate:
          t.params.direction === "horizontal" &&
          (i.dir.toLowerCase() === "rtl" || j(i, "direction") === "rtl"),
        wrongRTL: j(l, "display") === "-webkit-box",
      }),
      !0
    );
  }
  init(s) {
    const t = this;
    if (t.initialized || t.mount(s) === !1) return t;
    t.emit("beforeInit"),
      t.params.breakpoints && t.setBreakpoint(),
      t.addClasses(),
      t.updateSize(),
      t.updateSlides(),
      t.params.watchOverflow && t.checkOverflow(),
      t.params.grabCursor && t.enabled && t.setGrabCursor(),
      t.params.loop && t.virtual && t.params.virtual.enabled
        ? t.slideTo(
            t.params.initialSlide + t.virtual.slidesBefore,
            0,
            t.params.runCallbacksOnInit,
            !1,
            !0
          )
        : t.slideTo(
            t.params.initialSlide,
            0,
            t.params.runCallbacksOnInit,
            !1,
            !0
          ),
      t.params.loop && t.loopCreate(void 0, !0),
      t.attachEvents();
    const n = [...t.el.querySelectorAll('[loading="lazy"]')];
    return (
      t.isElement && n.push(...t.hostEl.querySelectorAll('[loading="lazy"]')),
      n.forEach((r) => {
        r.complete
          ? te(t, r)
          : r.addEventListener("load", (l) => {
              te(t, l.target);
            });
      }),
      he(t),
      (t.initialized = !0),
      he(t),
      t.emit("init"),
      t.emit("afterInit"),
      t
    );
  }
  destroy(s = !0, t = !0) {
    const i = this,
      { params: n, el: r, wrapperEl: l, slides: o } = i;
    return (
      typeof i.params > "u" ||
        i.destroyed ||
        (i.emit("beforeDestroy"),
        (i.initialized = !1),
        i.detachEvents(),
        n.loop && i.loopDestroy(),
        t &&
          (i.removeClasses(),
          r && typeof r != "string" && r.removeAttribute("style"),
          l && l.removeAttribute("style"),
          o &&
            o.length &&
            o.forEach((a) => {
              a.classList.remove(
                n.slideVisibleClass,
                n.slideFullyVisibleClass,
                n.slideActiveClass,
                n.slideNextClass,
                n.slidePrevClass
              ),
                a.removeAttribute("style"),
                a.removeAttribute("data-swiper-slide-index");
            })),
        i.emit("destroy"),
        Object.keys(i.eventsListeners).forEach((a) => {
          i.off(a);
        }),
        s !== !1 &&
          (i.el && typeof i.el != "string" && (i.el.swiper = null), ot(i)),
        (i.destroyed = !0)),
      null
    );
  }
  static extendDefaults(s) {
    V(pe, s);
  }
  static get extendedDefaults() {
    return pe;
  }
  static get defaults() {
    return Me;
  }
  static installModule(s) {
    F.prototype.__modules__ || (F.prototype.__modules__ = []);
    const t = F.prototype.__modules__;
    typeof s == "function" && t.indexOf(s) < 0 && t.push(s);
  }
  static use(s) {
    return Array.isArray(s)
      ? (s.forEach((t) => F.installModule(t)), F)
      : (F.installModule(s), F);
  }
}
Object.keys(fe).forEach((e) => {
  Object.keys(fe[e]).forEach((s) => {
    F.prototype[s] = fe[e][s];
  });
});
F.use([bt, yt]);
function Es(e, s, t, i) {
  return (
    e.params.createElements &&
      Object.keys(i).forEach((n) => {
        if (!t[n] && t.auto === !0) {
          let r = H(e.el, `.${i[n]}`)[0];
          r || ((r = ne("div", i[n])), (r.className = i[n]), e.el.append(r)),
            (t[n] = r),
            (s[n] = r);
        }
      }),
    t
  );
}
function J(e = "") {
  return `.${e
    .trim()
    .replace(/([\.:!+\/()[\]#>~*^$|=,'"@{}\\])/g, "\\$1")
    .replace(/ /g, ".")}`;
}
function Ms({ swiper: e, extendParams: s, on: t, emit: i }) {
  const n = "swiper-pagination";
  s({
    pagination: {
      el: null,
      bulletElement: "span",
      clickable: !1,
      hideOnClick: !1,
      renderBullet: null,
      renderProgressbar: null,
      renderFraction: null,
      renderCustom: null,
      progressbarOpposite: !1,
      type: "bullets",
      dynamicBullets: !1,
      dynamicMainBullets: 1,
      formatFractionCurrent: (u) => u,
      formatFractionTotal: (u) => u,
      bulletClass: `${n}-bullet`,
      bulletActiveClass: `${n}-bullet-active`,
      modifierClass: `${n}-`,
      currentClass: `${n}-current`,
      totalClass: `${n}-total`,
      hiddenClass: `${n}-hidden`,
      progressbarFillClass: `${n}-progressbar-fill`,
      progressbarOppositeClass: `${n}-progressbar-opposite`,
      clickableClass: `${n}-clickable`,
      lockClass: `${n}-lock`,
      horizontalClass: `${n}-horizontal`,
      verticalClass: `${n}-vertical`,
      paginationDisabledClass: `${n}-disabled`,
    },
  }),
    (e.pagination = { el: null, bullets: [] });
  let r,
    l = 0;
  function o() {
    return (
      !e.params.pagination.el ||
      !e.pagination.el ||
      (Array.isArray(e.pagination.el) && e.pagination.el.length === 0)
    );
  }
  function a(u, f) {
    const { bulletActiveClass: h } = e.params.pagination;
    u &&
      ((u = u[`${f === "prev" ? "previous" : "next"}ElementSibling`]),
      u &&
        (u.classList.add(`${h}-${f}`),
        (u = u[`${f === "prev" ? "previous" : "next"}ElementSibling`]),
        u && u.classList.add(`${h}-${f}-${f}`)));
  }
  function d(u, f, h) {
    if (((u = u % h), (f = f % h), f === u + 1)) return "next";
    if (f === u - 1) return "previous";
  }
  function m(u) {
    const f = u.target.closest(J(e.params.pagination.bulletClass));
    if (!f) return;
    u.preventDefault();
    const h = re(f) * e.params.slidesPerGroup;
    if (e.params.loop) {
      if (e.realIndex === h) return;
      const w = d(e.realIndex, h, e.slides.length);
      w === "next"
        ? e.slideNext()
        : w === "previous"
        ? e.slidePrev()
        : e.slideToLoop(h);
    } else e.slideTo(h);
  }
  function c() {
    const u = e.rtl,
      f = e.params.pagination;
    if (o()) return;
    let h = e.pagination.el;
    h = R(h);
    let w, g;
    const C =
        e.virtual && e.params.virtual.enabled
          ? e.virtual.slides.length
          : e.slides.length,
      M = e.params.loop
        ? Math.ceil(C / e.params.slidesPerGroup)
        : e.snapGrid.length;
    if (
      (e.params.loop
        ? ((g = e.previousRealIndex || 0),
          (w =
            e.params.slidesPerGroup > 1
              ? Math.floor(e.realIndex / e.params.slidesPerGroup)
              : e.realIndex))
        : typeof e.snapIndex < "u"
        ? ((w = e.snapIndex), (g = e.previousSnapIndex))
        : ((g = e.previousIndex || 0), (w = e.activeIndex || 0)),
      f.type === "bullets" &&
        e.pagination.bullets &&
        e.pagination.bullets.length > 0)
    ) {
      const S = e.pagination.bullets;
      let _, T, x;
      if (
        (f.dynamicBullets &&
          ((r = me(S[0], e.isHorizontal() ? "width" : "height")),
          h.forEach((E) => {
            E.style[e.isHorizontal() ? "width" : "height"] = `${
              r * (f.dynamicMainBullets + 4)
            }px`;
          }),
          f.dynamicMainBullets > 1 &&
            g !== void 0 &&
            ((l += w - (g || 0)),
            l > f.dynamicMainBullets - 1
              ? (l = f.dynamicMainBullets - 1)
              : l < 0 && (l = 0)),
          (_ = Math.max(w - l, 0)),
          (T = _ + (Math.min(S.length, f.dynamicMainBullets) - 1)),
          (x = (T + _) / 2)),
        S.forEach((E) => {
          const L = [
            ...["", "-next", "-next-next", "-prev", "-prev-prev", "-main"].map(
              (k) => `${f.bulletActiveClass}${k}`
            ),
          ]
            .map((k) =>
              typeof k == "string" && k.includes(" ") ? k.split(" ") : k
            )
            .flat();
          E.classList.remove(...L);
        }),
        h.length > 1)
      )
        S.forEach((E) => {
          const L = re(E);
          L === w
            ? E.classList.add(...f.bulletActiveClass.split(" "))
            : e.isElement && E.setAttribute("part", "bullet"),
            f.dynamicBullets &&
              (L >= _ &&
                L <= T &&
                E.classList.add(...`${f.bulletActiveClass}-main`.split(" ")),
              L === _ && a(E, "prev"),
              L === T && a(E, "next"));
        });
      else {
        const E = S[w];
        if (
          (E && E.classList.add(...f.bulletActiveClass.split(" ")),
          e.isElement &&
            S.forEach((L, k) => {
              L.setAttribute("part", k === w ? "bullet-active" : "bullet");
            }),
          f.dynamicBullets)
        ) {
          const L = S[_],
            k = S[T];
          for (let O = _; O <= T; O += 1)
            S[O] &&
              S[O].classList.add(...`${f.bulletActiveClass}-main`.split(" "));
          a(L, "prev"), a(k, "next");
        }
      }
      if (f.dynamicBullets) {
        const E = Math.min(S.length, f.dynamicMainBullets + 4),
          L = (r * E - r) / 2 - x * r,
          k = u ? "right" : "left";
        S.forEach((O) => {
          O.style[e.isHorizontal() ? k : "top"] = `${L}px`;
        });
      }
    }
    h.forEach((S, _) => {
      if (
        (f.type === "fraction" &&
          (S.querySelectorAll(J(f.currentClass)).forEach((T) => {
            T.textContent = f.formatFractionCurrent(w + 1);
          }),
          S.querySelectorAll(J(f.totalClass)).forEach((T) => {
            T.textContent = f.formatFractionTotal(M);
          })),
        f.type === "progressbar")
      ) {
        let T;
        f.progressbarOpposite
          ? (T = e.isHorizontal() ? "vertical" : "horizontal")
          : (T = e.isHorizontal() ? "horizontal" : "vertical");
        const x = (w + 1) / M;
        let E = 1,
          L = 1;
        T === "horizontal" ? (E = x) : (L = x),
          S.querySelectorAll(J(f.progressbarFillClass)).forEach((k) => {
            (k.style.transform = `translate3d(0,0,0) scaleX(${E}) scaleY(${L})`),
              (k.style.transitionDuration = `${e.params.speed}ms`);
          });
      }
      f.type === "custom" && f.renderCustom
        ? (we(S, f.renderCustom(e, w + 1, M)),
          _ === 0 && i("paginationRender", S))
        : (_ === 0 && i("paginationRender", S), i("paginationUpdate", S)),
        e.params.watchOverflow &&
          e.enabled &&
          S.classList[e.isLocked ? "add" : "remove"](f.lockClass);
    });
  }
  function v() {
    const u = e.params.pagination;
    if (o()) return;
    const f =
      e.virtual && e.params.virtual.enabled
        ? e.virtual.slides.length
        : e.grid && e.params.grid.rows > 1
        ? e.slides.length / Math.ceil(e.params.grid.rows)
        : e.slides.length;
    let h = e.pagination.el;
    h = R(h);
    let w = "";
    if (u.type === "bullets") {
      let g = e.params.loop
        ? Math.ceil(f / e.params.slidesPerGroup)
        : e.snapGrid.length;
      e.params.freeMode && e.params.freeMode.enabled && g > f && (g = f);
      for (let C = 0; C < g; C += 1)
        u.renderBullet
          ? (w += u.renderBullet.call(e, C, u.bulletClass))
          : (w += `<${u.bulletElement} ${
              e.isElement ? 'part="bullet"' : ""
            } class="${u.bulletClass}"></${u.bulletElement}>`);
    }
    u.type === "fraction" &&
      (u.renderFraction
        ? (w = u.renderFraction.call(e, u.currentClass, u.totalClass))
        : (w = `<span class="${u.currentClass}"></span> / <span class="${u.totalClass}"></span>`)),
      u.type === "progressbar" &&
        (u.renderProgressbar
          ? (w = u.renderProgressbar.call(e, u.progressbarFillClass))
          : (w = `<span class="${u.progressbarFillClass}"></span>`)),
      (e.pagination.bullets = []),
      h.forEach((g) => {
        u.type !== "custom" && we(g, w || ""),
          u.type === "bullets" &&
            e.pagination.bullets.push(...g.querySelectorAll(J(u.bulletClass)));
      }),
      u.type !== "custom" && i("paginationRender", h[0]);
  }
  function p() {
    e.params.pagination = Es(
      e,
      e.originalParams.pagination,
      e.params.pagination,
      { el: "swiper-pagination" }
    );
    const u = e.params.pagination;
    if (!u.el) return;
    let f;
    typeof u.el == "string" && e.isElement && (f = e.el.querySelector(u.el)),
      !f &&
        typeof u.el == "string" &&
        (f = [...document.querySelectorAll(u.el)]),
      f || (f = u.el),
      !(!f || f.length === 0) &&
        (e.params.uniqueNavElements &&
          typeof u.el == "string" &&
          Array.isArray(f) &&
          f.length > 1 &&
          ((f = [...e.el.querySelectorAll(u.el)]),
          f.length > 1 && (f = f.find((h) => ze(h, ".swiper")[0] === e.el))),
        Array.isArray(f) && f.length === 1 && (f = f[0]),
        Object.assign(e.pagination, { el: f }),
        (f = R(f)),
        f.forEach((h) => {
          u.type === "bullets" &&
            u.clickable &&
            h.classList.add(...(u.clickableClass || "").split(" ")),
            h.classList.add(u.modifierClass + u.type),
            h.classList.add(
              e.isHorizontal() ? u.horizontalClass : u.verticalClass
            ),
            u.type === "bullets" &&
              u.dynamicBullets &&
              (h.classList.add(`${u.modifierClass}${u.type}-dynamic`),
              (l = 0),
              u.dynamicMainBullets < 1 && (u.dynamicMainBullets = 1)),
            u.type === "progressbar" &&
              u.progressbarOpposite &&
              h.classList.add(u.progressbarOppositeClass),
            u.clickable && h.addEventListener("click", m),
            e.enabled || h.classList.add(u.lockClass);
        }));
  }
  function b() {
    const u = e.params.pagination;
    if (o()) return;
    let f = e.pagination.el;
    f &&
      ((f = R(f)),
      f.forEach((h) => {
        h.classList.remove(u.hiddenClass),
          h.classList.remove(u.modifierClass + u.type),
          h.classList.remove(
            e.isHorizontal() ? u.horizontalClass : u.verticalClass
          ),
          u.clickable &&
            (h.classList.remove(...(u.clickableClass || "").split(" ")),
            h.removeEventListener("click", m));
      })),
      e.pagination.bullets &&
        e.pagination.bullets.forEach((h) =>
          h.classList.remove(...u.bulletActiveClass.split(" "))
        );
  }
  t("changeDirection", () => {
    if (!e.pagination || !e.pagination.el) return;
    const u = e.params.pagination;
    let { el: f } = e.pagination;
    (f = R(f)),
      f.forEach((h) => {
        h.classList.remove(u.horizontalClass, u.verticalClass),
          h.classList.add(
            e.isHorizontal() ? u.horizontalClass : u.verticalClass
          );
      });
  }),
    t("init", () => {
      e.params.pagination.enabled === !1 ? P() : (p(), v(), c());
    }),
    t("activeIndexChange", () => {
      typeof e.snapIndex > "u" && c();
    }),
    t("snapIndexChange", () => {
      c();
    }),
    t("snapGridLengthChange", () => {
      v(), c();
    }),
    t("destroy", () => {
      b();
    }),
    t("enable disable", () => {
      let { el: u } = e.pagination;
      u &&
        ((u = R(u)),
        u.forEach((f) =>
          f.classList[e.enabled ? "remove" : "add"](
            e.params.pagination.lockClass
          )
        ));
    }),
    t("lock unlock", () => {
      c();
    }),
    t("click", (u, f) => {
      const h = f.target,
        w = R(e.pagination.el);
      if (
        e.params.pagination.el &&
        e.params.pagination.hideOnClick &&
        w &&
        w.length > 0 &&
        !h.classList.contains(e.params.pagination.bulletClass)
      ) {
        if (
          e.navigation &&
          ((e.navigation.nextEl && h === e.navigation.nextEl) ||
            (e.navigation.prevEl && h === e.navigation.prevEl))
        )
          return;
        const g = w[0].classList.contains(e.params.pagination.hiddenClass);
        i(g === !0 ? "paginationShow" : "paginationHide"),
          w.forEach((C) => C.classList.toggle(e.params.pagination.hiddenClass));
      }
    });
  const y = () => {
      e.el.classList.remove(e.params.pagination.paginationDisabledClass);
      let { el: u } = e.pagination;
      u &&
        ((u = R(u)),
        u.forEach((f) =>
          f.classList.remove(e.params.pagination.paginationDisabledClass)
        )),
        p(),
        v(),
        c();
    },
    P = () => {
      e.el.classList.add(e.params.pagination.paginationDisabledClass);
      let { el: u } = e.pagination;
      u &&
        ((u = R(u)),
        u.forEach((f) =>
          f.classList.add(e.params.pagination.paginationDisabledClass)
        )),
        b();
    };
  Object.assign(e.pagination, {
    enable: y,
    disable: P,
    render: v,
    update: c,
    init: p,
    destroy: b,
  });
}
const _s = { id: "q-and-a", ref: "videoContainer", class: "video-section" },
  Ps = { class: "video-section__videos" },
  Ls = { class: "video-section__videos-holder --desktop" },
  Is = { class: "swiper-wrapper" },
  ks = ["src", "poster"],
  As = ["src", "alt", "onClick"],
  Os = { class: "video-section__videos-navigation" },
  zs = ["onClick"],
  Gs = ["src", "alt"],
  $s = ["innerHTML"],
  Bs = { class: "line" },
  Vs = { class: "line" },
  Ds = { class: "line" },
  Fs = ["innerHTML"],
  Hs = _e({
    __name: "VideoSection",
    setup(e) {
      const s = Ke(),
        t = ae(() =>
          ["/ondernemer", "/merchant"].some((M) => s.path.includes(M))
            ? "b2b"
            : "b2c"
        ),
        { gsap: i } = Pe(),
        { locale: n } = Qe(),
        r = B(),
        l = B(),
        o = B(),
        a = B(),
        d = B(),
        m = B(null),
        c = B(null),
        v = B(0),
        p = B(null),
        b = B({}),
        y = ae(() => {
          const g = n.value === "nl" ? "nl" : "en";
          return [
            {
              src: `https://sowieso-wero-assets.s3.eu-central-1.amazonaws.com/videos/q-and-a-${g}.mp4`,
              poster: "/media/images/video-01-poster.jpg",
              title: "Q&A",
            },
            {
              src: `https://sowieso-wero-assets.s3.eu-central-1.amazonaws.com/videos/aankoopbescherming-${g}.mp4`,
              poster: "/media/images/video-02-poster.jpg",
              title: "Aankoopbescherming",
            },
            {
              src: `https://sowieso-wero-assets.s3.eu-central-1.amazonaws.com/videos/transactiekosten-${g}.mp4`,
              poster: "/media/images/video-03-poster.jpg",
              title: "Transactiekosten",
            },
          ];
        }),
        P = ae(() => [...y.value, ...y.value]),
        u = (g) => {
          const C = b.value[g];
          if (C) {
            const M = C.closest(".video-section__videos-slide"),
              S = M?.querySelector(".video-section__videos-slide-image"),
              _ = M?.querySelector(".video-section__videos-slide-btn");
            S && (S.style.display = "none"), _ && (_.style.display = "none");
            const T = () => {
              S && (S.style.display = "block"),
                _ && (_.style.display = "block");
            };
            C.addEventListener("pause", T, { once: !0 }),
              C.addEventListener("ended", T, { once: !0 }),
              C.play();
          }
        },
        f = (g) => {
          !c.value ||
            g === v.value ||
            !y.value[g] ||
            ((v.value = g),
            c.value.pause(),
            (c.value.source = {
              type: "video",
              sources: [{ src: y.value[g].src, type: "video/mp4" }],
              poster: y.value[g].poster,
            }),
            c.value.play());
        },
        h = () => {
          const g = y.value.length;
          new F(p.value, {
            modules: [Ms],
            slidesPerView: 1.5,
            spaceBetween: 27,
            centeredSlides: !0,
            loop: !0,
            pagination: {
              el: ".swiper-pagination",
              clickable: !0,
              renderBullet: function (C, M) {
                return C < g
                  ? `<span class="${M}" data-bullet-index="${C}"></span>`
                  : "";
              },
            },
            on: {
              slideChange: function () {
                const C = this.realIndex % g;
                document
                  .querySelectorAll(".swiper-pagination-bullet")
                  .forEach((_) =>
                    _.classList.remove("swiper-pagination-bullet-active")
                  );
                const S = document.querySelector(
                  `.swiper-pagination-bullet[data-bullet-index="${C}"]`
                );
                S && S.classList.add("swiper-pagination-bullet-active");
              },
            },
          });
        },
        w = async () => {
          if (!m.value) return;
          const { default: g } = await Ze(
            async () => {
              const { default: C } = await import("./Cwtstkjp.js");
              return { default: C };
            },
            [],
            import.meta.url
          );
          (c.value = new g(m.value, {
            controls: ["play", "progress", "mute"],
            autoplay: !1,
            volume: 1,
            muted: !1,
            iconUrl: "/plyr-icons.svg",
          })),
            y.value[0] &&
              (c.value.source = {
                type: "video",
                sources: [{ src: y.value[0].src, type: "video/mp4" }],
                poster: y.value[0].poster,
              });
        };
      return (
        Le(async () => {
          !r.value ||
            !d.value ||
            !o.value ||
            !a.value ||
            !l.value ||
            (i.to(l.value, {
              rotationX: 0,
              autoAlpha: 1,
              duration: 0.75,
              ease: "power2.out",
              transformOrigin: "center center",
              scrollTrigger: { trigger: r.value, start: "top 85%" },
              onStart() {
                i.to(".video-section__videos", {
                  autoAlpha: 1,
                  y: 0,
                  duration: 1.2,
                  ease: "power2.out",
                });
              },
            }),
            window.matchMedia("(max-width: 1023px)").matches ? h() : w());
        }),
        (g, C) => {
          const M = Je;
          return (
            K(),
            Q(
              "section",
              _s,
              [
                A("div", Ps, [
                  A("div", Ls, [
                    A(
                      "video",
                      {
                        ref_key: "video",
                        ref: m,
                        class: "video-section__videos-video",
                        playsinline: "",
                      },
                      null,
                      512
                    ),
                  ]),
                  A(
                    "div",
                    {
                      ref_key: "sliderRef",
                      ref: p,
                      class: "video-section__videos-holder --mobile",
                    },
                    [
                      A("div", Is, [
                        (K(!0),
                        Q(
                          ve,
                          null,
                          Se(
                            N(P),
                            (S, _) => (
                              K(),
                              Q(
                                "div",
                                {
                                  key: _,
                                  class:
                                    "video-section__videos-slide swiper-slide",
                                },
                                [
                                  A(
                                    "video",
                                    {
                                      ref_for: !0,
                                      ref: (T) => {
                                        T && (N(b)[_] = T);
                                      },
                                      class:
                                        "video-section__videos-slide-video",
                                      src: S.src,
                                      poster: S.poster,
                                      controls: "",
                                    },
                                    null,
                                    8,
                                    ks
                                  ),
                                  A(
                                    "img",
                                    {
                                      class:
                                        "video-section__videos-slide-image",
                                      src: S.poster,
                                      alt: S.title,
                                      onClick: (T) => u(_),
                                    },
                                    null,
                                    8,
                                    As
                                  ),
                                  C[0] ||
                                    (C[0] = A(
                                      "img",
                                      {
                                        class:
                                          "video-section__videos-slide-btn",
                                        src: be,
                                        alt: "Play",
                                      },
                                      null,
                                      -1
                                    )),
                                ]
                              )
                            )
                          ),
                          128
                        )),
                      ]),
                      C[1] ||
                        (C[1] = A(
                          "div",
                          { class: "swiper-pagination" },
                          null,
                          -1
                        )),
                    ],
                    512
                  ),
                  A("div", Os, [
                    (K(!0),
                    Q(
                      ve,
                      null,
                      Se(
                        N(y),
                        (S, _) => (
                          K(),
                          Q(
                            "div",
                            {
                              key: _,
                              class: et([
                                "video-section__videos-navigation-item",
                                { "--active": N(v) === _ },
                              ]),
                              onClick: (T) => f(_),
                            },
                            [
                              C[2] ||
                                (C[2] = A(
                                  "div",
                                  {
                                    class:
                                      "video-section__videos-navigation-item-background",
                                  },
                                  null,
                                  -1
                                )),
                              A(
                                "img",
                                {
                                  class:
                                    "video-section__videos-navigation-item-image",
                                  src: S.poster,
                                  alt: S.title,
                                },
                                null,
                                8,
                                Gs
                              ),
                              C[3] ||
                                (C[3] = A(
                                  "img",
                                  {
                                    class:
                                      "video-section__videos-navigation-item-btn",
                                    src: be,
                                    alt: "Play",
                                  },
                                  null,
                                  -1
                                )),
                            ],
                            10,
                            zs
                          )
                        )
                      ),
                      128
                    )),
                  ]),
                ]),
                A(
                  "div",
                  {
                    ref_key: "contentContainer",
                    ref: r,
                    class: "video-section__content-container",
                  },
                  [
                    A(
                      "div",
                      {
                        ref_key: "topTitle",
                        ref: o,
                        class: "video-section__top-title",
                      },
                      [
                        A(
                          "div",
                          {
                            ref_key: "iconTopTitle",
                            ref: l,
                            class: "video-section__top-title-icon",
                          },
                          [D(M)],
                          512
                        ),
                        A(
                          "p",
                          {
                            "data-subtitle-reveal": "",
                            "data-reveal-position": "85%",
                            "data-reveal-delay": "0.2",
                            innerHTML: g.$t(`${N(t)}-video-section-top-title`),
                          },
                          null,
                          8,
                          $s
                        ),
                      ],
                      512
                    ),
                    A(
                      "h2",
                      {
                        ref_key: "title",
                        ref: a,
                        class: "video-section__title",
                        "data-title-reveal": "",
                      },
                      [
                        A(
                          "span",
                          Bs,
                          ee(g.$t(`${N(t)}-video-section-title-line1`)),
                          1
                        ),
                        A(
                          "span",
                          Vs,
                          ee(g.$t(`${N(t)}-video-section-title-line2`)),
                          1
                        ),
                        A(
                          "span",
                          Ds,
                          ee(g.$t(`${N(t)}-video-section-title-line3`)),
                          1
                        ),
                      ],
                      512
                    ),
                    A(
                      "div",
                      {
                        ref_key: "textContainer",
                        ref: d,
                        class: "video-section__text",
                        "data-reveal": "",
                        "data-reveal-delay": "0.2",
                        innerHTML: g.$t(`${N(t)}-video-section-text`),
                      },
                      null,
                      8,
                      Fs
                    ),
                  ],
                  512
                ),
              ],
              512
            )
          );
        }
      );
    },
  }),
  Ns = Object.assign(Ie(Hs, [["__scopeId", "data-v-ef0b45d1"]]), {
    __name: "VideoSection",
  }),
  Rs = { class: "button-primary__icon-holder" },
  qs = { class: "button-primary__text" },
  Ws = { class: "button-primary__icon-holder" },
  js = _e({
    __name: "index",
    setup(e) {
      tt({ title: "Sowieso Wero - B2B" });
      const { gsap: s } = Pe(),
        t = B(),
        i = B(),
        n = B(),
        r = st(),
        { initReveals: l } = rt();
      Le(() => {
        if (!t.value || !i.value) return;
        s.to(t.value, {
          opacity: 0,
          ease: "power2.out",
          transformOrigin: "center center",
          scrollTrigger: {
            trigger: i.value.$el,
            start: "top center",
            end: "top top",
            scrub: !0,
          },
        }),
          l();
        const { $listen: m } = it();
        m("faq-section:show-button", () => {
          window.matchMedia("(min-width: 1024px)").matches && a();
        }),
          m("faq-section:hide-button", () => {
            window.matchMedia("(min-width: 1024px)").matches && d();
          });
      });
      function o() {
        r.openFaq();
      }
      function a() {
        if (!n.value) return;
        const m = n.value.querySelectorAll("span");
        s.killTweensOf([n.value, m]),
          s.to(n.value, { scale: 1, duration: 0.7, ease: "back.out(1.7)" }),
          s.to(n.value, {
            width: "auto",
            duration: 0.3,
            delay: 0.7,
            ease: "power2.out",
          }),
          s.to(m, {
            autoAlpha: 1,
            duration: 0.9,
            delay: 1,
            ease: "power2.out",
          });
      }
      function d() {
        if (!n.value) return;
        const m = n.value.querySelectorAll("span");
        s.killTweensOf([n.value, m]),
          s.to(m, { autoAlpha: 0, duration: 0.2, ease: "power2.out" }),
          s.to(n.value, {
            width: window.matchMedia("(min-width: 1024px)").matches
              ? "66px"
              : "50px",
            duration: 0.2,
            delay: 0.1,
            ease: "power2.out",
          }),
          s.to(n.value, {
            scale: 0,
            duration: 0.4,
            delay: 0.3,
            ease: "back.in(1.7)",
          });
      }
      return (m, c) => {
        const v = He,
          p = Ne,
          b = Re,
          y = qe,
          P = We,
          u = Ns,
          f = je,
          h = Xe,
          w = Ye,
          g = nt;
        return (
          K(),
          Q("main", null, [
            A(
              "div",
              { ref_key: "background", ref: t, class: "app__background" },
              null,
              512
            ),
            D(v),
            D(p),
            D(b),
            D(y),
            D(P),
            D(u),
            D(f, { ref_key: "partnersSection", ref: i }, null, 512),
            D(h),
            D(w),
            A("div", { class: "faq__button-container", onClick: o }, [
              A(
                "button",
                {
                  ref_key: "faqButton",
                  ref: n,
                  class:
                    "button-primary button-primary--white button-primary--icon faq__button",
                },
                [
                  A("span", Rs, [D(g)]),
                  A("span", qs, ee(m.$t("b2b-faq-button-text")), 1),
                  A("span", Ws, [D(g)]),
                ],
                512
              ),
            ]),
          ])
        );
      };
    },
  }),
  Ks = Ie(js, [["__scopeId", "data-v-1b91a326"]]);
export { Ks as default };
