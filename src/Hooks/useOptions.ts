/**
import { useState } from 'react';
 * 监听是否切换成了小屏幕
 * 如果是小于700
 * 就一题一行
 * 如果不是
 * 就一提多行
 */

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { OptionProps } from "../type";
import { comms } from "..";
import { deepCloneData } from "unit";

export const isMobile = (): boolean => window.matchMedia("(any-pointer:coarse)").matches;

export const SplitCols = (): number => {
    const { offsetWidth } = document.documentElement;
    if (offsetWidth >= 1030) {
        return 6;
    }
    if (offsetWidth >= 656) {
        return 4;
    }
    return 2;
};

export const useMapOptions = (): [Array<Array<OptionProps & { span?: number }>>, boolean] => {
    const [cols, setCols] = useState(SplitCols);

    const [mobileStatus, setMobileStatus] = useState(isMobile());

    useEffect(() => {
        const fn = () => {
            setCols(SplitCols());
            setMobileStatus(isMobile());
        };
        window.addEventListener("resize", fn);
        return () => {
            window.removeEventListener("resize", fn);
        };
    }, []);

    const list = useMemo(() => {
        const arr = comms.config.options ?? [];

        const list: Array<Array<OptionProps & { span: number }>> = [];
        let index = 0;

        const span = cols === 4 ? 3 : 2;

        for (let i = 0; i < arr.length; i++) {
            const item = deepCloneData(arr[i]);

            if (i === 0) {
                list[index] = [{ ...item, span }];
            } else {
                list[index].push({ ...item, span });
                if (!(i % cols)) {
                    ++index;
                    list[index] = [];
                }
            }
        }
        return list;
    }, [cols]);

    return [list, mobileStatus];
};
