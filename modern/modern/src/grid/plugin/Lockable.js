/**
 * This class is a grid plugin that adds locking features to the existing
 * Modern grid. It attempts to achieve the same functionality as
 * Ext.grid.locked.Grid using CSS to lock left and right regions reducing
 * the complexity of managing three different grids and all their configurations.
 * 
 * @since 8.0.0
 */
Ext.define('Ext.grid.plugin.Lockable', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.lockable',

    requires: ['Ext.grid.lockable.Divider'],

    lockedCls: Ext.baseCSSPrefix + 'css-locked-grid',

    config: {
        columnMenu: {
            items: {
                region: {
                    text: 'Locked',
                    iconCls: 'fi-lock',
                    menu: {}
                }
            }
        },

        regions: {
            left: {
                menuItem: {
                    text: 'Locked (Left)',
                    iconCls: 'fi-chevron-left'
                },
                weight: -10
            },
            center: {
                flex: 1,
                menuItem: {
                    text: 'Unlocked',
                    iconCls: 'fi-unlock'
                },
                weight: 0
            },
            right: {
                menuItem: {
                    text: 'Locked (Right)',
                    iconCls: 'fi-chevron-right'
                },
                weight: 10
            }
        }

    },

    setCmp: function(cmp) {
        this.cmp = cmp;

        if (cmp && cmp.isGrid && !cmp.isCssLockedGrid) {
            this.decorate(cmp);
            cmp.addCls(this.lockedCls); // permits sass encapsulation.
        }
        else {
            Ext.log.error('Lockable plugin can only be used included for ' +
                'Ext.grid.Grid based classes.');
        }
    },

    statics: {
        decorate: function(target) {
            var plugin = this;

            // Override grid component with specialized locked grid methods
            Ext.override(target, {
                // differentiate between lockable plugin and Ext.grid.locked.Grid
                isCssLockedGrid: true,

                manageHorizontalOverflow: false,

                getRegions: function() {
                    return plugin.getRegions();
                },
                onScrollMove: function(x, y) {
                    var me = this,
                        scroller = me.getScrollable();

                    me.callParent([x, y]);

                    if (scroller && (scroller.getMaxPosition().x === x || x === 0)) {
                        Ext.unasap(me.timerId);
                        me.timerId = Ext.asap(function() {
                            plugin.refreshRegions(true, x, y);
                        });
                    }
                },
                getRegionWidth: function(region) {
                    var grid = this,
                        scrollbarWidth = grid.getScrollable().getScrollbarSize().width || 0,
                        regionColumns = grid.getVisibleColumns().filter(function(column) {
                            return column.getRegion() === region;
                        }),
                        width = 0;

                    if (regionColumns) {
                        width = regionColumns.reduce(function(adder, col) {
                            return adder + col.getComputedWidth();
                        }, 0);
                    }

                    if (region === 'right' && width) {
                        width += scrollbarWidth;
                    }

                    return width;
                },

                getCenterRegionBox: function() {
                    var grid = this,
                        gridBox = grid.el.getBox(),
                        borders = grid.el.getBorders(),
                        borderPadding = grid.el.getBorderPadding(),
                        leftOffset = borderPadding.beforeX - borders.beforeX,
                        left = grid.getRegionWidth('left') + leftOffset,
                        rightBase = gridBox.right - gridBox.left - borderPadding.afterX,
                        right = rightBase - grid.getRegionWidth('right'),
                        height = gridBox.height - (borderPadding.beforeY + borderPadding.afterY);

                    right = right - (borderPadding.afterX - borders.afterX);

                    return {
                        x: left,
                        y: gridBox.y,
                        left: left,
                        right: right,
                        width: right - left,
                        height: height
                    };
                },

                getRegionOffsets: function() {
                    var grid = this,
                        scroller = grid.getScrollable(),
                        position = scroller.getPosition(),
                        scrollerSize = scroller.getSize(),
                        clientSize = scroller.getClientSize(),
                        leftOffset = 0,
                        rightOffset = 0,
                        overflow;

                    if (scrollerSize) {
                        overflow = clientSize.x - scrollerSize.x;
                        leftOffset = position.x;
                        rightOffset = leftOffset + overflow;
                    }

                    return {
                        left: leftOffset,
                        right: rightOffset
                    };
                },

                /**
                 * @return {Boolean} true if grid currently has locked regions
                 */
                hasLockedRegions: function() {
                    var me = this,
                        hasLockedColumns = me.getVisibleColumns().find(function(column) {
                            return column.getLocked();
                        });

                    return hasLockedColumns;
                },

                /**
                 * @return {Array} of locked columns
                 */
                getLockedColumns: function() {
                    return this.getColumns().filter(function(column) {
                        return column.isLocked();
                    });
                }
            });
        }
    },

    init: function(grid) {
        var me = this,
            scrollable = grid.getScrollable(),
            existingMenu = grid.getColumnMenu() || {},
            lockableMenu = me.getColumnMenu(),
            headerCt = grid.getHeaderContainer(),

            // Perform deep merge to preserve existing menu items
            mergedMenu = Ext.merge({}, existingMenu);

        // Ensure items object exists
        if (!mergedMenu.items) {
            mergedMenu.items = {};
        }

        // Add lockable menu items without overwriting existing ones
        Ext.apply(mergedMenu.items, lockableMenu.items);

        // Add locked regions to column menus
        grid.setColumnMenu(mergedMenu);

        // Setup region dividers
        me.createDividers();

        scrollable.on({
            scope: me,
            scroll: 'onContainerScroll',
            scrollend: 'onContainerScroll'
        });

        // relay events from header container to grid. There appears to be
        // confusion about which component should fire this. Documentation
        // says this event is fired on the grid, but it is actually fired
        // on the headerContainer
        headerCt.on({
            scope: me,
            columnadd: 'onColumnAdd',
            columnremove: 'onColumnRemove',
            columnlockedchange: 'onColumnLockedChange'
        });

        grid.on({
            scope: me,
            hide: 'onHide',
            viewready: 'refreshRegions',
            resize: 'refreshRegions',
            columnremove: 'refreshRegions',
            columnhide: 'refreshRegions',
            columnshow: 'refreshRegions',
            columnmove: 'refreshRegions',
            columnresize: 'refreshRegions',
            beforeshowcolumnmenu: 'onBeforeShowColumnMenu'
        });
    },

    destroy: function() {
        if (this.destroyDividers) {
            this.destroyDividers();
        }

        this.callParent(arguments);
    },

    privates: {

        onHide: function() {
            this.cmp.whenVisible('refresh');
        },

        onColumnRemove: function(headerCt, column) {
            // When a column is removed from grid - clear its locked value
            column._locked = null;
        },

        onColumnLockedChange: function(sourceCmp, targetRegion, sourceRegion) {
            if (sourceCmp.parent.isRootHeader) {
                sourceCmp._locked = targetRegion;
            }
            else {
                sourceCmp._locked = false;
            }

            sourceCmp.getGrid().fireEvent('columnlockedchange');
            sourceCmp.updateLockedCls(targetRegion);
            this.refreshRegions(true, 1);
        },

        onColumnAdd: function(grid, column, index) {
            column.updateLockedCls(column.getRegion());
            this.refreshRegions(true, 1);
        },

        createDividers: function() {
            var me = this,
                grid = me.getCmp(),
                regions = ['left', 'right'],
                region, divider, i;

            me._regionDividers = me._regionDividers || [];
            // Destroy any existing dividers before creating new ones
            me.destroyDividers();

            for (i = 0; i < regions.length; i++) {
                region = regions[i];
                divider = Ext.factory({
                    type: 'regiondivider',
                    grid: grid,
                    region: region
                }, 'Ext.grid.lockable.Divider');
                divider.render(grid.el);
                me._regionDividers.push(divider);
            }
        },

        destroyDividers: function() {
            if (this._regionDividers) {
                this._regionDividers.forEach(function(divider) {
                    if (divider && !divider.destroyed) {
                        divider.destroy();
                    }
                });
                this._regionDividers = [];
            }
        },

        onContainerScroll: function(scroller, x, y, dx, dy) {
            // Only refresh if horizontal scroll detected
            if (dx !== 0) {
                this.refreshRegions(true, dx, x);
            }

        },

        refreshRegions: function(isScroll, dx, x) {
            var me = this,
                grid = me.getCmp(),
                scroller = grid.getScrollable(),
                offsets = grid.getRegionOffsets(),
                baseCSSPrefix = '.' + Ext.baseCSSPrefix,
                baseSelector = baseCSSPrefix + 'locked',
                lockedLeft = grid.el.query(baseSelector + baseCSSPrefix + 'locked-left'),
                lockedRight = grid.el.query(baseSelector + baseCSSPrefix + 'locked-right'),
                centerBox = grid.getCenterRegionBox(),
                lockedLeftLen = lockedLeft.length,
                lockedRightLen = lockedRight.length,
                firstRow, cellsMarginLeft, adjustedLeftOffset,
                adjustedRightOffset,
                translateLeft, translateRight,
                i, j, previousSibling;

            // Apply margin adjustment only when bufferedColumns is enabled
            if (grid.bufferedColumns) {
                // Get the margin-left from the first row's cellsElement
                firstRow = grid.down('gridrow');

                if (firstRow && firstRow.cellsElement) {
                    cellsMarginLeft = firstRow.cellsElement.getMargin('l') || 0;
                }

                // Adjust the left offset by subtracting the cells margin
                adjustedLeftOffset = offsets.left <= 0
                    ? 0
                    : offsets.left - cellsMarginLeft;
                adjustedLeftOffset = 'translate3d(' + adjustedLeftOffset + 'px, 0px, 0px)';
            }

            translateLeft = 'translate3d(' + offsets.left + 'px, 0px, 0px)';
            translateRight = 'translate3d(' + offsets.right + 'px, 0px, 0px)';

            if (dx) {
                for (i = 0; i < lockedLeftLen; i++) {
                    if (!grid.bufferedColumns ||
                        lockedLeft[i].classList.contains(Ext.baseCSSPrefix + 'gridcolumn')) {
                        lockedLeft[i].style.transform = translateLeft;
                    }
                    else {
                        lockedLeft[i].style.transform = adjustedLeftOffset;
                    }
                }

                for (j = 0; j < lockedRightLen; j++) {
                    if (!grid.bufferedColumns ||
                        lockedRight[j].classList.contains(Ext.baseCSSPrefix + 'gridcolumn') ||
                    !scroller.getMaxPosition().x) {
                        lockedRight[j].style.transform = translateRight;
                    }
                    else {
                        previousSibling = Ext.get(lockedRight[j].previousSibling);

                        if (!previousSibling) {
                            continue;
                        }

                        if (!previousSibling.hasCls(Ext.baseCSSPrefix + 'locked-right')) {
                            adjustedRightOffset = centerBox.right -
                         previousSibling.getBox().right;

                            lockedRight[j].style.transform =
                        'translate3d(' + adjustedRightOffset + 'px, 0px, 0px)';
                        }
                        else {
                            lockedRight[j].style.transform = previousSibling.el.dom.style.transform;
                        }
                    }
                }
            }

            // Update scroller to be visible only in the center region
            if (scroller.isVirtualScroller && isScroll !== true) {
                // keep this order until we reconfigure with better locked
                // grid info to pass to scrollers
                scroller.setHasRightRegion(lockedRight.length > 0);
                scroller.setUserClientX(centerBox.left);
                scroller.setUserClientSize({
                    x: centerBox.width,
                    y: centerBox.height
                });
            }
        },

        onBeforeShowColumnMenu: function(grid, column, menu) {
            var me = this,
                regionMenus = me.getRegions(),
                current = column.getRegion(),
                disabled = false,
                lockedColumns = grid.getLockedColumns(),
                visibleColumns = grid.getVisibleColumns(),
                items, isLastUnlockedColumn;

            menu = menu.getComponent('region');

            if (!menu) {
                return;
            }

            // This column is always locked - hide locked column menu item
            if (column.getAlwaysLocked()) {
                menu.setHidden(true);
            }

            menu = menu.getMenu();
            menu.removeAll();
            items = [];
            disabled = !!(grid.isDefaultPartner && grid.getVisibleColumns().length === 1);

            isLastUnlockedColumn = visibleColumns.length === lockedColumns.length + 1;

            if (isLastUnlockedColumn && !column.isLocked()) {
                // All other columns are locked - disable locking last one column
                disabled = true;
            }

            Ext.Object.each(regionMenus, function(region) {
                items.push(Ext.applyIf({
                    disabled: disabled || region === current,
                    handler: me.handleChangedRegion.bind(me, region, column)
                }, regionMenus[region].menuItem));
            });
            menu.add(items);
        },

        handleChangedRegion: function(region, column) {
            column.setLocked(region);
        }
    }

}, function(plugin) {
    plugin.prototype.decorate = plugin.decorate;
});
