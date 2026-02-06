(() => {
  const section = document.querySelector(".cars-section");
  if (!section) return;

  const svg = section.querySelector(".connectors");
  const paths = Array.from(section.querySelectorAll(".connector"));
  const triggers = Array.from(section.querySelectorAll(".line-trigger"));

  const nextSelector = section.dataset.next;
  const nextSection = nextSelector ? document.querySelector(nextSelector) : null;

  const isMobile = () => window.matchMedia("(max-width: 600px)").matches;

  function rectRel(el) {
    const r = el.getBoundingClientRect();
    const s = section.getBoundingClientRect();
    return {
      left: r.left - s.left,
      top: r.top - s.top,
      right: r.right - s.left,
      bottom: r.bottom - s.top,
      width: r.width,
      height: r.height
    };
  }

  function setViewBox() {
    const s = section.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${s.width} ${s.height}`);
  }

  function getCards() {
    const c1 = section.querySelector(".porsche .car-content, .porsche .car-content-ferrari");
    const c2 = section.querySelector(".ferrari .car-content, .ferrari .car-content-ferrari");
    const c3 = section.querySelector(".lamborghini .car-content, .lamborghini .car-content-ferrari");
    return [c1, c2, c3].filter(Boolean);
  }

  function prepareDash(p) {
    const len = p.getTotalLength();
    p.style.strokeDasharray = String(len);
    p.style.strokeDashoffset = String(len);
    p.dataset.len = String(len);
  }

  /* DESKTOP: zig-zag lateral */
  function pathFromSideToTopDrop(fromRect, toRect, fromSide) {
    const exitPad = 20;
    const gapTop = 28;

    const startY = fromRect.top + fromRect.height / 2;
    const startX = fromSide === "right" ? fromRect.right : fromRect.left;
    const outX = fromSide === "right" ? startX + exitPad : startX - exitPad;

    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top;
    const aboveY = endY - gapTop;

    return `M ${startX} ${startY}
            L ${outX} ${startY}
            L ${endX} ${startY}
            L ${endX} ${aboveY}
            L ${endX} ${endY}`;
  }

  function pathDownToNext(fromRect, nextTopRel, sectionWidth) {
    const exitPad = 20;
    const startX = fromRect.right;
    const startY = fromRect.top + fromRect.height / 2;

    const railX = Math.min(sectionWidth - 40, startX + 260);
    const endY = Math.max(startY + 40, nextTopRel);

    return `M ${startX} ${startY}
            L ${startX + exitPad} ${startY}
            L ${railX} ${startY}
            L ${railX} ${endY}`;
  }

  /* MOBILE: conexão vertical central */
  function pathVerticalConnect(fromRect, toRect) {
    const x1 = fromRect.left + fromRect.width / 2;
    const x2 = toRect.left + toRect.width / 2;

    const startY = fromRect.bottom; // encosta no card de cima
    const endY = toRect.top;      // encosta no card de baixo

    return `M ${x1} ${startY}
          L ${x1} ${endY}
          L ${x2} ${endY}`;
  }


  function pathVerticalToNext(fromRect, nextTopRel) {
    const x = fromRect.left + fromRect.width / 2;

    const startY = fromRect.bottom;

    // arredonda para cima e força overlap para encostar sempre
    const endY = Math.ceil(nextTopRel) + 4;

    return `M ${x} ${startY}
          L ${x} ${endY}`;
  }



  function recalc() {
    const cards = getCards();
    if (cards.length < 3) return;

    setViewBox();

    const [r1, r2, r3] = cards.map(rectRel);
    const sRect = section.getBoundingClientRect();

    let nextTopRel = sRect.height;
    if (nextSection) {
      const n = nextSection.getBoundingClientRect();
      nextTopRel = (n.top - sRect.top);
    }

    if (isMobile()) {
      // 3 conexões verticais: 1->2, 2->3, 3->next
      paths[0].setAttribute("d", pathVerticalConnect(r1, r2));
      paths[1].setAttribute("d", pathVerticalConnect(r2, r3));
      paths[2].setAttribute("d", pathVerticalToNext(r3, nextTopRel));
    } else {
      // desktop zig-zag
      paths[0].setAttribute("d", pathFromSideToTopDrop(r1, r2, "right"));
      paths[1].setAttribute("d", pathFromSideToTopDrop(r2, r3, "left"));
      paths[2].setAttribute("d", pathDownToNext(r3, nextTopRel, sRect.width));
    }

    paths.forEach(prepareDash);
  }

  function playStep(step) {
    const p = paths.find(x => x.dataset.step === String(step));
    if (!p || p.classList.contains("is-playing")) return;

    p.classList.remove("is-playing");
    void p.getBoundingClientRect();
    p.classList.add("is-playing");
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        playStep(e.target.dataset.fire);
      }
    });
  }, {
    root: null,
    threshold: 0,
    rootMargin: "-35% 0px -35% 0px"
  });

  triggers.forEach(t => io.observe(t));

  function onResize() {
    recalc();
    // mantém as linhas já tocadas visíveis após resize
    paths.forEach(p => {
      if (p.classList.contains("is-playing")) {
        p.style.strokeDashoffset = "0";
      }
    });
  }

  window.addEventListener("resize", onResize);
  window.addEventListener("load", recalc);

  recalc();
})();
