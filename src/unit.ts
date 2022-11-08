/**
 * 深克隆
 */
export const deepCloneData = <T>(data: T): T => {
    if (data == null) {
        return data;
    }

    return JSON.parse(JSON.stringify(data)) as T;
};

/**
 * 画圆环
 * @param ctx
 */
export const drawRing = (ctx: CanvasRenderingContext2D, border: number): void => {
    const { width, height } = ctx.canvas;
    const margin = 5;
    ctx.beginPath();
    ctx.lineWidth = border;
    ctx.strokeStyle = "#EBEBEB";
    ctx.arc(width / 2, height / 2, width / 2 - margin - border / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
};

/**
 * 画柄
 * @param ctx 2d画布类
 * @param x 当前位置中点x轴
 * @param y 当前位置中点y轴
 */
// export const drawBar = (ctx: CanvasRenderingContext2D, x: number, y: number, border: number) => {
//     ctx.beginPath();
//     ctx.lineWidth = 0;
//     ctx.fillStyle = "#fff";
//     ctx.ellipse(100, 100, 50, 75, Math.PI / 4, 0, 2 * Math.PI);
//     ctx.closePath();
//     ctx.stroke();
// };

export const getScrollValue = (): {
    x: number;
    y: number;
} => {
    let x = window.scrollX || window.pageXOffset;
    let y = window.scrollY || window.pageYOffset;
    const node = document.documentElement || document.body.parentNode;
    if (!x) {
        x = (typeof node.scrollLeft == "number" ? node : document.body).scrollLeft;
    } else if (!y) {
        y = (typeof node.scrollTop == "number" ? node : document.body).scrollTop;
    }
    return {
        x,
        y,
    };
};

const getIntersectionPoint = (
    rx: number,
    ry: number,
    r: number,
    pointX: number,
    pointY: number,
): [number, number] => {
    /**
     *  根据两点公式
     * 和圆的等式
     * 求出交点坐标
     */
    const b = Math.sqrt((r ** 2 * (pointX - rx) ** 2) / ((pointY - ry) ** 2 + (pointX - rx) ** 2));

    const x = pointX > rx ? b + rx : -b + rx;

    const c = Math.sqrt(r ** 2 - (x - rx) ** 2);

    const y = pointY > ry ? c + ry : -c + ry;

    return [x, y];
};

/**
 * 获取起点和当前的位置所产生的圆心角的度数
 * @param rx 圆心X轴坐标
 * @param ry 圆心Y轴坐标
 * @param r  圆的半径
 * @param pointX 当前点击的X轴坐标
 * @param pointY 当前点击的Y轴坐标
 * @param border 圆的边宽
 */
export const getAngle = (
    rx: number,
    ry: number,
    r: number,
    pointX: number,
    pointY: number,
): number => {
    //圆心
    //起点坐标
    const startPoint = [rx, 5];
    //当前坐标
    let currentPoint = [0, 0];

    currentPoint = getIntersectionPoint(rx, ry, r, pointX, pointY);

    //点到点的距离
    const pointToPoint = Math.sqrt(
        (currentPoint[1] - startPoint[1]) ** 2 + (currentPoint[0] - startPoint[0]) ** 2,
    );

    //
    let value = 0;
    if (currentPoint[0] > startPoint[0]) {
        value = Math.acos((r ** 2 * 2 - pointToPoint ** 2) / (2 * r * r));
    } else if (startPoint[0] > currentPoint[0]) {
        value = Math.PI * 2 - Math.acos((r ** 2 * 2 - pointToPoint ** 2) / (2 * r * r));
    } else if (startPoint[1] + r * 2 === currentPoint[1]) {
        value = Math.PI;
    }

    //返回一个全路程的百分比
    return Math.round(((value * (180 / Math.PI)) / 360) * 100) / 100;
};

/**
 * 画弧
 */
/**
 *
 * @param el canvas
 * @param border border值
 * @param value 画多长 0-1
 * @returns
 */
export const drawRadian = (
    el: HTMLCanvasElement,
    border: number,
    value: number,
    color: string,
): void => {
    const ctx = el.getContext("2d");

    if (!ctx) {
        return;
    }

    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);

    drawRing(ctx, border);

    const margin = 5;
    ctx.beginPath();
    ctx.lineWidth = border;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.arc(
        width / 2,
        height / 2,
        width / 2 - margin - border / 2,
        -Math.PI / 2,
        Math.PI * 2 * value - Math.PI / 2,
    );
    ctx.stroke();
};
