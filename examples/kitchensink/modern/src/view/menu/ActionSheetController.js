/**
 * Controls menus example
 */
Ext.define('KitchenSink.view.menu.ActionSheetController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.actionsheets',

    init: function () {
        this.menuStyle = 'reveal';
        this.menu = Ext.create({
            xtype: 'actionsheet',
            displayed: false,
            side: 'left',
            reveal: true,
            items: this.getMenuCfg('left')
        });
    },

    getMenu: function (side) {
        var menu = this.menu;

        if (menu) {
            if (side) {
                menu.setSide(side);
            }
        }

        return menu;
    },

    onSideChange: function (segBtn, value) {
        this.getMenu(value);
    },

    onStyleChange: function(segBtn, value) {
        this.menuStyle = value;
    },

    toggleMenu: function () {
        var me = this,
            sideButton = me.lookup('sideButton'),
            side = sideButton.getValue(),
            menu = me.getMenu(side);

        switch (me.menuStyle) {
            case 'reveal':
                menu.setReveal(true);
                menu.setCover(false);
                break;
            case 'cover':
                menu.setReveal(false);
                menu.setCover(true);
                break;
            case 'none':
                menu.setReveal(false);
                menu.setCover(false);
                break;
        }

        menu.setDisplayed(!menu.getDisplayed());
    },

    hideMenu: function () {
        var menu = this.menu;

        if (menu) {
            menu.setDisplayed(false);
        }
    },

    getMenuCfg: function(side) {
        var me = this;

        return [{
            text: 'Settings',
            iconCls: 'x-fa fa-gear',
            scope: me,
            handler: me.hideMenu
        }, {
            text: 'New Item',
            iconCls: 'x-fa fa-pencil',
            scope: me,
            handler: me.hideMenu
        }, {
            xtype: 'button',
            text: 'Star',
            iconCls: 'x-fa fa-star',
            scope: me,
            handler: me.hideMenu
        }];
    }
});
