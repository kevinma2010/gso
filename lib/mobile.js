/**
 * @author Longbo Ma
 */
module.exports = {
    isMobile: function (userAgent) {
        return exists(userAgent,'iPad') || exists(userAgent,'iPhone') || exists(userAgent,'Android') ||
            exists(userAgent,'SymbianOS') || exists(userAgent,'Windows Phone') || exists(userAgent,'iPod');
    }
};

function exists (userAgent,str) {
    return userAgent.indexOf(str) > -1
}