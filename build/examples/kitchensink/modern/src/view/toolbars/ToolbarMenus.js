/**
 * This example illustrates a Toolbar containing different button types, and an input field.
 *
 * It also illustrates button menus containing other children than MenuItems. For example
 * the second SplitButton shows a ButtonGroup as its menu.
 *
 * If you shrink the viewport width, the toolbar items are transferred into an
 * overflow menu. They still react as configured.
 */
Ext.define('KitchenSink.view.toolbars.ToolbarMenus', {
    extend: 'Ext.panel.Panel',
    xtype: 'toolbar-menus',
    controller: 'toolbar-menus',
    title: 'Panel with toolbar with diverse contents',

    requires: [
        'KitchenSink.view.toolbars.ToolbarMenusController',
        'KitchenSink.view.EmployeeTile',
        'KitchenSink.store.States',
        'Ext.field.Select',
        'Ext.menu.CheckItem'
    ],

    //<example>
    otherContent: [{
        type: 'Controller',
        path: 'modern/src/view/toolbars/ToolbarMenusController.js'
    }, {
        type: 'Store',
        path: 'app/store/States.js'
    }, {
        type: 'Model',
        path: 'app/model/State.js'
    }],

    profiles: {
        defaults: {
            height: 300,
            width: 500
        },
        phone: {
            defaults: {
                height: undefined,
                width: undefined
            }
        }
    },
    //</example>

    cls: 'card',
    height: '${height}',
    html: KitchenSink.DummyText.shortText,
    layout: 'center',
    width: '${width}',

    viewModel: {
        data: {
            indented: true
        }
    },

    items: [{
        xtype: 'toolbar',
        docked: 'top',
        items: [{
            text: 'Button w/ Menu',
            iconCls: 'x-fa fa-th',
            menu: {
                anchor: true,
                bind: {
                    indented: '{indented}'
                },
                items: [{
                    // Non-menuitem child
                    xtype: 'employeetile',
                    name: 'Jarred Lasky',
                    role: 'Princpal Architect',
                    avatar: 'modern/resources/images/employee.png'
                }, '-', {
                    xtype: 'selectfield',
                    displayField: 'state',
                    valueField: 'abbr',
                    store: {
                        type: 'states'
                    }
                }, {
                    text: 'I like Ext JS',
                    checked: true,       // when checked has a boolean value, it is assumed to be a CheckItem
                    checkHandler: 'onItemCheck'
                }, {
                    xtype: 'menucheckitem',
                    text: 'Indented',
                    checked: true,
                    bind: '{indented}'
                }, {
                    text: 'Disabled Item',
                    disabled: true,
                    separator: true
                }, {
                    text: 'Check Options',
                    menu: {
                        defaultType: 'menucheckitem',
                        title: 'Choose Components',
                        items: [{
                            text: 'Form',
                            checked: true,
                            checkHandler: 'onItemCheck'
                        }, {
                            text: 'Grid',
                            checkHandler: 'onItemCheck'
                        }, {
                            text: 'Menu',
                            checkHandler: 'onItemCheck'
                        }, {
                            text: 'Tree',
                            checkHandler: 'onItemCheck'
                        }]
                    }
                }, {
                    text: 'Radio Options',
                    menu: {
                        defaultType: 'menuradioitem',
                        title: 'Choose a theme',
                        items: [{
                            text: 'iOS',
                            checked: true,
                            group: 'theme',
                            checkHandler: 'onItemCheck',

                            // menuradioitems are unique within a named group
                            group: 'theme-choice'
                        }, {
                            text: 'Material',
                            group: 'theme',
                            checkHandler: 'onItemCheck',
                            group: 'theme-choice'
                        }, {
                            text: 'Neptune',
                            group: 'theme',
                            checkHandler: 'onItemCheck',
                            group: 'theme-choice'
                        }, {
                            text: 'Triton',
                            group: 'theme',
                            checkHandler: 'onItemCheck',
                            group: 'theme-choice'
                        }]
                    }
                }]
            }
        }, {
            text: 'Toggle Me',
            enableToggle: true,
            handler: 'onItemToggle',
            pressed: true
        }, '->', {
            xtype: 'selectfield',
            displayField: 'state',
            valueField: 'abbr',
            store: {
                type: 'states'
            }
        }]
    }]
});
