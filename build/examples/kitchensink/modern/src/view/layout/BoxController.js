Ext.define('KitchenSink.view.layout.BoxController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.layout-box',

    getLayout: function () {
        var panel = this.lookup('panel');

        return panel.getLayout();
    },

    onAlignChange: function (menuitem) {
        var layout = this.getLayout();

        layout.setAlign(menuitem.getText());
    },

    onPackChange: function (menuitem) {
        var layout = this.getLayout();

        layout.setPack(menuitem.getText());
    },

    onReverseChange: function (button) {
        var layout = this.getLayout();

        layout.setReverse(button.getPressed());
    },

    onVerticalChange: function (button) {
        var layout = this.getLayout();

        layout.setVertical(button.getPressed());
    },

    onFlexChange: function (field, value) {
        var panel = field.up('panel[isMenu!=true]'), //menu is a panel
            layout = this.getLayout(),
            vertical = layout.getVertical(),
            prop = vertical ? 'height' : 'width',
            viewModel = panel.getViewModel();

        if (Ext.isNumber(value) && Ext.isNumber(viewModel.get(prop))) {
            viewModel.set(prop, null);
        }
    },

    onHeightChange: function (field, value) {
        var panel = field.up('panel[isMenu!=true]'), //menu is a panel
            layout = this.getLayout(),
            viewModel = panel.getViewModel(),
            isNum = Ext.isNumber(value);

        if (layout.getVertical()) {
            if (isNum) {
                viewModel.set('flex', null);
            }
        } else {
            // if not a number, set to null so layout can handle
            viewModel.set('height', isNum ? value : null);
        }
    },

    onWidthChange: function (field, value) {
        var panel = field.up('panel[isMenu!=true]'), //menu is a panel
            layout = this.getLayout(),
            viewModel = panel.getViewModel(),
            isNum = Ext.isNumber(value);

        if (layout.getVertical()) {
            // if not a number, set to null so layout can handle
            viewModel.set('width', isNum ? value : null);
        } else if (isNum) {
            viewModel.set('flex', null);
        }
    },

    onResize: function (panel, info) {
        var viewModel = panel.getViewModel(),
            layout = this.getLayout(),
            vertical = layout.getVertical(),
            data = {};

        if ((info.edge === 'south') && vertical || (info.edge === 'east' && !vertical)) {
            data.flex = null;
        }

        if (info.edge === 'south') {
            data.height = info.height;
        } else {
            data.width = info.width;
        }

        viewModel.set(data);
    }
});
