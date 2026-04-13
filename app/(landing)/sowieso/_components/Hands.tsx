"use client";

/**
 * Stylised two-hands illustration reproducing the reference hero art.
 * SVG is inline so we can animate entry + fingertip joining.
 */
export function Hands({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1100 1088"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <defs>
        <linearGradient id="handLeft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff3b66" />
          <stop offset="60%" stopColor="#ff7a3d" />
          <stop offset="100%" stopColor="#ffb75a" />
        </linearGradient>
        <linearGradient id="handRight" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a33dff" />
          <stop offset="60%" stopColor="#ff3dc8" />
          <stop offset="100%" stopColor="#ff4a7a" />
        </linearGradient>
      </defs>

      {/* Left hand */}
      <path
        d="M60 470
           C80 380 140 330 200 340
           L270 210 C290 170 340 160 370 190 C395 215 395 255 370 300
           L340 360
           C360 330 400 270 440 250 C480 230 520 250 520 300
           L510 380
           C515 340 560 290 600 290 C640 290 660 330 655 380
           L640 480
           C645 440 680 410 720 430 C755 450 755 490 725 540
           L690 620
           C660 680 620 740 560 780
           L380 870
           C320 900 230 870 180 810
           L90 690
           C50 620 50 540 60 470 Z"
        fill="url(#handLeft)"
        stroke="#1d1c1c"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Right hand (mirror) */}
      <path
        d="M1040 470
           C1020 380 960 330 900 340
           L830 210 C810 170 760 160 730 190 C705 215 705 255 730 300
           L760 360
           C740 330 700 270 660 250 C620 230 580 250 580 300
           L590 380
           C585 340 540 290 500 290 C460 290 440 330 445 380
           L460 480
           C455 440 420 410 380 430 C345 450 345 490 375 540
           L410 620
           C440 680 480 740 540 780
           L720 870
           C780 900 870 870 920 810
           L1010 690
           C1050 620 1050 540 1040 470 Z"
        fill="url(#handRight)"
        stroke="#1d1c1c"
        strokeWidth="6"
        strokeLinejoin="round"
        transform="translate(0,0)"
      />

      {/* fingernail / highlight lines */}
      <g stroke="#1d1c1c" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M240 300 C260 320 270 340 265 380" />
        <path d="M380 270 C400 290 410 320 400 360" />
        <path d="M540 300 C560 320 570 345 560 390" />
        <path d="M690 330 C700 360 700 390 685 430" />
      </g>
      <g stroke="#1d1c1c" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M860 300 C840 320 830 340 835 380" />
        <path d="M720 270 C700 290 690 320 700 360" />
        <path d="M560 300 C540 320 530 345 540 390" />
        <path d="M410 330 C400 360 400 390 415 430" />
      </g>
    </svg>
  );
}
