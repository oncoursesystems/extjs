/**
 * Region divider for css locked grid
 */
Ext.define('Ext.grid.lockable.Divider', {
    extend: 'Ext.Component',
    xtype: 'regiondivider',

    config: {
        grid: null,
        region: null
    },

    width: 2,

    baseCls: Ext.baseCSSPrefix + 'grid-region-divider',

    initialize: function() {
        var me = this;

        me.getGrid().on({
            scope: me,
            viewready: 'showDivider',
            refresh: 'showDivider',
            resize: 'showDivider',
            columnadd: 'showDivider',
            columnremove: 'showDivider',
            columnhide: 'showDivider',
            columnshow: 'showDivider',
            columnresize: 'showDivider',
            columnlockedchange: 'showDivider'
        });
    },

    /**
     * @method
     * Calculates divider height and top position as well as if the divider should be
     * displayed or not based on right/left region content.
     *
     */
    showDivider: function() {
        var me = this,
            grid = me.getGrid(),
            region = me.getRegion(),
            height = grid.bodyElement.getSize().height,
            scrollMax = grid.getScrollable().getMaxPosition().x,
            regionWidth = grid.getRegionWidth(region),
            visible = !!regionWidth,
            x = 0,
            y = 0,
            i, item, docked, xtype, dockedItems, gridBox, borders, borderPadding, dockedItemsLength,
            leftRegionWidth, rightRegionWidth, centerRegionWidth, totalAvailableWidth,
            borderAdjustment;

        if (visible) {
            dockedItems = grid.getDockedItems();
            gridBox = grid.el.getBox();
            borders = grid.el.getBorders();
            borderPadding = grid.el.getBorderPadding();

            if (region === 'left') {
                x = regionWidth + (borderPadding.beforeX - borders.beforeX);
            }
            else {
                leftRegionWidth = grid.getRegionWidth('left') || 0;
                rightRegionWidth = grid.getRegionWidth('right') || 0;
                centerRegionWidth = grid.getRegionWidth('center') || 0;

                totalAvailableWidth = gridBox.right - gridBox.left;
                totalAvailableWidth -= (borderPadding.beforeX + borderPadding.afterX);

                // Position divider at the boundary between center and right regions
                // If there's horizontal scrolling, the center region might be wider than visible
                if (scrollMax > 0) {
                    // When scrolling is present, position based on actual visible area
                    borderAdjustment = borderPadding.beforeX - borders.beforeX;
                    x = totalAvailableWidth - rightRegionWidth + borderAdjustment;
                }
                else {
                    // No scrolling, use left + center width
                    borderAdjustment = borderPadding.beforeX - borders.beforeX;
                    x = leftRegionWidth + centerRegionWidth + borderAdjustment;
                }
            }

            dockedItemsLength = dockedItems.length;

            for (i = 0; i < dockedItemsLength; i++) {
                item = dockedItems[i];
                docked = item.getDocked();

                switch (docked) {
                    case 'top':
                        xtype = item.xtype;

                        if (xtype === 'headercontainer' || xtype === 'fieldpanel' ||
                            xtype === 'container' || xtype === 'panel') {
                            height += item.getSize().height;
                            break;
                        }

                        y += item.getSize().height;
                        break;
                    case 'bottom':
                        height += item.getSize().height;
                        break;
                }
            }

            me.setHeight(height);
            me.setXY(x, y);
        }

        me.setVisibility(visible);
    }
});
