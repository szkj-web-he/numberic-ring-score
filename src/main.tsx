/**
 * @file
 * @date 2022-08-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-08-08
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import { ColProps } from "Components/Col";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { comms } from ".";
import { Group } from "./Components/Group";
import JumpWrap from "./Components/JumpWrap";
import { Row } from "./Components/Row";
import { ScrollComponent } from "./Components/Scroll";
import { useMapOptions } from "./Hooks/useOptions";
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

    const colorList = useMemo(() => {
        const list = comms.config.options?.[1] ?? [];
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

    const [options, isMobile] = useMapOptions();

    const [state, setState] = useState(() => {
        const rows = comms.config.options?.[0] ?? [];
        const cols = comms.config.options?.[1] ?? [];
        const data: Record<string, Record<string, null | number>> = {};
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const colsData: Record<string, null | number> = {};
            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                colsData[col.code] = null;
            }
            data[row.code] = { ...colsData };
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

    const colList = (
        colGroup: (OptionProps & {
            span?: number | undefined;
        })[],
        index: number,
        rowCode: string,
    ): Array<React.ReactElement<ColProps>> => {
        return colGroup.map((item, n) => {
            return (
                <Item
                    data={{ ...item }}
                    key={item.code}
                    color={colorList[index * colGroup.length + n] as [number, number, number]}
                    score={state[rowCode][item.code] ?? 0}
                    setScore={(res) => {
                        setState((pre) => {
                            const data = { ...pre };
                            data[rowCode][item.code] = res;
                            return { ...data };
                        });
                    }}
                    span={item.span as 1}
                    mobileStatus={isMobile}
                />
            );
        });
    };

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    const rows = comms.config.options?.[0] ?? [];
    return (
        <JumpWrap className="mainScroll">
            <div className={`main`}>
                {rows.map((row, rowIndex) => {
                    return (
                        <Fragment key={row.code}>
                            <div
                                className="col_title"
                                dangerouslySetInnerHTML={{
                                    __html: row.content,
                                }}
                            />
                            {options.map((colGroup, colGroupIndex) => {
                                return (
                                    <Fragment key={rowIndex * options.length + colGroupIndex}>
                                        {/* <ScrollComponent
                                            hidden={{ y: true }}
                                            className="horizontalScroll"
                                            bodyClassName="horizontalScrollBody"
                                        > */}
                                        <Group index={rowIndex * options.length + colGroupIndex}>
                                            <Row>{colList(colGroup, colGroupIndex, row.code)}</Row>
                                        </Group>
                                        {/* </ScrollComponent> */}
                                        {colGroupIndex < options.length - 1 && !isMobile && (
                                            <div className="hr" />
                                        )}
                                    </Fragment>
                                );
                            })}
                            {rowIndex < rows.length - 1 && <div className="group_hr" />}
                        </Fragment>
                    );
                })}
            </div>
        </JumpWrap>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
