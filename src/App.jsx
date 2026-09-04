import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const pages = [
  "260903_01_CD_aouff.gif",
  "260903_02_CD_ha3xk.jpg",
  "260903_03_CD_wb086.gif",
  "260903_04_A_BE_C_ADS_paowq.jpg",
  "260903_05_C_DLNOPQ_ii1lz.gif",
  "260903_06_CD_hfzz1.gif",
  "260903_07_A_BDEFKQX_C_ACDGHLNOSW_t6foj.gif",
  "260903_08_J_SM_C_ACDEGHIKLMNPRSVW_t5hz8.gif",
  "260903_09_JJ_C_DS_7sa6f.gif",
  "260903_10_ALLxJR_C_FU_pvlef.gif",
  "260903_11_ALLxJR_C_FU_ya7bx.jpg",
  "260903_12_A_DEFKQX_J_SMJ_C_ACDGILPQSVWXY_rp31d.gif",
  "260903_13_CD_k57w7.gif",
  "260903_14_CD_jue4p.gif",
  "260903_15_AA_C_ADP_if4lv.jpg",
  "260903_16_C_ADES_bif46.gif",
  "260903_17_A_KQX_JJ_C_CDEGHIKLOQRSVWXY_qty28.jpg",
  "260903_18_C_ADEJW_28vuw.gif",
  "260903_19_CD_7mvd8.gif",
  "260903_20_CD_h55e7.gif",
  "260903_21_C_DLMNOR_xzqz8.gif",
  "260903_22_CD_hzahj.jpg",
].map((file, index) => ({
  id: `page-${index + 1}`,
  number: index + 1,
  src: `${import.meta.env.BASE_URL}flyer-pages/${file}`,
}));

const pageOneItems = [
  {
    title: "Publix Tea or Lemonade",
    description: "1-gallon bottle · Located in the deli",
  },
  {
    title: "Ribeye Steak",
    description: "USDA Choice beef · Bone-in, per lb",
  },
  {
    title: "Publix Red Seedless Watermelon Chunks",
    description: "Fresh-cut fruit · Ready to enjoy",
  },
  {
    title: "Apple Pie",
    description: "32–34 oz · From the Publix Bakery",
  },
  {
    title: "Publix St. Louis Style Pork Spareribs",
    description: "Frozen · Whole, in-the-bag",
  },
  {
    title: "12-Pack Coca-Cola Products",
    description: "12 oz cans · Select varieties",
  },
  {
    title: "Frito Lay Party Size Snacks",
    description: "8.25–17 oz · Select varieties",
  },
  {
    title: "24-Pack Yuengling Traditional Lager",
    description: "12 oz bottles or cans · Select varieties",
  },
];

const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2];
const accessPasswordHash = import.meta.env.VITE_SITE_PASSWORD_HASH;

async function hashPassword(password) {
  const encodedPassword = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", encodedPassword);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function itemsForPage(pageNumber) {
  if (pageNumber === 1) return pageOneItems;

  return Array.from(
    { length: 8 },
    (_, index) => ({
      title: `Featured product ${index + 1}`,
      description: `Size and offer details from weekly ad page ${pageNumber}`,
    }),
  );
}

function ItemPagination({ currentIndex, onMove, position }) {
  const isTop = position === "top";

  return (
    <nav
      className={`item-sheet__pagination item-sheet__pagination--${position}`}
      aria-label={`${isTop ? "Top" : "Bottom"} item list pagination`}
    >
      <button
        type="button"
        aria-label="Previous flyer page"
        disabled={currentIndex === 0}
        onClick={() => onMove(-1)}
      >
        <CaretLeft aria-hidden="true" />
      </button>
      <strong aria-live={isTop ? "polite" : undefined}>
        Page {currentIndex + 1} of {pages.length}
      </strong>
      <button
        type="button"
        aria-label="Next flyer page"
        disabled={currentIndex === pages.length - 1}
        onClick={() => onMove(1)}
      >
        <CaretRight aria-hidden="true" />
      </button>
    </nav>
  );
}

