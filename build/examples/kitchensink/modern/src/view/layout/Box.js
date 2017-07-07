/**
 * Demonstrates usage of a box layout.
 */
Ext.define('KitchenSink.view.layout.Box', {
    extend: 'Ext.Container',
    xtype: 'layout-box',
    controller: 'layout-box',

    requires: [
        'Ext.layout.Box'
    ],

    // <example>
    otherContent: [{
        type: 'Controller',
        path: 'modern/src/view/layout/BoxController.js'
    }, {
        type: 'ViewModel',
        path: 'modern/src/view/layout/BoxViewModel.js'
    }],

    profiles: {
        defaults: {
            buttonShadow: true,
            padding: 8,
            shadow: true,
            tbarPadding: '5 8'
        },
        ios: {
            buttonShadow: undefined,
            tbarPadding: undefined
        },
        phone: {
            defaults: {
                padding: undefined,
                shadow: undefined,
                tbarPadding: '12 8'
            },
            ios: {
                tbarPadding: undefined
            }
        }
    },

    padding: '${padding}', //give room for the panel's shadow
    shadow: false,
    // </example>

    layout: 'fit',

    items: [{
        xtype: 'panel',
        reference: 'panel',
        bodyPadding: 10,
        defaultType: 'panel',
        shadow: '${shadow}',
        defaults: {
            bodyPadding: 10,
            border: true,
            bind: {
                flex: '{flex}',
                height: '{height}',
                width: '{width}',
                html: '{html}'
            },
            listeners: {
                resizedragend: 'onResize'
            },
            resizable: {
                edges: 'south,east'
            },
            tbar: [{
                text: 'Edit',
                menu: {
                    bodyPadding: 10,
                    plain: true,
                    width: 150,
                    items: [{
                        xtype: 'numberfield',
                        label: 'flex',
                        labelAlign: 'top',
                        minValue: 0,
                        bind: '{flex}',
                        listeners: {
                            change: 'onFlexChange'
                        }
                    }, {
                        xtype: 'numberfield',
                        label: 'height',
                        labelAlign: 'top',
                        minValue: 0,
                        bind: '{height}',
                        listeners: {
                            change: 'onHeightChange'
                        }
                    }, {
                        xtype: 'numberfield',
                        label: 'width',
                        labelAlign: 'top',
                        minValue: 0,
                        bind: '{width}',
                        listeners: {
                            change: 'onWidthChange'
                        }
                    }]
                }
            }]
        },
        layout: {
            type: 'box'
        },
        items: [{
            title: 'Panel 1',
            autoSize: true,
            viewModel: {
                type: 'layout-box-item',
                data: {
                    flex: 1
                }
            }
        }, {
            title: 'Panel 2',
            autoSize: true,
            viewModel: {
                type: 'layout-box-item',
                data: {
                    width: 100
                }
            }
        }, {
            title: 'Panel 3',
            autoSize: true,
            viewModel: {
                type: 'layout-box-item',
                data: {
                    flex: 2
                }
            }
        }]
    }, {
        xtype: 'toolbar',
        docked: 'top',
        ui: 'transparent',
        padding: '${tbarPadding}',
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        defaults: {
            margin: '0 10 0 0',
            shadow: '${buttonShadow}',
            ui: 'action'
        },
        items: [{
            text: 'align',
            arrow: false,
            menu: {
                defaults: {
                    xtype: 'menuradioitem',
                    handler: 'onAlignChange',
                    group: 'align'
                },
                items: [{
                    text: 'stretch',
                    checked: true
                }, {
                    text: 'start'
                }, {
                    text: 'center'
                }, {
                    text: 'end'
                }]
            }
        }, {
            text: 'pack',
            arrow: false,
            menu: {
                defaults: {
                    xtype: 'menuradioitem',
                    handler: 'onPackChange',
                    group: 'pack'
                },
                items: [{
                    text: 'start',
                    checked: true
                }, {
                    text: 'center'
                }, {
                    text: 'end'
                }, {
                    text: 'space-between'
                }, {
                    text: 'space-around'
                }, {
                    text: 'justify'
                }]
            }
        }, {
            text: 'reverse',
            enableToggle: true,
            handler: 'onReverseChange'
        }, {
            text: 'vertical',
            enableToggle: true,
            handler: 'onVerticalChange'
        }]
    }]
});
