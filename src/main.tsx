/**
 * @file
 * @date 2022-08-08
 * @author xuejie.he
 * @lastModify xuejie.he 2022-08-08
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useState } from "react";
import { comms } from ".";
import Item from "./item";
import { OptionProps } from "./unit";
import { useEffect } from "react";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC = () => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const [activeCode, setActiveCode] = useState<OptionProps[]>();

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/
    useEffect(() => {
        const list = comms.config.options ?? [];
        const arr = activeCode ?? [];

        const state: Record<string, "0" | "1"> = {};

        for (let i = 0; i < list.length; i++) {
            let status = false;
            const data = list[i];

            for (let j = 0; j < arr.length; ) {
                const item = arr[j];
                if (item.code === data.code) {
                    status = true;
                    j = arr.length;
                } else {
                    ++j;
                }
            }

            state[data.code] = status ? "1" : "0";
        }
        comms.state = state;
    }, [activeCode]);

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

    const list = comms.config.options ?? [];

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <div className="main">
            <div className="total">
                共<span className="totalValue">{list.length}</span>项
            </div>
            <div className="mainContainer">
                {list.map((item) => {
                    return (
                        <Item
                            data={{ ...item }}
                            key={item.code}
                            active={activeCode?.some((data) => data.code === item.code)}
                            onClick={() => handleClick(item)}
                        />
                    );
                })}
            </div>
        </div>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;
