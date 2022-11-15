/**
 * @file
 * @date 2022-08-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-08-08
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import { Group } from "./Components/Group";
import JumpWrap from "./Components/JumpWrap";
import { ScrollComponent } from "./Components/Scroll";
import { useMapOptions } from "./Hooks/useOptions";
import { comms } from ".";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Row } from "./Components/Row";
import Item from "./item";
import { OptionProps } from "./type";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC = () => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const [activeCode, setActiveCode] = useState<OptionProps[]>();

    const [options, isMobile] = useMapOptions();

    const colorList = useMemo(() => {
        const list = comms.config.options ?? [];
        let r = Math.round(Math.random() * 245 + 10);
        let g = Math.round(Math.random() * 150 + 100);
        let b = Math.round(Math.random() * 150);

        let increment = 10;
        return list.map(() => {
            const rgb = [r, g, b];

            const copyR = r;
            r = g;
            g = b;
            b = copyR;
            if (r + increment < 250 && r + increment > 10) {
                r += increment;
                return rgb;
            }

            if (g + increment < 200 && g + increment > 100) {
                g += increment;
                return rgb;
            }

            if (b + increment < 150 && b > 0) {
                b += increment;
                return rgb;
            }

            const copyB = b;
            b = g;
            g = copyB;
            increment = -10;

            rgb[1] = g;
            rgb[2] = b;

            return rgb;
        });
    }, []);

    const [state, setState] = useState(() => {
        const arr = comms.config.options ?? [];
        const data: Record<string, null | number> = {};
        for (let i = 0; i < arr.length; i++) {
            data[arr[i].code] = null;
        }
        return data;
    });

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useEffect(() => {
        comms.state = state;
    }, [state]);

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    const handleClick = (item: OptionProps) => {
        setActiveCode((pre) => {
            const arr = pre ? [...pre] : [];
            let n = -1;
            for (let i = 0; i < arr.length; ) {
                if (arr[i].code === item.code) {
                    n = i;
                    i = arr.length;
                } else {
                    ++i;
                }
            }

            if (n >= 0) {
                arr.splice(n, 1);
            } else {
                arr.push({ ...item });
            }
            return [...arr];
        });
    };

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <JumpWrap className="mainScroll">
            <ScrollComponent
                hidden={{ y: true }}
                className="horizontalScroll"
                bodyClassName="horizontalScrollBody"
            >
                <div className={`main${isMobile ? " mobile" : ""}`}>
                    {options.map((items, index) => {
                        return (
                            <Fragment key={index}>
                                <Group index={index} className={isMobile ? "optionsRow" : ""}>
                                    <Row>
                                        {items.map((item, n) => {
                                            return (
                                                <Item
                                                    data={{ ...item }}
                                                    key={item.code}
                                                    active={activeCode?.some(
                                                        (data) => data.code === item.code,
                                                    )}
                                                    color={
                                                        colorList[index * items.length + n] as [
                                                            number,
                                                            number,
                                                            number,
                                                        ]
                                                    }
                                                    score={state[item.code] ?? 0}
                                                    setScore={(res) => {
                                                        setState((pre) => {
                                                            const data = { ...pre };
                                                            data[item.code] = res;
                                                            return { ...data };
                                                        });
                                                    }}
                                                    onClick={() => handleClick(item)}
                                                    span={item.span as 1}
                                                    mobileStatus={isMobile}
                                                />
                                            );
                                        })}
                                    </Row>
                                </Group>
                                {index < options.length - 1 && !isMobile && <div className="hr" />}
                            </Fragment>
                        );
                    })}
                </div>
            </ScrollComponent>
        </JumpWrap>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
