Ext.define('KitchenSink.view.forms.CheckoutController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.forms-checkout',

    init: function (view) {
        var viewModel = view.getViewModel(),
            activeItem = view.getActiveItem(),
            layout = view.getLayout(),
            indicator = layout.getIndicator(),
            bbar = view.lookup('buttonToolbar');

        viewModel.set('step', activeItem.title);

        bbar.insert(1, indicator);
    },

    go: function (direction) {
        var view = this.getView(),
            viewModel = view.getViewModel(),
            innerItems = view.getInnerItems(),
            activeItem = view.getActiveItem(),
            index = innerItems.indexOf(activeItem) + (direction * 1),
            newItem = innerItems[index];

        if (newItem) {
            view.setActiveItem(newItem);

            viewModel.set({
                index: index,
                step: newItem.title
            });
        }
    },

    onBack: function () {
        this.go(-1);
    },

    onNext: function () {
        this.go(1);
    },

    onSubmit: function () {
        var view = this.getView();

        if (view.validate()) {
            Ext.Msg.alert('Success!', 'Your payment has been processed!');
        } else {
            Ext.Msg.alert('Invalid', 'Please check the form for errors and try again.');
        }
    },

    onReset: function () {
        var view = this.getView(),
            activeItem = view.getActiveItem(),
            activeFields = activeItem.query('field');

        activeFields.forEach(function (field) {
            field.reset();
        });
    }
});
