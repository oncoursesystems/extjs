Ext.define('KitchenSink.view.progress.DecoratedController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.progress-decorated',

    init: function() {
        var me = this,
            view = me.getView(),
            vm = this.getViewModel();

        me._interval = setInterval(function() {
            if (view.isDestroyed) {
                clearInterval(me._interval);
            } else {
                var progress = vm.get('progress');

                progress += 0.01;

                if (progress > 1) {
                    progress = 0;
                }

                vm.set('progress', progress);
            }
        }, 150);
    },

    destroy: function () {
        clearInterval(this._interval);

        this._interval = null;

        this.callParent();
    }
});
