/**
 * @author Longbo Ma
 */
module.exports = {
    isMobile: function (userAgent) {
        return /*exists(userAgent,'iPad') ||*/ exists(userAgent,'iPhone') || exists(userAgent,'Android') ||
            exists(userAgent,'BlackBerry') || exists(userAgent,'hp-tablet') || exists(userAgent,'compatible') ||
            exists(userAgent,'BB10') ||
            exists(userAgent,'SymbianOS') || exists(userAgent,'Windows Phone') || exists(userAgent,'iPod');
    }
};

function exists (userAgent,str) {
    return userAgent.indexOf(str) > -1
}