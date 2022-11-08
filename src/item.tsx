/**
 * @file
 * @date 2022-08-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-08-08
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useRef } from "react";
import { OptionProps } from "./type";
import { Col } from "./Components/Col";
import { isMobile } from "./isMobile";
import { useEffect } from "react";
import { drawRadian, drawRing, getAngle, getScrollValue } from "unit";
import { useMemo } from "react";
import { useState } from "react";

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
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ data, active, onClick, span, mobileStatus, color }) => {
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

    const [score, setScore] = useState(0);

    const [moveScore, setMoveScore] = useState(0);

    const [mouseStatus, setMouseStatus] = useState(false);

    const timer = useRef<number>();

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

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

            drawRing(ctx, borderWidth);
        };
        window.addEventListener("resize", draw);
        draw();
        return () => {
            window.removeEventListener("resize", draw);
        };
    }, [borderWidth]);

    useEffect(() => {
        return () => {
            timer.current && window.clearTimeout(timer.current);
        };
    }, []);
    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        timer.current && window.clearTimeout(timer.current);

        const el = e.currentTarget;
        const size = el.offsetWidth;
        timer.current = window.setTimeout(() => {
            const rect = el.getBoundingClientRect();
            const scrollData = getScrollValue();
            const left = e.pageX - (rect.left + scrollData.x);
            const top = e.pageY - (rect.top + scrollData.y);
            const r = size / 2 - 5;
            const value = getAngle(size / 2, size / 2, r, left, top);

            drawRadian(el, borderWidth, value, `rgba(${color.join(",")},0.3)`);
            setMoveScore(Math.round(value * 100));
        });
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {};

    const handleMouseEnter = () => {
        setMouseStatus(true);
        timer.current && window.clearTimeout(timer.current);
    };

    const handleMouseLeave = () => {
        timer.current && window.clearTimeout(timer.current);
        setMouseStatus(false);
        const c = ref.current;
        if (!c) {
            return;
        }

        drawRadian(c, borderWidth, score / 100, `rgb(${color.join(",")})`);
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const el = e.currentTarget;

        const size = el.offsetWidth;

        const rect = el.getBoundingClientRect();
        const scrollData = getScrollValue();
        const left = e.pageX - (rect.left + scrollData.x);
        const top = e.pageY - (rect.top + scrollData.y);
        const r = size / 2 - 5;
        const value = getAngle(size / 2, size / 2, r, left, top);

        drawRadian(el, borderWidth, value, `rgb(${color.join(",")})`);
        setScore(Math.round(value * 100));
    };

    // const handleClick = () => {
    //     const mobileStatus = isMobile();
    //     if (mobileStatus) {
    //         return;
    //     }
    //     onClick();
    // };

    // const handleTouchStart = () => {
    //     const mobileStatus = isMobile();
    //     if (!mobileStatus) {
    //         return;
    //     }
    //     touchStart.current = true;
    //     touchMove.current = false;
    // };

    // const handleTouchMove = () => {
    //     const mobileStatus = isMobile();
    //     if (!mobileStatus) {
    //         return;
    //     }
    //     touchMove.current = true;
    // };

    // const handleTouchEnd = () => {
    //     if (touchMove.current) {
    //         return;
    //     }

    //     if (!touchStart.current) {
    //         return;
    //     }
    //     onClick();
    // };
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
                    // onTouchMove={handleTouchMove}
                />
                <span className={`item_value`}>{mouseStatus ? moveScore : score}</span>
            </div>

            <div className="item_name" dangerouslySetInnerHTML={{ __html: data.content }} />
        </Col>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