function WeeklyAd({ onClose }) {
  const dialogRef = useRef(null);
  const viewportRef = useRef(null);
  const itemSheetRef = useRef(null);
  const pageRefs = useRef([]);
  const activeIndexRef = useRef(0);
  const panStateRef = useRef(null);
  const suppressPageClickRef = useRef(false);
  const suppressPageClickTimerRef = useRef(null);
  const pageNavigationFrameRef = useRef(null);
  const navigationTargetRef = useRef(null);
  const navigationReleaseTimerRef = useRef(null);
  const zoomFrameRef = useRef(null);
  const isZoomingRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isHorizontal, setIsHorizontal] = useState(() =>
    window.matchMedia("(min-width: 900px)").matches,
  );
  activeIndexRef.current = selectedIndex;

  useLayoutEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const measure = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 900px)");
    const updateOrientation = () => setIsHorizontal(mediaQuery.matches);

    updateOrientation();
    mediaQuery.addEventListener("change", updateOrientation);
    return () => mediaQuery.removeEventListener("change", updateOrientation);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(suppressPageClickTimerRef.current);
      clearTimeout(navigationReleaseTimerRef.current);
      cancelAnimationFrame(pageNavigationFrameRef.current);
      cancelAnimationFrame(zoomFrameRef.current);
    },
    [],
  );

  const fitSize = isHorizontal
    ? Math.max(280, viewportSize.height - 112)
    : Math.max(280, viewportSize.width - 24);
  const pageSize = Math.round(fitSize * zoom);

  const cancelExplicitNavigation = useCallback(() => {
    navigationTargetRef.current = null;
    clearTimeout(navigationReleaseTimerRef.current);
  }, []);

  const holdExplicitNavigation = useCallback((index) => {
    navigationTargetRef.current = index;
    clearTimeout(navigationReleaseTimerRef.current);
    navigationReleaseTimerRef.current = setTimeout(() => {
      if (navigationTargetRef.current === index) {
        navigationTargetRef.current = null;
      }
    }, 1000);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    let animationFrame;
    const updateScrollProgress = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        if (isHorizontal) {
          const maxScroll = Math.max(
            1,
            viewport.scrollWidth - viewport.clientWidth,
          );
          setScrollProgress(viewport.scrollLeft / maxScroll);
        }

        const targetIndex = navigationTargetRef.current;
        const targetPage =
          targetIndex === null ? null : pageRefs.current[targetIndex];
        if (!targetPage) return;

        const maxScroll = isHorizontal
          ? Math.max(0, viewport.scrollWidth - viewport.clientWidth)
          : Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        const requestedPosition = isHorizontal
          ? targetPage.offsetLeft -
            (viewport.clientWidth - targetPage.offsetWidth) / 2
          : targetPage.offsetTop -
            (viewport.clientHeight - targetPage.offsetHeight) / 2;
        const targetPosition = Math.min(
          maxScroll,
          Math.max(0, requestedPosition),
        );
        const currentPosition = isHorizontal
          ? viewport.scrollLeft
          : viewport.scrollTop;

        if (Math.abs(currentPosition - targetPosition) <= 2) {
          cancelExplicitNavigation();
        }
      });
    };

    updateScrollProgress();
    viewport.addEventListener("scroll", updateScrollProgress, { passive: true });
    return () => {
      cancelAnimationFrame(animationFrame);
      viewport.removeEventListener("scroll", updateScrollProgress);
    };
  }, [cancelExplicitNavigation, isHorizontal, listOpen, pageSize, viewportSize.width]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const visibleRatios = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(entry.target.dataset.pageIndex);
          visibleRatios.set(index, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        if (
          isZoomingRef.current ||
          navigationTargetRef.current !== null
        ) {
          return;
        }
        if (
          window.matchMedia("(min-width: 900px)").matches !== isHorizontal
        ) {
          return;
        }

        let mostVisibleIndex = activeIndexRef.current;
        let highestRatio = -1;
        for (const [index, ratio] of visibleRatios) {
          if (ratio > highestRatio) {
            highestRatio = ratio;
            mostVisibleIndex = index;
          }
        }

        if (highestRatio > 0) {
          const currentRatio = visibleRatios.get(activeIndexRef.current) ?? 0;
          if (
            mostVisibleIndex !== activeIndexRef.current &&
            currentRatio > 0 &&
            highestRatio < currentRatio + 0.05
          ) {
            return;
          }

          activeIndexRef.current = mostVisibleIndex;
          setSelectedIndex(mostVisibleIndex);
        }
      },
      {
        root: viewport,
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    pageRefs.current.forEach((page) => page && observer.observe(page));
    return () => observer.disconnect();
  }, [isHorizontal, listOpen, pageSize]);

  const scrollPageIntoView = useCallback(
    (index, behaviorOverride) => {
      const viewport = viewportRef.current;
      const page = pageRefs.current[index];
      if (!viewport || !page) return;

      const behavior =
        behaviorOverride ??
        (window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth");

      if (isHorizontal) {
        viewport.scrollTo({
          left: page.offsetLeft - (viewport.clientWidth - page.offsetWidth) / 2,
          top: viewport.scrollTop,
          behavior,
        });
        return;
      }

      viewport.scrollTo({
        left: viewport.scrollLeft,
        top: page.offsetTop - (viewport.clientHeight - page.offsetHeight) / 2,
        behavior,
      });
    },
    [isHorizontal],
  );

  const centerPageAfterLayout = (index, behavior) => {
    holdExplicitNavigation(index);
    cancelAnimationFrame(pageNavigationFrameRef.current);
    pageNavigationFrameRef.current = requestAnimationFrame(() => {
      scrollPageIntoView(index, behavior);
    });
  };

  const moveViewerPage = useCallback(
    (direction) => {
      const nextIndex = Math.min(
        pages.length - 1,
        Math.max(0, selectedIndex + direction),
      );
      holdExplicitNavigation(nextIndex);
      activeIndexRef.current = nextIndex;
      setSelectedIndex(nextIndex);
      scrollPageIntoView(nextIndex);
    },
    [holdExplicitNavigation, scrollPageIntoView, selectedIndex],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (listOpen) {
          setListOpen(false);
        } else {
          onClose();
        }
        return;
      }

      if (
        !isHorizontal ||
        (event.key !== "ArrowLeft" && event.key !== "ArrowRight") ||
        event.target instanceof HTMLInputElement
      ) {
        return;
      }

      event.preventDefault();
      moveViewerPage(event.key === "ArrowRight" ? 1 : -1);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isHorizontal, listOpen, moveViewerPage, onClose]);

  const selectPage = (index, event) => {
    if (suppressPageClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressPageClickRef.current = false;
      return;
    }

    const shouldCloseList = listOpen && index === selectedIndex;
    activeIndexRef.current = index;
    setSelectedIndex(index);
    setListOpen(!shouldCloseList);
    centerPageAfterLayout(index);
  };

  const toggleList = () => {
    const indexToPreserve = activeIndexRef.current;
    setListOpen((open) => !open);
    centerPageAfterLayout(indexToPreserve, "auto");
  };

  const moveListPage = (direction) => {
    const nextIndex = Math.min(
      pages.length - 1,
      Math.max(0, selectedIndex + direction),
    );
    holdExplicitNavigation(nextIndex);
    activeIndexRef.current = nextIndex;
    setSelectedIndex(nextIndex);
    requestAnimationFrame(() => {
      itemSheetRef.current?.scrollTo({ top: 0, behavior: "auto" });
      scrollPageIntoView(nextIndex);
    });
  };

  const startPanning = (event) => {
    cancelExplicitNavigation();
    if (
      !isHorizontal ||
      event.pointerType === "touch" ||
      event.button !== 0
    ) {
      return;
    }

    const viewport = event.currentTarget;
    panStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: viewport.scrollLeft,
      startScrollTop: viewport.scrollTop,
      moved: false,
    };
  };

  const continuePanning = (event) => {
    const panState = panStateRef.current;
    if (!panState || panState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - panState.startX;
    const deltaY = event.clientY - panState.startY;

    if (!panState.moved && Math.hypot(deltaX, deltaY) < 6) return;

    if (!panState.moved) {
      panState.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsPanning(true);
    }

    event.preventDefault();
    event.currentTarget.scrollLeft = panState.startScrollLeft - deltaX;
    event.currentTarget.scrollTop = panState.startScrollTop - deltaY;
  };

  const stopPanning = (event) => {
    const panState = panStateRef.current;
    if (!panState || panState.pointerId !== event.pointerId) return;

    if (panState.moved) {
      suppressPageClickRef.current = true;
      clearTimeout(suppressPageClickTimerRef.current);
      suppressPageClickTimerRef.current = setTimeout(() => {
        suppressPageClickRef.current = false;
      }, 0);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    panStateRef.current = null;
    setIsPanning(false);
  };

  const scrubFlyer = (event) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    cancelExplicitNavigation();
    const nextProgress = Number(event.target.value) / 1000;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    setScrollProgress(nextProgress);
    viewport.scrollLeft = nextProgress * maxScroll;
  };

  const handleScrubberKeyDown = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveViewerPage(event.key === "ArrowRight" ? 1 : -1);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const nextIndex = event.key === "Home" ? 0 : pages.length - 1;
      holdExplicitNavigation(nextIndex);
      activeIndexRef.current = nextIndex;
      setSelectedIndex(nextIndex);
      scrollPageIntoView(nextIndex);
    }
  };

  const setZoomKeepingCenter = (nextZoom) => {
    const viewport = viewportRef.current;
    const anchorIndex = activeIndexRef.current;
    const anchorPage = pageRefs.current[anchorIndex];
    if (!viewport || !anchorPage || nextZoom === zoom) return;

    cancelExplicitNavigation();

    const focalX = Math.min(
      1,
      Math.max(
        0,
        (viewport.scrollLeft + viewport.clientWidth / 2 - anchorPage.offsetLeft) /
          Math.max(1, anchorPage.offsetWidth),
      ),
    );
    const focalY = Math.min(
      1,
      Math.max(
        0,
        (viewport.scrollTop + viewport.clientHeight / 2 - anchorPage.offsetTop) /
          Math.max(1, anchorPage.offsetHeight),
      ),
    );

    cancelAnimationFrame(zoomFrameRef.current);
    isZoomingRef.current = true;
    setZoom(nextZoom);
    zoomFrameRef.current = requestAnimationFrame(() => {
      zoomFrameRef.current = requestAnimationFrame(() => {
        const resizedPage = pageRefs.current[anchorIndex];
        if (!resizedPage) {
          isZoomingRef.current = false;
          return;
        }

        const nextLeft =
          resizedPage.offsetLeft +
          focalX * resizedPage.offsetWidth -
          viewport.clientWidth / 2;
        const nextTop =
          resizedPage.offsetTop +
          focalY * resizedPage.offsetHeight -
          viewport.clientHeight / 2;

        viewport.scrollTo({
          left: Math.min(
            Math.max(0, viewport.scrollWidth - viewport.clientWidth),
            Math.max(0, nextLeft),
          ),
          top: Math.min(
            Math.max(0, viewport.scrollHeight - viewport.clientHeight),
            Math.max(0, nextTop),
          ),
          behavior: "auto",
        });
        activeIndexRef.current = anchorIndex;
        setSelectedIndex(anchorIndex);

        zoomFrameRef.current = requestAnimationFrame(() => {
          isZoomingRef.current = false;
        });
      });
    });
  };

  const zoomIndex = zoomLevels.indexOf(zoom);
  const selectedPage = pages[selectedIndex];

  return (
    <section
      className="weekly-ad"
      role="dialog"
      aria-modal="true"
      aria-label="Weekly ad"
      ref={dialogRef}
      tabIndex={-1}
    >
      <header className="weekly-ad__header">
        <div className="weekly-ad__identity">
          <strong>Weekly Ad</strong>
          <span>Sep 2–8</span>
        </div>
        <button className="header-close" type="button" onClick={onClose}>
          <span>Close</span>
          <X aria-hidden="true" weight="regular" />
        </button>
      </header>

      <div className={`weekly-ad__body${listOpen ? " is-list-open" : ""}`}>
        <div
          className={`flyer-viewport${
            isHorizontal ? " is-pan-enabled" : ""
          }${isPanning ? " is-panning" : ""}`}
          id="flyer-page-scroll"
          ref={viewportRef}
          tabIndex={0}
          onPointerDown={startPanning}
          onPointerMove={continuePanning}
          onPointerUp={stopPanning}
          onPointerCancel={stopPanning}
          onWheel={cancelExplicitNavigation}
          aria-label={
            isHorizontal
              ? "Weekly ad pages. Scroll horizontally or drag to pan."
              : "Weekly ad pages. Scroll vertically."
          }
        >
          <div className="flyer-track">
            {pages.map((page, index) => (
              <button
                className="flyer-page"
                data-page-index={index}
                key={page.id}
                onClick={(event) => selectPage(index, event)}
                ref={(node) => {
                  pageRefs.current[index] = node;
                }}
                style={{ inlineSize: `${pageSize}px` }}
                type="button"
                aria-label={
                  listOpen && index === selectedIndex
                    ? `Close item list for flyer page ${page.number}`
                    : `Show item list for flyer page ${page.number}`
                }
              >
                <img
                  src={page.src}
                  alt={`Weekly ad page ${page.number}`}
                  loading={index < 2 ? "eager" : "lazy"}
                  draggable="false"
                />
              </button>
            ))}
          </div>
        </div>

        {isHorizontal && (
          <>
            <button
              className="page-edge-control page-edge-control--previous"
              type="button"
              aria-label="Previous flyer page"
              aria-controls="flyer-page-scroll"
              disabled={selectedIndex === 0}
              onClick={() => moveViewerPage(-1)}
            >
              <CaretLeft aria-hidden="true" />
            </button>
            <button
              className="page-edge-control page-edge-control--next"
              type="button"
              aria-label="Next flyer page"
              aria-controls="flyer-page-scroll"
              disabled={selectedIndex === pages.length - 1}
              onClick={() => moveViewerPage(1)}
            >
              <CaretRight aria-hidden="true" />
            </button>
          </>
        )}

        <div className="viewer-actions" aria-label="Flyer controls">
          <div className="zoom-controls" role="group" aria-label="Zoom controls">
            <button
              type="button"
              aria-label="Zoom out"
              disabled={zoomIndex === 0}
              onClick={() => setZoomKeepingCenter(zoomLevels[zoomIndex - 1])}
            >
              −
            </button>
            <button type="button" onClick={() => setZoomKeepingCenter(1)}>
              Fit
            </button>
            <button
              type="button"
              aria-label="Zoom in"
              disabled={zoomIndex === zoomLevels.length - 1}
              onClick={() => setZoomKeepingCenter(zoomLevels[zoomIndex + 1])}
            >
              +
            </button>
            <output aria-live="polite">{Math.round(zoom * 100)}%</output>
          </div>

          {isHorizontal && (
            <div className="page-scrubber">
              <input
                className="page-scrubber__input"
                type="range"
                min="0"
                max="1000"
                value={Math.round(scrollProgress * 1000)}
                onInput={scrubFlyer}
                onKeyDown={handleScrubberKeyDown}
                aria-label="Flyer page position"
                aria-valuetext={`Page ${selectedPage.number} of ${pages.length}`}
                aria-controls="flyer-page-scroll"
              />
              <div
                className="page-scrubber__rail"
                aria-hidden="true"
                style={{
                  "--scroll-progress": `${scrollProgress * 100}%`,
                }}
              >
                <strong
                  className="page-scrubber__thumb"
                  style={{
                    left: `${scrollProgress * 100}%`,
                    transform: `translate(-${scrollProgress * 100}%, -50%)`,
                  }}
                >
                  Page {selectedPage.number} of {pages.length}
                </strong>
              </div>
            </div>
          )}

          <button
            className="list-toggle"
            type="button"
            onClick={toggleList}
            aria-expanded={listOpen}
            aria-controls="page-item-list"
          >
            {listOpen ? "Close list" : "Show list"}
          </button>
        </div>

        {listOpen && (
          <aside
            className="item-sheet"
            id="page-item-list"
            aria-label={`Items on flyer page ${selectedPage.number}`}
            ref={itemSheetRef}
          >
            <ItemPagination
              currentIndex={selectedIndex}
              onMove={moveListPage}
              position="top"
            />

            <ul className="item-list">
              {itemsForPage(selectedPage.number).map((item, index) => (
                <li className="item-list__product" key={item.title}>
                  <img
                    className="item-list__image"
                    src={selectedPage.src}
                    alt=""
                    loading="lazy"
                    style={{
                      objectPosition: `${20 + (index % 3) * 30}% ${
                        18 + (index % 4) * 22
                      }%`,
                    }}
                  />
                  <div className="item-list__details">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                </li>
              ))}
            </ul>

            <ItemPagination
              currentIndex={selectedIndex}
              onMove={moveListPage}
              position="bottom"
            />
          </aside>
        )}
      </div>
    </section>
  );
}

