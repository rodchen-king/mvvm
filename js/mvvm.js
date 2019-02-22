function MVVM(options) {
    // 内部维护options
    this.$options = options || {};
    // 复制data变量以及_data内部属性
    var data = this._data = this.$options.data;
    // js self处理为了在forEach处理获取到当前对象
    var me = this;

    // 数据代理
    // 实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach(function(key) {
        // 模仿源码中使用es6 proxy
        me._proxyData(key);
    });

    // 初始化计算属性
    this._initComputed();
    // 初始化数据监听器
    observe(data, this);
    // 初始化指令解析器
    this.$compile = new Compile(options.el || document.body, this)
}

MVVM.prototype = {
    // 模仿watch功能
    $watch: function(key, cb, options) {
        new Watcher(this, key, cb);
    },

    _proxyData: function(key, setter, getter) {
        var me = this;
        setter = setter || 
        Object.defineProperty(me, key, {
            configurable: false, // 不可操作（不可重新定义）
            enumerable: true,
            get: function proxyGetter() {
                return me._data[key];
            },
            set: function proxySetter(newVal) {
                me._data[key] = newVal;
            }
        });
    },

    _initComputed: function() {
        var me = this;
        // 获取实例中的计算属性
        var computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function(key) {
                Object.defineProperty(me, key, {
                    // 防错处理（这里判断是否为函数）
                    get: typeof computed[key] === 'function' 
                            ? computed[key] 
                            : computed[key].get,
                    set: function() {}
                });
            });
        }
    }
};