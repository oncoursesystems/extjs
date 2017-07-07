Ext.define('KitchenSink.BaseApplication', {
    extend: 'Ext.app.Application',

    defaultToken: 'all',

    destroyLoader: function () {
        var top     = Ext.get('loadingSplashTop'),
            wrapper = Ext.fly('loadingSplash');

        top.on('transitionend', wrapper.destroy, wrapper, { single: true });

        wrapper.addCls('app-loaded');
    }
});
