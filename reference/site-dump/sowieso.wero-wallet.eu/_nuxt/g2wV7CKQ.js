import { H as f, a1 as y } from "./De_CX4X5.js";
const i = "75%";
function h() {
  const { gsap: t, ScrollTrigger: s } = f();
  function c() {
    [...document.querySelectorAll("[data-reveal]")].forEach((e, a) => {
      const {
        revealDelay: r,
        revealManually: l,
        revealPosition: o,
      } = e.dataset;
      if (l === "") return;
      const v = o || i;
      t.timeline({
        scrollTrigger: {
          trigger: e,
          start: `top ${v}`,
          once: !0,
          onEnter: () => {
            if (!r) {
              e.classList.add("--revealed");
              return;
            }
            t.delayedCall(parseFloat(r), () => {
              e.classList.add("--revealed");
            });
          },
        },
      });
    });
  }
  function u() {
    [...document.querySelectorAll("[data-title-reveal]")].forEach((e) => {
      const {
        revealDelay: a,
        revealManually: r,
        revealPosition: l,
      } = e.dataset;
      if (r === "") return;
      const o = l || i;
      s.create({
        trigger: e,
        start: `top ${o}`,
        once: !0,
        onEnter: () => {
          if (!a) {
            t.to(e.children, {
              autoAlpha: 1,
              y: 0,
              duration: 2,
              stagger: 0.2,
              ease: "back.out(1.7)",
            });
            return;
          }
          t.delayedCall(parseFloat(a), () => {
            t.to(e.children, {
              autoAlpha: 1,
              y: 0,
              duration: 2,
              stagger: 0.2,
              ease: "back.out(1.7)",
            });
          });
        },
      });
    });
  }
  function d() {
    [...document.querySelectorAll("[data-subtitle-reveal]")].forEach((e) => {
      const {
        revealDelay: a,
        revealManually: r,
        revealPosition: l,
      } = e.dataset;
      if (r === "") return;
      const o = l || "90%";
      s.create({
        trigger: e,
        start: `top ${o}`,
        once: !0,
        onEnter: () => {
          if (!a) {
            t.to(e.children, {
              autoAlpha: 1,
              y: 0,
              duration: 1.2,
              stagger: 0.2,
              ease: "back.out(1.7)",
            });
            return;
          }
          t.delayedCall(parseFloat(a), () => {
            t.to(e.children, {
              autoAlpha: 1,
              y: 0,
              duration: 1.2,
              stagger: 0.2,
              ease: "back.out(1.7)",
            });
          });
        },
      });
    });
  }
  function g() {
    y("#__nuxt", () => {
      c(), u(), d();
    });
  }
  return { initReveals: g };
}
export { h as u };
