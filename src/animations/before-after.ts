import { Draggable } from "gsap/Draggable";
import { gsap, MOTION_OK, registerGsapPlugins } from "./gsap";

type SliderCleanup = {
  draggables: Draggable[];
  inputs: Array<{ el: HTMLInputElement; handler: () => void }>;
};

export function initBeforeAfterSliders(): () => void {
  registerGsapPlugins();

  const cleanups: SliderCleanup[] = [];

  if (typeof window === "undefined") return () => {};
  if (!window.matchMedia(MOTION_OK).matches) return () => {};

  document
    .querySelectorAll<HTMLElement>("[data-before-after]")
    .forEach((root) => {
      const handle = root.querySelector<HTMLElement>("[data-ba-handle]");
      const overlay = root.querySelector<HTMLElement>("[data-ba-overlay]");
      const input = root.querySelector<HTMLInputElement>("[data-ba-input]");
      if (!handle || !overlay || !input) return;

      const frame =
        root.querySelector<HTMLElement>(".case-slider__frame") ?? root;

      const update = (pct: number) => {
        const clamped = Math.max(0, Math.min(100, pct));
        overlay.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
        handle.style.left = `${clamped}%`;
        input.value = String(clamped);
      };

      update(Number(input.value) || 50);

      const instances = Draggable.create(handle, {
        type: "x",
        bounds: frame,
        onDrag() {
          const rect = frame.getBoundingClientRect();
          if (rect.width <= 0) return;
          const handleRect = handle.getBoundingClientRect();
          const centerX = handleRect.left + handleRect.width / 2 - rect.left;
          const pct = (centerX / rect.width) * 100;
          update(pct);
        },
        onDragEnd() {
          gsap.set(handle, { x: 0 });
        },
      });

      const onInput = () => update(Number(input.value));
      input.addEventListener("input", onInput);
      cleanups.push({ draggables: instances, inputs: [{ el: input, handler: onInput }] });
    });

  return () => {
    cleanups.forEach(({ draggables, inputs }) => {
      draggables.forEach((d) => d.kill());
      inputs.forEach(({ el, handler }) => el.removeEventListener("input", handler));
    });
  };
}
