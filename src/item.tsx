/**
 * @file
 * @date 2022-08-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-08-08
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { drawBar, drawRadian, drawRing, getAngle, getScrollValue, marginValue } from "unit";
import { Col } from "./Components/Col";
import { OptionProps } from "./type";
import { getScrollValue } from "unit";

/* 
<------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
interface TempProps {
    data: OptionProps;

    active?: boolean;

    onClick: () => void;

    span: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

    mobileStatus: boolean;

    color: [number, number, number];

    score: number;

    setScore: (res: number) => void;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({
    data,
    active,
    score,
    setScore,
    span,
    mobileStatus,
    color,
}) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const ref = useRef<HTMLCanvasElement | null>(null);

    const c2d = useRef<CanvasRenderingContext2D | null>(null);

    const borderWidth = useMemo(() => {
        if (span === 3) {
            return 15;
        }
        if (span === 2 && mobileStatus) {
            return 12;
        }
        return 16;
    }, [mobileStatus, span]);

    const [moveScore, setMoveScore] = useState(0);

    const [mouseStatus, setMouseStatus] = useState(false);

    const timer = useRef<number>();

    const scoreRef = useRef(score);

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useLayoutEffect(() => {
        scoreRef.current = score;
    }, [score]);

    useEffect(() => {
        const draw = () => {
            if (c2d.current) {
                c2d.current.clearRect(0, 0, c2d.current.canvas.width, c2d.current.canvas.height);
            }
            const c = ref.current;
            if (!c) {
                return;
            }
            const parent = c.parentElement?.parentElement;
            if (!parent) {
                return;
            }

            const rect = parent.getBoundingClientRect();
            c.width = rect.width;
            c.height = rect.width;
            const ctx = (c2d.current = c.getContext("2d"));
            if (!ctx) {
                return;
            }
            if (scoreRef.current > 0) {
                drawRadian(c, borderWidth, scoreRef.current / 100, `rgb(${color.join(",")})`);
            } else {
                drawRing(ctx, borderWidth);
            }
            drawBar(c, borderWidth, scoreRef.current / 100);
        };
        window.addEventListener("resize", draw);
        draw();
        return () => {
            window.removeEventListener("resize", draw);
        };
    }, [borderWidth, color]);

    useEffect(() => {
        return () => {
            timer.current && window.clearTimeout(timer.current);
        };
    }, []);
    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    /**
     * 预设值
     */
    const preset = (el: HTMLCanvasElement, x: number, y: number) => {
        timer.current && window.clearTimeout(timer.current);
        const size = el.offsetWidth;
        timer.current = window.setTimeout(() => {
            const rect = el.getBoundingClientRect();
            const scrollData = getScrollValue();
            const left = x - (rect.left + scrollData.x);
            const top = y - (rect.top + scrollData.y);
            const r = size / 2 - 5;
            const value = getAngle(size / 2, size / 2, r, left, top);

            drawRadian(el, borderWidth, value, `rgba(${color.join(",")},0.3)`);
            setMoveScore(Math.round(value * 100));
        });
    };

    /**
     * 开始预设
     */
    const startPreset = () => {
        timer.current && window.clearTimeout(timer.current);
        setMouseStatus(true);
    };

    /**
     * 还原
     */
    const reset = () => {
        timer.current && window.clearTimeout(timer.current);

        const c = ref.current;
        if (!c) {
            return;
        }

        const ctx = c.getContext("2d");
        if (!ctx) {
            return;
        }

        if (score > 0) {
            drawRadian(c, borderWidth, score / 100, `rgb(${color.join(",")})`);
        } else {
            drawRing(ctx, borderWidth);
        }
        drawBar(c, borderWidth, score / 100);
    };
    /**
     * 确认值
     */
    const confirm = (el: HTMLCanvasElement, x: number, y: number) => {
        const size = el.offsetWidth;

        const rect = el.getBoundingClientRect();
        const scrollData = getScrollValue();
        const left = x - (rect.left + scrollData.x);
        const top = y - (rect.top + scrollData.y);
        const r = size / 2 - 5;
        const value = getAngle(size / 2, size / 2, r, left, top);

        drawRadian(el, borderWidth, value, `rgb(${color.join(",")})`);
        drawBar(el, borderWidth, value);
        setScore(Math.round(value * 100));
    };

    /**
     * 在圆环上移动时
     */
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mobileStatus) {
            return;
        }
        preset(e.currentTarget, e.pageX, e.pageY);
    };

    /**
     * touch move
     * @param e
     */
    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        preset(e.currentTarget, e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    };
    /**
     * touch cancel
     */
    const handleTouchCancel = () => {
        handleMouseLeave();
    };
    /**
     * touch end
     * @param e
     */
    const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {};

    /**
     * touch start
     * @param e
     */
    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        const position = e.changedTouches[0];
        const scrollData = getScrollValue();
        const x = position.pageX;
        const y = position.pageY;

        const el = e.currentTarget;
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

        if (d > r || d < r - borderWidth) {
            return;
        }
        e.preventDefault();

        startPreset();
    };

    /**
     * 移入圆环时
     */
    const handleMouseEnter = () => {
        if (mobileStatus) {
            return;
        }
        startPreset();
    };

    /**
     * 离开圆环时
     */
    const handleMouseLeave = () => {
        if (mobileStatus) {
            return;
        }

        setMouseStatus(false);
        reset();
    };

    /**
     * 点击圆环确定时
     */
    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const el = e.currentTarget;
        confirm(el, e.pageX, e.pageY);
    };

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <Col className={`item${active ? " active" : ""}`} span={span}>
            <div className={`item_content`}>
                <canvas
                    ref={ref}
                    className={"item_canvas"}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                    onTouchCancel={handleTouchCancel}
                    onTouchEnd={handleTouchEnd}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                />
                <span className={`item_value`}>{mouseStatus ? moveScore : score}</span>
            </div>

            <div className="item_name" dangerouslySetInnerHTML={{ __html: data.content }} />
        </Col>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
