/**
 * This example shows how to create a grid with buffer column rendering and dynamic toolbar.
 */
Ext.define('KitchenSink.view.grid.core.BufferedColumnsGrid', {
    extend: 'Ext.Container',
    xtype: 'bufferedcolumns-grid',
    title: 'Buffered Columns Grid',

    requires: [
        'KitchenSink.store.DynamicRows',
        'Ext.grid.filters.Plugin',
        'Ext.grid.plugin.BottomScrollbar'
    ],

    // <example>
    otherContent: [{
        type: 'Store',
        path: 'modern/src/store/DynamicRows.js'
    }],

    profiles: {
        defaults: {
            height: 700,
            width: 800
        },
        phone: {
            defaults: {
                height: undefined,
                width: undefined
            }
        }
    },
    // </example>

    layout: 'vbox',
    height: '${height}',
    width: '${width}',

    items: [{
        // Configuration panel
        xtype: 'panel',
        title: 'Grid Configuration',
        height: 120,
        padding: 10,
        scrollable: true,
        layout: {
            type: 'hbox',
            align: 'middle'
        },
        items: [{
            xtype: 'numberfield',
            itemId: 'rowCountField',
            fieldLabel: 'Number of Rows',
            value: 10,
            minValue: 1,
            width: 200,
            margin: '0 10 0 0'
        }, {
            xtype: 'numberfield',
            itemId: 'colCountField',
            fieldLabel: 'Number of Columns',
            value: 1000,
            minValue: 1,
            width: 200,
            margin: '0 10 0 0'
        }, {
            xtype: 'button',
            text: 'Recreate Grid',
            handler: function(btn) {
                var container = btn.up('container[xtype=bufferedcolumns-grid]');

                container.recreateGrid();
            }
        }]
    }, {
        // Grid container
        xtype: 'container',
        itemId: 'gridContainer',
        flex: 1,
        layout: 'fit'
    }],

    generateRowData: function(numRows, numCols) {
        var arrData = [],
            temp, i, j,
            departments = ['Science', 'Commerce', 'Art'];

        for (i = 0; i < numRows; i++) {
            temp = {};

            // Add department column with cycling values
            temp.department = departments[i % 3];

            // Add count column with random values between 1-100
            temp.count = Math.floor(Math.random() * 100) + 1;

            for (j = 0; j < numCols; j++) {
                temp["col" + j] = i + "-" + j;
            }

            arrData.push(temp);
        }

        return arrData;
    },

    generateColumns: function(numCols) {
        var arrColumns = [],
            i;

        // Add Miscellaneous group header
        arrColumns.push({
            text: 'Miscellaneous',
            columns: [
                {
                    text: 'Department',
                    dataIndex: 'department',
                    width: 120,
                    editable: true,
                    editor: {
                        xtype: 'combobox',
                        store: ['Science', 'Commerce', 'Art'],
                        allowBlank: false,
                        forceSelection: true,
                        queryMode: 'local'
                    },
                    renderer: function(value) {
                        var colorMap = {
                                'Science': 'green',
                                'Commerce': 'blue',
                                'Art': 'purple'
                            },
                            color = colorMap[value] || 'black';

                        return '<span style="color:' + color + '; font-weight: bold;">' + value + '</span>';
                    },
                    cell: {
                        encodeHtml: false
                    }
                },
                {
                    text: 'Count',
                    dataIndex: 'count',
                    width: 100,
                    editable: true,
                    editor: {
                        xtype: 'numberfield',
                        allowBlank: false,
                        minValue: 0,
                        maxValue: 1000
                    },
                    cell: {
                        encodeHtml: false
                    },
                    summary: 'sum'
                }
            ]
        });

        // Add regular columns
        for (i = 0; i < numCols; i++) {
            arrColumns.push({
                text: 'Column ' + i,
                dataIndex: "col" + i,
                width: 100,
                editable: true,
                editor: {
                    xtype: 'textfield',
                    allowBlank: false,
                    emptyText: 'Enter value'
                },
                renderer: function(value) {
                    if (value && value.includes('-0')) {
                        return '<span style="color:blue;">' + value + '</span>';
                    }

                    return value;
                },
                cell: {
                    encodeHtml: false
                }
            });
        }

        return arrColumns;
    },

    createGrid: function(numRows, numCols) {
        var data = this.generateRowData(numRows, numCols),
            columns = this.generateColumns(numCols),
            fields = Object.keys(data[0] || {}),

            store = Ext.create('Ext.data.Store', {
                fields: fields,
                data: data
            });

        return Ext.create('Ext.grid.Grid', {
            title: 'Buffered Columns Grid',
            store: store,
            plugins: {
                gridbottomscrollbar: {}
            },
            scrollable: true,
            bufferedColumns: true,
            variableHeights: true,
            columns: columns
        });
    },

    afterRender: function() {
        this.recreateGrid();
    },

    recreateGrid: function() {
        var me = this,
            gridContainer = me.down('#gridContainer'),
            rowCount = me.down('#rowCountField').getValue(),
            colCount = me.down('#colCountField').getValue();

        // Validate inputs
        if (!rowCount || !colCount || rowCount < 1 || colCount < 1) {
            Ext.Msg.alert('Invalid Input', 'Please enter valid numbers for rows and columns.');

            return;
        }

        // Show loading mask
        gridContainer.setMasked({
            xtype: 'loadmask',
            message: 'Creating new grid...'
        });

        Ext.undefer(me.timerID);
        // Defer the recreation to allow the UI to update
        me.timerID = Ext.defer(function() {
            try {
                // Destroy the current grid
                if (me.currentGrid) {
                    gridContainer.remove(me.currentGrid);
                    me.currentGrid.destroy();
                    me.currentGrid = null;
                }

                // Create new grid
                me.currentGrid = me.createGrid(rowCount, colCount);
                gridContainer.add(me.currentGrid);

                // Remove loading mask
                gridContainer.setMasked(false);

                // Show success message
                Ext.toast({
                    message: 'Grid created successfully with ' + rowCount + ' rows and ' + colCount + ' columns!',
                    align: 'tr',
                    autoCloseDelay: 2000
                });
            }
            catch (e) {
                gridContainer.setMasked(false);
                Ext.Msg.alert('Error', 'Failed to create grid: ' + e.message);
            }
        }, 100);
    }
});