function Prototype() {
  const [flyerOpen, setFlyerOpen] = useState(false);
  const triggerRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("flyer-is-open", flyerOpen);
    return () => document.body.classList.remove("flyer-is-open");
  }, [flyerOpen]);

  const closeFlyer = useCallback(() => {
    setFlyerOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  return (
    <main className="prototype-page">
      <section
        className="prototype-intro"
        inert={flyerOpen}
        aria-hidden={flyerOpen}
      >
        <p>Weekly ad navigation prototype</p>
        <h1>Explore this week’s flyer</h1>
        <button
          className="open-flyer"
          type="button"
          ref={triggerRef}
          onClick={() => setFlyerOpen(true)}
        >
          Open weekly ad
        </button>
      </section>

      {flyerOpen && <WeeklyAd onClose={closeFlyer} />}
    </main>
  );
}

export function App() {
  const [hasAccess, setHasAccess] = useState(
    () => sessionStorage.getItem("weekly-ad-prototype-access") === "granted",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  if (hasAccess) return <Prototype />;

  const unlockPrototype = async (event) => {
    event.preventDefault();
    setError("");

    if (!accessPasswordHash) {
      setError("This preview does not have an access passphrase configured.");
      return;
    }

    setIsChecking(true);
    const submittedHash = await hashPassword(password);
    setIsChecking(false);

    if (submittedHash !== accessPasswordHash) {
      setError("That passphrase is not correct.");
      return;
    }

    sessionStorage.setItem("weekly-ad-prototype-access", "granted");
    setPassword("");
    setHasAccess(true);
  };

  return (
    <main className="access-gate">
      <form className="access-gate__card" onSubmit={unlockPrototype}>
        <p>Protected prototype</p>
        <h1>Weekly ad navigation</h1>
        <label htmlFor="prototype-password">Passphrase</label>
        <input
          id="prototype-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          autoFocus
          required
        />
        {error && (
          <p className="access-gate__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={isChecking}>
          {isChecking ? "Checking…" : "View prototype"}
        </button>
      </form>
    </main>
  );
}
