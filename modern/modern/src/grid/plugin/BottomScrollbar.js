/**
 * A simplified bottom scrollbar component for ExtJS grids.
 * Provides horizontal scrolling control with navigation buttons and slider.
 * 
 * @since 8.0.0
 */
Ext.define('Ext.grid.plugin.BottomScrollbar', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.gridbottomscrollbar',

    config: {
        /**
         * @cfg {Object} scrollbarConfig
         * Configuration for the scrollbar container.
         * **Note** that this config is only meaningful at the Component rendering time,
         * and setting it after that will do nothing.
         * 
         * @since 8.0.0
         */
        scrollbarContainer: {
            xtype: 'container',
            docked: 'bottom',
            cls: Ext.baseCSSPrefix + 'gridbottomscrollbar',
            layout: { type: 'hbox', align: 'stretch' },
            minHeight: 30
        },

        /**
         * @cfg {Object}
         * A configuration object for the left navigation button.
         * 
         * @since 8.0.0
         */
        leftButton: {
            xtype: 'button',
            iconCls: Ext.baseCSSPrefix + 'pagingtoolbar-prev'
        },

        /**
         * @cfg {Object}
         * A configuration object for the right navigation button.
         * 
         * @since 8.0.0
         */
        rightButton: {
            xtype: 'button',
            iconCls: Ext.baseCSSPrefix + 'pagingtoolbar-next'
        },

        /**
         * @cfg {Object}
         * A configuration object for the slider component.
         * 
         * @since 8.0.0
         */
        sliderField: {
            xtype: 'slider',
            flex: 1,
            minValue: 0,
            maxValue: 100,
            value: 0
        },

        /**
         * @private
         * 
         * @since 8.0.0
         */
        grid: null
    },

    /**
     * Initializes the plugin with the grid component
     * @param {Ext.grid.Grid} grid The grid component to attach the plugin to
     */
    init: function(grid) {
        var me = this,
            scrollable = grid.getScrollable(),
            indicators, existingY;

        me.setGrid(grid);
        me.createScrollbar();
        me.setupScrollListeners();

        if (scrollable.type !== 'virtual') {
            scrollable.setX(false);
            grid.bodyElement.on('wheel', me.onWheel, me);
        }
        else {
            indicators = scrollable.getIndicators();
            existingY = typeof indicators === 'string' ? indicators : indicators.y;
            scrollable.setIndicators({ x: false, y: existingY });
        }

        grid.on('painted', me.updateScrollbarState, me, {
            single: true
        });
        grid.on('destroy', me.destroy, me);
    },

    onWheel: function(e) {
        var grid = this.getGrid(),
            scrollable = grid.getScrollable();

        if (!scrollable || !e.shiftKey) {
            return;
        }

        scrollable.scrollBy(e.deltaY, 0);
    },

    applyScrollbarContainer: function(scrollbarContainer, oldScrollbarContainer) {
        return Ext.factory(scrollbarContainer, Ext.Container, oldScrollbarContainer);
    },

    applyLeftButton: function(leftButton, oldLeftButton) {
        return Ext.factory(leftButton, Ext.Button, oldLeftButton);
    },

    applyRightButton: function(rightButton, oldRightButton) {
        return Ext.factory(rightButton, Ext.Button, oldRightButton);
    },

    applySliderField: function(sliderField, oldSliderField) {
        return Ext.factory(sliderField, Ext.slider.Single, oldSliderField);
    },

    /**
     * Creates the bottom scrollbar with navigation buttons and slider
     */
    createScrollbar: function() {
        var me = this,
            grid = me.getGrid(),
            scrollbarContainer = me.getScrollbarContainer(),
            leftButton = me.getLeftButton(),
            rightButton = me.getRightButton(),
            sliderField = me.getSliderField();

        // Set up event handlers after component creation
        leftButton.on('tap', me.scrollToStart, me);
        rightButton.on('tap', me.scrollToEnd, me);

        sliderField.on({
            change: me.onSliderChange,
            drag: me.onSliderDrag,
            dragstart: me.onSliderDragStart,
            dragend: me.onSliderDragEnd,
            scope: me
        });

        // Add components to container
        scrollbarContainer.setItems([
            leftButton,
            sliderField,
            rightButton
        ]);

        // Like a grid cell the scrollbar container should not participate in focus
        scrollbarContainer.el.setTabIndex(-1);
        // Add container to grid
        grid.add(scrollbarContainer);
    },

    /**
     * Sets up event listeners for scroll synchronization and column changes
     */
    setupScrollListeners: function() {
        var me = this,
            grid = me.getGrid(),
            scroller = grid.getScrollable(),
            headerContainer;

        if (scroller) {
            scroller.on({
                scroll: me.syncSlider,
                scope: me
            });
        }

        // Update on column changes
        headerContainer = grid.getHeaderContainer();

        if (headerContainer) {
            headerContainer.on('columnschanged', me.updateScrollbarState, me);
        }
    },

    /**
     * Scrolls the grid to the beginning (leftmost position)
     */
    scrollToStart: function() {
        var grid = this.getGrid();

        grid.getScrollable().scrollTo(0, null, true);
    },

    /**
     * Scrolls the grid to the end (rightmost position)
     */
    scrollToEnd: function() {
        var grid = this.getGrid(),
            scroller = grid.getScrollable();

        scroller.scrollTo(scroller.getMaxPosition().x, null, true);
    },

    /**
     * Handles slider value changes and scrolls the grid accordingly
     * @param {Ext.slider.Slider} slider The slider component
     * @param {Ext.slider.Thumb} thumb The new slider thumb
     * @param {Number} newValue The new slider value
     */
    onSliderChange: function(slider, thumb, newValue) {
        var me = this;

        if (!me.ignoreSliderChange && !me.isDragging) {
            me.doScrollMove(newValue, true);
        }
    },

    /**
     * Handler for slider drag events with throttling
     * @param {Ext.slider.Single} slider The slider component
     */
    onSliderDrag: function(slider) {
        var me = this;

        if (!me.dragTimer) {
            me.dragTimer = Ext.defer(function() {
                me.doScrollMove(slider.getValue(), true);
                me.dragTimer = null;
            }, 0);
        }
    },

    /**
     * Handler for slider drag start
     */
    onSliderDragStart: function() {
        this.isDragging = true;
    },

    /**
     * Handler for slider drag end
     * @param {Ext.slider.Single} slider The slider component
     */
    onSliderDragEnd: function(slider) {
        var me = this;

        Ext.undefer(me.dragTimer);
        me.dragTimer = null;

        me.isDragging = false;
        me.doScrollMove(slider.getValue());
    },

    /**
     * Performs horizontal scrolling based on slider value
     * @param {Number} sliderValue The current slider value
     * @param {Boolean} skipAnimation Whether to skip scroll animation
     */
    doScrollMove: function(sliderValue, skipAnimation) {
        var me = this,
            grid = me.getGrid(),
            scroller = grid.getScrollable(),
            maxScroll, scrollTo;

        if (scroller) {
            maxScroll = scroller.getMaxPosition().x;

            if (maxScroll > 0) {
                scrollTo = (sliderValue / 100) * maxScroll;
                scroller.scrollTo(scrollTo, null, !skipAnimation);
            }
        }
    },

    /**
     * Synchronizes slider position with actual scroll position
     * @param {Ext.scroll.Scroller} scroller The grid's scroller component
     * @param {Number} x The current horizontal scroll position
     */
    syncSlider: function(scroller, x) {
        var me = this,
            sliderField = me.getSliderField(),
            maxScroll = scroller.getMaxPosition().x,
            percentage;

        if (maxScroll > 0 && sliderField) {
            percentage = (x / maxScroll) * 100;
            me.ignoreSliderChange = true;
            sliderField.setValue(Math.round(percentage));
            me.ignoreSliderChange = false;
        }
    },

    /**
     * Updates scrollbar component states based on scroll necessity
     */
    updateScrollbarState: function() {
        var me = this,
            grid = me.getGrid(),
            sliderField = me.getSliderField(),
            leftButton = me.getLeftButton(),
            rightButton = me.getRightButton(),
            scroller, maxScroll, needsScroll;

        if (!sliderField || me.destroyed) {
            return;
        }

        scroller = grid.getScrollable();
        maxScroll = scroller.getMaxPosition().x;
        needsScroll = maxScroll > 0;

        sliderField.setDisabled(!needsScroll);
        leftButton.setDisabled(!needsScroll);
        rightButton.setDisabled(!needsScroll);

        if (!needsScroll) {
            sliderField.setValue(0);
        }
    },

    /**
     * Shows the scrollbar component
     */
    show: function() {
        var scrollbarContainer = this.getScrollbarContainer();

        if (scrollbarContainer) {
            scrollbarContainer.show();
        }
    },

    /**
     * Hides the scrollbar component
     */
    hide: function() {
        var scrollbarContainer = this.getScrollbarContainer();

        if (scrollbarContainer) {
            scrollbarContainer.hide();
        }
    },

    /**
     * Cleans up resources and destroys the plugin
     */
    destroy: function() {
        var me = this,
            grid = me.getGrid(),
            scroller = grid && grid.getScrollable();

        // Clear any pending timers
        Ext.undefer(me.dragTimer);
        me.dragTimer = null;

        if (me.scrollHandler && scroller) {
            scroller.un('scroll', me.scrollHandler);
        }

        // Components will be destroyed automatically by their containers
        me.setGrid(null);
        me.callParent();
    }
});
