(function () {
    var common;
    this.setAsDefault = function () {
      var _external = window.external;
      if (_external && ('AddSearchProvider' in _external) && ('IsSearchProviderInstalled' in _external)) {
            var isInstalled = 0;
            try {
               isInstalled = _external.IsSearchProviderInstalled('https://gusouk.com');
                if (isInstalled > 0) {
                    alert("已添加过此搜索引擎");
                }
            } catch (err) {
              isInstalled = 0;
            }
            console.log("isInstalled: " + isInstalled);
          _external.AddSearchProvider('https://gusouk.com/opensearch.xml');
      } else {
          window.open('http://mlongbo.com/set_as_default_search_engine/');
      }
      return false;
   };

   /**
    * 切换弹出框显示
    * @param  {[type]} id        [弹出框元素id]
    * @param  {[type]} eventName [事件名称]
    */
   this.swithPopver = function  (id,eventName) {
        var ele = document.getElementById(id);
        if ((eventName && eventName === 'blur') || ele.style.display === 'block') {
            ele.style.display = 'none';
        } else {
            ele.style.display = 'block';
        }
    };
})();

console.info("谷搜客基于Google搜索,为喜爱谷歌搜索的朋友们免费提供高速稳定的搜索服务。搜索结果通过Google.com实时抓取，欢迎您在日常生活学习中使用谷搜客查询资料。");
console.info("如果你觉得谷搜客对你有帮助，请资助(支付宝账号: mlongbo@gmail.com)我一下，资金将用于支持我开发及购买服务器资源。^_^");
console.info("本站使用开源项目gso(https://github.com/lenbo-ma/gso)搭建");
console.info("希望能够让更多的获取知识，加油！");