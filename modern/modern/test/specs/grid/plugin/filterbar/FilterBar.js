topSuite("Ext.grid.plugin.filterbar.FilterBar", [
    'Ext.data.ArrayStore', 'Ext.layout.Fit',
    'Ext.grid.Grid', 'Ext.grid.plugin.Summaries',
    'Ext.MessageBox', 'Ext.grid.SummaryRow', 'Ext.app.ViewModel', 'Ext.grid.plugin.CellEditing'
], function() {
    function isBlank(s) {
        return !s || s === '\xA0' || s === '&nbsp;';
    }

    function expectBlank(s) {
        if (!isBlank(s)) {
            expect(s).toBe('');
        }
    }

    var store, grid,
        gridEvents = {},
        colMap, plugin,
        Sale = Ext.define(null, {
            extend: 'Ext.data.Model',

            fields: [
                { name: 'id',        type: 'int' },
                { name: 'company',   type: 'string' },
                { name: 'person',    type: 'string', summary: 'count' },
                { name: 'date',      type: 'date', defaultValue: new Date(2012, 0, 1) },
                { name: 'value',     type: 'float', defaultValue: null, summary: 'sum' },
                {
                    name: 'year',
                    convert: function(v, record) {
                        var d = record.get('date');

                        return d ? d.getFullYear() : null;
                    }
                }, {
                    name: 'month',
                    convert: function(v, record) {
                        var d = record.get('date');

                        return d ? d.getMonth() : null;
                    }
                }]
        });

    function getEventHandler(type) {
        return function() {
            gridEvents = {};
            gridEvents[type] = true;
        };
    }

    function checkRowCells(index, values) {
        var rowCells = grid.getItemAt(index).cells,
            len = values.length,
            cells = [],
            html, i, cell;

        for (i = 0; i < rowCells.length; i++) {
            if (rowCells[i].isVisible()) {
                cells[cells.length] = rowCells[i];
            }
        }

        for (i = 0; i < len; i++) {
            cell = cells[i];

            cell = cell.element.down('.x-grid-group-title', true) ||
                cell.element.down('.x-body-el', true);

            html = cell.innerHTML;

            if (isBlank(values[i])) {
                expectBlank(html);
            }
            else {
                expect(html).toBe(values[i]);
            }
        }
    }

    function makeGrid(gridConfig, storeConfig, storeData) {
        store = new Ext.data.Store(Ext.merge({
            model: Sale,
            proxy: {
                type: 'memory',
                limitParam: null,
                data: storeData || [
                    { company: 'Microsoft', person: 'John', date: new Date(), value: 1 },
                    { company: 'Adobe', person: 'John', date: new Date(), value: 2 },
                    { company: 'Microsoft', person: 'Helen', date: new Date(), value: 3 }
                ],
                reader: {
                    type: 'json'
                }
            },
            autoLoad: true
        }, storeConfig));

        // Reset flag that is set when the pivot grid has processed the data and rendered
        gridEvents = {};

        grid = new Ext.grid.Grid(Ext.merge({
            title: 'Test tree grouping',
            collapsible: true,
            multiSelect: true,
            height: 400,
            width: 750,

            listeners: {
                refresh: getEventHandler('done'),
                buffer: 100
            },

            store: store,

            plugins: {
                gridfilterbar: true
            },

            columns: [
                { text: 'Company', dataIndex: 'company', itemId: 'c1', filterType: { type: 'string' } },
                { text: 'Person', dataIndex: 'person', itemId: 'c2', filterType: { type: 'string' } },
                { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3', filterType: { type: 'date' } },
                { text: 'Value', dataIndex: 'value', xtype: 'numbercolumn', itemId: 'c4', filterType: { type: 'number' } },
                { text: 'Year', dataIndex: 'year', itemId: 'c5' }
            ],

            renderTo: document.body
        }, gridConfig));

        setColMap();
        plugin = grid.getPlugin('gridfilterbar');
    }

    function setColMap() {
        colMap = {};

        grid.query('column').forEach(function(col) {
            colMap[col.getItemId()] = col;
        });
    }

    function destroyGrid() {
        Ext.destroy(grid, store);
        store = grid = colMap = plugin = null;
        gridEvents = {};
    }

    function resizeColumn(column, by) {
        var el = column.resizerElement,
            colBox = column.el.getBox(),
            fromMx = colBox.x + colBox.width - 2,
            fromMy = colBox.y + colBox.height / 2;

        // Mousedown on the header to drag
        Ext.testHelper.touchStart(el, { x: fromMx, y: fromMy });

        // Move to resize
        Ext.testHelper.touchMove(el, { x: fromMx + by, y: fromMy });
        Ext.testHelper.touchEnd(el, { x: fromMx + by, y: fromMy });
    }

    // Helper function to create expanded grid for scrollbar tests
    function makeScrollableGrid(gridConfig, storeConfig, storeData) {
        var mockData = storeData || [];

        // Generate more data for scrolling if not provided
        if (!storeData) {
            for (var i = 0; i < 100; i++) {
                mockData.push({
                    id: i,
                    company: 'Company' + i,
                    person: 'Person' + i,
                    date: new Date(2012 + (i % 10), i % 12, 1),
                    value: (i + 1) * 100
                });
            }
        }

        store = new Ext.data.Store(Ext.merge({
            model: Sale,
            proxy: {
                type: 'memory',
                limitParam: null,
                data: mockData,
                reader: {
                    type: 'json'
                }
            },
            autoLoad: true
        }, storeConfig));

        gridEvents = {};

        grid = new Ext.grid.Grid(Ext.merge({
            title: 'Scrollable Grid Test',
            height: 400,
            width: 500, // Narrower to force horizontal scrolling

            listeners: {
                refresh: getEventHandler('done'),
                buffer: 100
            },

            store: store,

            plugins: {
                gridfilterbar: true,
                cellediting: true
            },

            columns: [
                { text: 'Company', dataIndex: 'company', itemId: 'c1', width: 150, filterType: { type: 'string' }, editor: 'textfield' },
                { text: 'Person', dataIndex: 'person', itemId: 'c2', width: 150, filterType: { type: 'string' }, editor: 'textfield' },
                { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3', width: 150, filterType: { type: 'date' }, editor: 'datefield' },
                { text: 'Value', dataIndex: 'value', xtype: 'numbercolumn', itemId: 'c4', width: 150, filterType: { type: 'number' }, editor: 'numberfield' },
                { text: 'Year', dataIndex: 'year', itemId: 'c5', width: 150 }
            ],

            selectable: {
                cells: true
            },

            renderTo: document.body
        }, gridConfig));

        setColMap();
        plugin = grid.getPlugin('gridfilterbar');
    }

    afterEach(destroyGrid);

    describe('filterbar', function() {
        describe('filters', function() {
            it('columns should resize to correct width when the filter removed', function() {
                makeGrid(null, {
                    filters: {
                        property: 'company',
                        value: 'Adobe',
                        operator: '='
                    }
                });

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    gridEvents = null;
                    plugin.getBar().down('textfield').setValue('Adobe');
                    resizeColumn(grid.getFirstVisibleColumn(), 400);
                });

                waitsFor(function() {
                    return grid.getFirstVisibleColumn().getWidth() >= 400;
                });

                runs(function() {
                    plugin.clearFilters();
                });

                waitsFor(function() {
                    return grid.items.items[3].cells[0].getWidth() >= 400;
                });

                runs(function() {
                    expect(plugin.getBar().items.items[0].getWidth()).toBe(500);
                    expect(grid.items.items[3].cells[0].getWidth()).toBe(500);
                });
            });

            it('should add a filter on a column', function() {
                makeGrid({
                    columns: [
                        { text: 'Company', dataIndex: 'company', itemId: 'c1', filterType: { type: 'string', value: 'Adobe' } },
                        { text: 'Person', dataIndex: 'person', itemId: 'c2' },
                        { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3' },
                        { text: 'Value', dataIndex: 'value', xtype: 'numbercolumn', itemId: 'c4' },
                        { text: 'Year', dataIndex: 'year', itemId: 'c5' }
                    ]
                });

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    expect(store.getFilters().length).toBe(1);
                    expect(store.getCount()).toBe(1);
                });

            });

            it('should recognize if the store is filtered', function() {
                makeGrid(null, {
                    filters: {
                        property: 'company',
                        value: 'Adobe',
                        operator: '='
                    }
                });

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    expect(plugin.getBar().down('textfield').getValue()).toBe('Adobe');
                    expect(store.getFilters().length).toBe(1);
                    expect(store.getCount()).toBe(1);
                });

            });

            it('should react when a filter is typed in', function() {
                makeGrid();

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    gridEvents = null;
                    plugin.getBar().down('textfield').setValue('Adobe');
                });

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    expect(store.getFilters().length).toBe(1);
                    expect(store.getCount()).toBe(1);
                });
            });

            describe('remote filters', function() {
                var filterParams, allColumns;

                beforeEach(function() {
                    spyOn(Ext.Ajax, 'request').andCallFake(function(cb, scope) {
                        filterParams = cb;
                    });

                    store = Ext.create('Ext.data.Store', {
                        fields: ['name', 'email', 'phone'],
                        remoteFilter: true,
                        proxy: {
                            type: 'ajax',
                            url: 'fake',
                            reader: {
                                type: 'json'
                            }
                        },
                        autoLoad: true
                    });
                    allColumns = [{
                        text: 'Name',
                        dataIndex: 'name',
                        filterType: 'string'
                    }, {
                        text: 'Email',
                        dataIndex: 'email',
                        flex: 1,
                        filterType: {
                            type: 'string',
                            value: 'abc',
                            operator: '=='
                        }
                    }, {
                        text: 'Phone',
                        dataIndex: 'phone'
                    }];

                    grid = Ext.create('Ext.grid.Grid', {
                        title: 'Grid Column Filtering',
                        width: "70%",
                        height: 300,
                        store: store,
                        plugins: {
                            gridfilterbar: true
                        },

                        columns: allColumns
                    });
                });

                it('should load the store without filter params', function() {
                    waitsFor(function() {
                        return filterParams !== undefined;
                    });

                    runs(function() {
                        expect(filterParams.params.page).toBe(1);
                    });
                });

                it('should load the store with default filter params', function() {
                    waitsFor(function() {
                        return filterParams.params.filter !== undefined;
                    });

                    runs(function() {
                        expect(filterParams.params.page).toBe(1);
                        expect(JSON.parse(filterParams.params.filter)[0].operator).toBe('==');
                    });
                });

                it('should load the store when filter value is changed', function() {
                    grid.getPlugin('gridfilterbar').getBar().down('textfield').setValue('abc');

                    waitsFor(function() {
                        return filterParams.params.filter !== undefined;
                    });

                    runs(function() {
                        expect(filterParams.params.page).toBe(1);
                        expect(JSON.parse(filterParams.params.filter)[0].value).toBe('abc');
                    });
                });

                it('should load the store when filter operator is changed', function() {
                    grid.getPlugin('gridfilterbar').getBar().down('textfield').setOperator('==');
                    grid.getPlugin('gridfilterbar').getBar().down('textfield').setValue('xyz');

                    waitsFor(function() {
                        return filterParams.params.filter !== undefined;
                    });

                    runs(function() {
                        expect(filterParams.params.page).toBe(1);
                        expect(JSON.parse(filterParams.params.filter)[0].operator).toBe('==');
                    });
                });
            });
        });

        describe('show/hide', function() {
            it('should show the filterbar', function() {
                makeGrid();

                waitsFor(function() {
                    return gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    grid.hideFilterBar();
                    expect(plugin.getBar().isVisible()).toBe(false);
                    grid.showFilterBar();
                    expect(plugin.getBar().isVisible()).toBe(true);
                });
            });

            it('should hide the filterbar', function() {
                makeGrid();

                waitsFor(function() {
                    return gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    expect(plugin.getBar().isVisible()).toBe(true);
                    grid.hideFilterBar();
                    expect(plugin.getBar().isVisible()).toBe(false);
                });
            });
        });

        describe("column cls decoration", function() {
            var filterCls = Ext.grid.plugin.BaseFilterBar.prototype.filterCls,
                cols, col;

            afterEach(function() {
                cols = null;
            });

            describe("works for both non-nested and nested columns", function() {
                it("should add the cls for columns when a filter is preset", function() {
                    makeGrid(null, {
                        filters: {
                            property: 'company',
                            value: 'Adobe',
                            operator: '='
                        }
                    });

                    cols = grid.getColumns();
                    col = cols.filter(function(col) {
                        return col.getDataIndex() === 'company';
                    })[0];

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        expect(col.el).toHaveCls(filterCls);
                    });
                });

                it("should add the cls for columns when setting a value", function() {
                    makeGrid();

                    cols = grid.getColumns();
                    col = cols.filter(function(col) {
                        return col.getDataIndex() === 'company';
                    })[0];

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        gridEvents = null;
                        plugin.getBar().down('textfield').setValue('Adobe');
                    });

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        expect(col.el).toHaveCls(filterCls);
                    });
                });

                it("should remove the cls for columns when clearing a value", function() {
                    makeGrid();

                    cols = grid.getColumns();
                    col = cols.filter(function(col) {
                        return col.getDataIndex() === 'company';
                    })[0];

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        gridEvents = null;
                        plugin.getBar().down('textfield').setValue('Adobe');
                    });

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        expect(col.el).toHaveCls(filterCls);
                    });

                    runs(function() {
                        gridEvents = null;
                        plugin.getBar().down('textfield').setValue('');
                    });

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        expect(col.el).not.toHaveCls(filterCls);
                    });
                });
            });
        });

        // Scrollbar Focus Bug Tests (EXTJS_30089)
        describe('scrollbar focus behavior', function() {
            describe('Normal Operation', function() {
                it('should transfer focus from filter field to grid cell normally', function() {
                    makeScrollableGrid();

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        var companyFilter = plugin.getBar().down('textfield'),
                            filterInput = companyFilter.inputElement.dom;

                        companyFilter.focus();

                        expect(document.activeElement).toBe(filterInput);
                        expect(companyFilter.hasFocus).toBe(true);
                    });

                    runs(function() {
                        var firstRow = grid.getItemAt(0),
                            personCell = firstRow.getCells()[1]; // Second column (Person)

                        jasmine.fireMouseEvent(personCell.element.dom, 'click');
                    });

                    runs(function() {
                        // Verify focus transferred to grid cell
                        var companyFilter = plugin.getBar().down('textfield'),
                            selectable = grid.getSelectable(),
                            selection = selectable.getSelection();

                        expect(companyFilter.hasFocus).toBe(false);
                        expect(selection.getCount()).toBeGreaterThan(0);
                    });
                });
            });

            describe('Navigation Model lastLocation Management', function() {
                it('should set lastLocation to "scrollbar" on touchstart and clear on touchend', function() {
                    makeScrollableGrid();

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        var navigationModel = grid.getNavigationModel(),
                            scrollable = grid.getScrollable(),
                            scrollbarEl = scrollable.getElement('x'),
                            scrollbarRect, x, y, mockTouchStartEvent, mockTouchEndEvent;

                        if (scrollbarEl) {
                            // Get coordinates for scrollbar area
                            scrollbarRect = scrollbarEl.dom.getBoundingClientRect();
                            x = scrollbarRect.left + (scrollbarRect.width / 2);
                            y = scrollbarRect.top + (scrollbarRect.height / 2);

                            // Create a mock touch event that will target the scrollbar
                            mockTouchStartEvent = {
                                type: 'touchstart',
                                preventDefault: jasmine.createSpy('preventDefault'),
                                getTarget: jasmine.createSpy('getTarget').andCallFake(function(selector) {
                                    if (selector === grid.scrollbarSelector) {
                                        return scrollbarEl.dom; // Return scrollbar element for scrollbarSelector
                                    }

                                    if (selector === grid.itemSelector) {
                                        return null; // No item target
                                    }

                                    return null;
                                }),
                                getPoint: jasmine.createSpy('getPoint').andReturn({ x: x, y: y })
                            };

                            // Call the method directly
                            grid._checkScrollbarTouch(mockTouchStartEvent);

                            // Check that lastLocation is set to 'scrollbar'
                            expect(navigationModel.lastLocation).toBe('scrollbar');
                            expect(mockTouchStartEvent.preventDefault).toHaveBeenCalled();

                            // Create mock touchend event
                            mockTouchEndEvent = {
                                type: 'touchend',
                                preventDefault: jasmine.createSpy('preventDefault'),
                                getTarget: jasmine.createSpy('getTarget').andCallFake(function(selector) {
                                    if (selector === grid.scrollbarSelector) {
                                        return scrollbarEl.dom; // Return scrollbar element for scrollbarSelector
                                    }

                                    if (selector === grid.itemSelector) {
                                        return null; // No item target
                                    }

                                    return null;
                                }),
                                getPoint: jasmine.createSpy('getPoint').andReturn({ x: x, y: y })
                            };

                            // Call the method directly for touchend
                            grid._checkScrollbarTouch(mockTouchEndEvent);

                            // Check that lastLocation is cleared
                            expect(navigationModel.lastLocation).toBeNull();
                            expect(mockTouchEndEvent.preventDefault).toHaveBeenCalled();
                        }
                    });
                });

                it('should handle native scrollbar interactions correctly', function() {
                    makeScrollableGrid();

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                   runs(function() {
                        var navigationModel = grid.getNavigationModel(),
                            x = 600,
                            y = 100,
                            mockTouchStartEvent, mockTouchEndEvent;

                        mockTouchStartEvent = {
                            type: 'touchstart',
                            preventDefault: jasmine.createSpy('preventDefault'),
                            getTarget: jasmine.createSpy('getTarget').andCallFake(function(selector) {
                                // Return null for both scrollbarSelector and itemSelector
                                return null;
                            }),
                            getPoint: jasmine.createSpy('getPoint').andReturn({ x: x, y: y })
                        };

                        // Mock bodyElement.getClientRegion().contains() to return false
                        spyOn(grid.bodyElement, 'getClientRegion').andReturn({
                            contains: jasmine.createSpy('contains').andReturn(false)
                        });

                        // Call the method directly
                        grid._checkScrollbarTouch(mockTouchStartEvent);

                        expect(navigationModel.lastLocation).toBe('scrollbar');
                        expect(mockTouchStartEvent.preventDefault).toHaveBeenCalled();

                        // Test touchend clears the location
                        mockTouchEndEvent = {
                            type: 'touchend',
                            preventDefault: jasmine.createSpy('preventDefault'),
                            getTarget: jasmine.createSpy('getTarget').andReturn(null),
                            getPoint: jasmine.createSpy('getPoint').andReturn({ x: x, y: y })
                        };

                        grid._checkScrollbarTouch(mockTouchEndEvent);

                        expect(navigationModel.lastLocation).toBeNull();
                        expect(mockTouchEndEvent.preventDefault).toHaveBeenCalled();
                    });
                });
            });

            describe('Integration with Cell Editing', function() {
                it('should not interfere with cell editing when scrollbar is used', function() {
                    makeScrollableGrid();

                    waitsFor(function() {
                        return gridEvents && gridEvents.done;
                    }, 'grid to be ready');

                    runs(function() {
                        var cellEditingPlugin = grid.getPlugin('cellediting'),
                            firstRow = grid.getItemAt(0);

                        // Start editing
                        cellEditingPlugin.startEdit(firstRow, colMap.c1);

                        expect(cellEditingPlugin.getActiveEditor()).toBeTruthy();
                    });

                    runs(function() {
                        // Simulate scrollbar interaction while editing
                        var scrollable = grid.getScrollable(),
                            scrollbarEl = scrollable.getElement('x'),
                            touchStartEvent, touchEndEvent, cellEditingPlugin;

                        if (scrollbarEl) {
                            touchStartEvent = new Event('touchstart', { bubbles: true, cancelable: true });
                            touchEndEvent = new Event('touchend', { bubbles: true, cancelable: true });

                            Object.defineProperty(touchStartEvent, 'target', { value: scrollbarEl.dom, enumerable: true });
                            Object.defineProperty(touchEndEvent, 'target', { value: scrollbarEl.dom, enumerable: true });

                            grid.bodyElement.dom.dispatchEvent(touchStartEvent);
                            scrollable.scrollTo(50, null);
                            grid.bodyElement.dom.dispatchEvent(touchEndEvent);
                        }

                        // Cell editing should still be active
                        cellEditingPlugin = grid.getPlugin('cellediting');

                        expect(cellEditingPlugin.getActiveEditor()).toBeTruthy();
                    });
                });
            });
        });
    });
});
