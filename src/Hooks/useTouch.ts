import React, { useEffect, useLayoutEffect, useRef } from "react";
import { drawBar, drawRadian, getAngle, getScrollValue, marginValue } from "unit";
import { useMobile } from "./../Components/Scroll/Unit/useMobile";

export const useTouch = (
    borderWidth: number,
    color: [number, number, number],
    setMoveScore: React.Dispatch<React.SetStateAction<number>>,
    setMoveStatus: (status: boolean) => void,
    timer: React.MutableRefObject<number | undefined>,
    setScore: (res: number) => void,
    reset: () => void,
): React.MutableRefObject<HTMLCanvasElement | null> => {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const mobileStatus = useMobile();
    const destroy = useRef(false);

    const resetRef = useRef(reset);
    const setMoveScoreRef = useRef(setMoveScore);

    const setMoveStatusRef = useRef(setMoveStatus);
    const setScoreRef = useRef(setScore);

    useEffect(() => {
        destroy.current = false;
        return () => {
            destroy.current = true;
        };
    }, []);

    useLayoutEffect(() => {
        resetRef.current = reset;
    }, [reset]);

    useLayoutEffect(() => {
        setMoveScoreRef.current = setMoveScore;
    }, [setMoveScore]);

    useLayoutEffect(() => {
        setMoveStatusRef.current = setMoveStatus;
    }, [setMoveStatus]);

    useLayoutEffect(() => {
        setScoreRef.current = setScore;
    }, [setScore]);

    useLayoutEffect(() => {
        const node = ref.current;
        const options: AddEventListenerOptions = {
            passive: false,
            capture: true,
        };

        const removeHandle = () => {
            document.removeEventListener("touchmove", handleTouchMove, options);
            document.removeEventListener("touchend", handleTouchEnd, options);
            document.removeEventListener("touchcancel", handleTouchCancel, options);
            if (!node) {
                return;
            }
            node.removeAttribute("style");
        };

        /**
         * 画
         */
        const draw = (x: number, y: number) => {
            if (!node) {
                return;
            }
            const size = node.offsetWidth;
            const rect = node.getBoundingClientRect();
            const scrollData = getScrollValue();
            const left = x - (rect.left + scrollData.x);
            const top = y - (rect.top + scrollData.y);
            const r = size / 2 - 5;
            const value = getAngle(size / 2, size / 2, r, left, top);

            drawRadian(node, borderWidth, value, `rgba(${color.join(",")},0.3)`);

            setMoveScoreRef.current(Math.round(value * 100));
        };

        /**
         * touchmove
         */
        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            timer.current && window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => {
                if (!ref.current || destroy.current) {
                    return;
                }
                draw(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
            });
        };

        /**
         * touchend
         * @param e
         * @returns
         */
        const handleTouchEnd = (e: TouchEvent) => {
            timer.current && window.clearTimeout(timer.current);
            removeHandle();

            if (!node) {
                return;
            }

            const size = node.offsetWidth;

            const rect = node.getBoundingClientRect();
            const scrollData = getScrollValue();
            const left = e.changedTouches[0].pageX - (rect.left + scrollData.x);
            const top = e.changedTouches[0].pageY - (rect.top + scrollData.y);
            const r = size / 2 - 5;
            const value = getAngle(size / 2, size / 2, r, left, top);

            drawRadian(node, borderWidth, value, `rgb(${color.join(",")})`);
            drawBar(node, borderWidth, value);
            setScoreRef.current(Math.round(value * 100));
        };

        const handleTouchCancel = () => {
            removeHandle();
            setMoveStatusRef.current(false);

            resetRef.current();
        };

        /**
         * 开始触摸
         */
        const handleTouchStart = (e: TouchEvent) => {
            if (!e.cancelable) {
                return true;
            }

            const position = e.changedTouches[0];
            const scrollData = getScrollValue();
            const x = position.pageX;
            const y = position.pageY;

            const el = e.currentTarget as HTMLCanvasElement;
            if (!el) {
                return;
            }
            const rect = el.getBoundingClientRect();
            const offsetX = x - (rect.left + scrollData.x);
            const offsetY = y - (rect.top + scrollData.y);
            const ctx = el.getContext("2d");
            if (!ctx) {
                return;
            }

            const { width, height } = ctx.canvas;

            const r = width / 2 - marginValue();

            const [rx, ry] = [width / 2, height / 2];

            const d = Math.sqrt((ry - offsetY) ** 2 + (rx - offsetX) ** 2);

            /**
             * 判断触摸的点位是否在圆环上
             * 扩大5的容差值
             */

            if (d > r + 3 || d < r - borderWidth - 3) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();

            el.style.touchAction = "none";

            timer.current && window.clearTimeout(timer.current);
            setMoveStatusRef.current(true);
            draw(e.targetTouches[0].pageX, e.targetTouches[0].pageY);

            document.addEventListener("touchmove", handleTouchMove, options);
            document.addEventListener("touchend", handleTouchEnd, options);
            document.addEventListener("touchcancel", handleTouchCancel, options);
        };

        if (mobileStatus) {
            node?.addEventListener("touchstart", handleTouchStart, options);
        }

        return () => {
            node?.removeEventListener("touchstart", handleTouchStart, options);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [borderWidth, color, mobileStatus]);

    return ref;
};