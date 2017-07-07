Ext.define('KitchenSink.view.d3.heatmap.Pivot', {
    extend: 'Ext.panel.Panel',
    xtype: 'd3-view-heatmap-pivot',
    controller: 'heatmap-pivot',

    requires: [
        'KitchenSink.view.d3.heatmap.PivotController',
        'Ext.pivot.d3.HeatMap'
    ],

    // <example>
    otherContent: [{
        type: 'Controller',
        path: 'modern/src/view/d3/heatmap/PivotController.js'
    }],
    // </example>

    layout: 'fit',

    tbar: ['->', {
        iconCls: 'x-fa fa-refresh',
        text: 'Refresh Data',
        handler: 'onRefreshData'
    }],

    items: [{
        xtype: 'pivotheatmap',
        reference: 'heatmap',

        matrix: {
            store: {
                type: 'salesperemployee'
            },
            leftAxis: {
                dataIndex: 'employee',
                header: 'Employee',
                sortable: false
            },
            topAxis: {
                dataIndex: 'day',
                sortIndex: 'dayNumber',
                header: 'Day'
            },
            aggregate: {
                dataIndex: 'sales',
                aggregator: 'sum'
            }
        },

        padding: {
            top: 20,
            right: 30,
            bottom: 70,
            left: 120
        },

        xAxis: {
            title: {
                attr: {
                    'font-size': '12px'
                }
            }
        },

        yAxis: {
            title: {
                attr: {
                    'font-size': '12px'
                }
            }
        },

        colorAxis: {
            scale: {
                type: 'linear',
                range: ['#ffffd9', '#49b6c4', '#225ea8']
            }
        },

        legend: {
            docked: 'right',
            padding: 50,
            
            // Legend items are *not* Container items. This config is an object.
            items: {
                count: 10,
                slice: [1],
                reverse: true,
                size: {
                    x: 60,
                    y: 30
                }
            }
        },

        tooltip: {
            renderer: 'onTooltip'
        },

        platformConfig: {
            phone: {
                tiles: {
                    cls: 'phone-tiles'
                }
            },
            tablet: {
                tiles: {
                    cls: 'tablet-tiles'
                }
            }
        }
    }]
});
