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
export const drawRing = (ctx: CanvasRenderingContext2D, border: number, value = 0): void => {
    const color = getColor(value);

    ctx.save();
    const { width, height } = ctx.canvas;
    const margin = 5;
    ctx.beginPath();
    ctx.lineWidth = border;
    ctx.strokeStyle = `rgba(${color.join(",")},0.15)`;
    ctx.arc(width / 2, height / 2, width / 2 - margin - border / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
};

/**
 * 获取颜色
 * @param value 0~1的值
 */
export const getColor = (value: number): [number, number, number] => {
    const val = Math.round(value * 100);
    let color: [number, number, number] = [255, 133, 134];
    if (val > 66) {
        color = [129, 198, 95];
    } else if (val > 33) {
        color = [255, 211, 71];
    }
    return color;
};

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

export const marginValue = (): number => {
    return 5;
};

/**
 * 画弧
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

    drawRing(ctx, border, value);

    if (!value) {
        return;
    }

    const margin = marginValue();
    ctx.lineWidth = border;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.lineCap = "round";

    const r = width / 2 - margin - border / 2;
    const circumference = 2 * r * Math.PI;
    //4 这里时bar的宽度除以2
    const v = (2 * Math.PI) / (circumference / 4);
    ctx.arc(width / 2, height / 2, r, -Math.PI / 2, Math.PI * 2 * value - Math.PI / 2 - v);
    ctx.stroke();
};

/**
 * 画柄
 * @param el
 * @param border
 * @param value
 */
export const drawBar = (el: HTMLCanvasElement, border: number, value: number): void => {
    const ctx = el.getContext("2d");

    if (!ctx) {
        return;
    }

    const { width, height } = ctx.canvas;
    ctx.save();

    const barWidth = 8;
    const barHeight = border === 16 ? 22 : 20;
    const radius = 4;
    const r = width / 2 - marginValue() - border / 2;
    const rx = width / 2;
    const ry = height / 2;

    const fn = () => {
        ctx.fillStyle = "#fff";

        ctx.beginPath();
        ctx.moveTo(barWidth / 2, -r - border / 2);
        ctx.lineTo(barWidth / 2, -r - border / 2 + (barHeight - radius * 2));
        ctx.arc(0, -r - border / 2 + (barHeight - radius * 2), radius, 0, Math.PI);
        ctx.lineTo(-barWidth / 2, -r - border / 2);
        ctx.arc(0, -r - border / 2, radius, Math.PI, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    };

    ctx.translate(rx, ry);
    ctx.rotate(Math.PI * 2 * value);

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 6;
    ctx.shadowColor = "rgba(26, 26, 26, 0.06)";
    fn();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(26, 26, 26, 0.1)";
    fn();

    ctx.restore();
};

/**
 * 判断点位是否在圆上
 * @param el canvas对象
 * @param x 当前点击点位的x轴坐标
 * @param y 当前点击点位的y轴坐标
 * @param border 圆的边框大小
 * @param value 误差值
 * @returns
 */
export const pointOnCircle = (
    el: HTMLCanvasElement | null,
    x: number,
    y: number,
    border: number,
    value = 3,
): boolean => {
    const scrollData = getScrollValue();

    if (!el) {
        return false;
    }
    const rect = el.getBoundingClientRect();
    const offsetX = x - (rect.left + scrollData.x);
    const offsetY = y - (rect.top + scrollData.y);
    const ctx = el.getContext("2d");
    if (!ctx) {
        return false;
    }

    const { width, height } = ctx.canvas;

    const r = width / 2 - marginValue();

    const [rx, ry] = [width / 2, height / 2];

    const d = Math.sqrt((ry - offsetY) ** 2 + (rx - offsetX) ** 2);
    return d <= r + value && d >= r - border - value;
};
