/**
 * @class Ext.grid.menu.VirtualColumns
 * @extends Ext.grid.menu.Shared
 * 
 * This class provides a virtual columns menu for Ext JS grids. its only for virtual columns.
 * This class is created by `Ext.grid.Grid` used buffered column to display the columns in a menu.
 * Enhanced version with list and filtering for handling large numbers of columns.
 * It allows users to search for columns and toggle their visibility with advanced features
 * including search filtering, scrollable lists, and prevention of hiding all columns.
 * 
 * ## Features
 * - Search functionality to filter columns by text
 * - Scrollable column list for handling many columns
 * - Configurable appearance and behavior
 * - Prevention of hiding all columns (optional)
 * - Case-sensitive and partial matching search options
 * 
 * 
 * @since 8.0.0
 */
Ext.define('Ext.grid.menu.VirtualColumns', {
    extend: 'Ext.grid.menu.Shared',

    xtype: 'gridvirtualcolumnsmenu',

    iconCls: Ext.baseCSSPrefix + 'headermenu-columns-icon',

    classCls: Ext.baseCSSPrefix + 'grid-virtual-columns-menu',

    config: {
        /**
         * @cfg {String} text
         * The menu item text for the column visibility sub-menu.
         * This text appears as the menu item label when the column menu is displayed.
         * @locale
         * 
         * @since 8.0.0
         */
        text: 'Columns',

        /**
         * @cfg {String} searchPlaceholder
         * Placeholder text for the search field that appears when no text is entered.
         * Provides user guidance on the search functionality.
         * 
         * @since 8.0.0
         */
        searchPlaceholder: 'Search columns',

        /**
         * @cfg {Boolean} searchEnabled
         * Whether to show the search field in the column menu.
         * When enabled, users can filter columns by typing in the search box.
         * 
         * @since 8.0.0
         */
        searchEnabled: true,

        /**
         * @cfg {String} menuHeight
         * Height of the menu panel (CSS value).
         * Supports CSS units like 'px', '%', 'vh', 'em', etc.
         * Recommended to use viewport height (vh) for responsive design.
         * 
         * @since 8.0.0
         */
        menuHeight: '30vh',

        /**
         * @cfg {String} menuMargin
         * Margin configuration for the menu panel using ExtJS margin syntax.
         * Format: 'top right bottom left' or single value for all sides.
         * 
         * @since 8.0.0
         */
        menuMargin: 0,

        /**
         * @cfg {Boolean} scrollable
         * Whether the columns list should be scrollable when content exceeds container height.
         * Essential for grids with many columns to maintain usability.
         * 
         * @since 8.0.0
         */
        scrollable: true,

        /**
         * @cfg {Object} listStoreConfig
         * Configuration object for the internal list store that holds column data.
         * it maps the column data to the list items.
         * 
         * @since 8.0.0
         */
        listStoreConfig: {
            fields: ['id', 'text', 'column', 'hidden', 'hideable', 'disabled'],
            proxy: {
                type: 'memory'
            }
        },

        /**
         * @cfg {String/Ext.XTemplate} itemTpl
         * Custom template for list items. If not provided, uses the default template.
         * Can be a template string or an Ext.XTemplate instance.
         * Template receives record data with fields: id, text, column, hidden, hideable, disabled.
         */
        itemTpl: [
            '<div class="' + Ext.baseCSSPrefix + 'unselectable ',
            Ext.baseCSSPrefix + 'has-left-icon ',
            Ext.baseCSSPrefix + 'menucheckitem ',
            Ext.baseCSSPrefix + 'menuitem ',
            Ext.baseCSSPrefix + 'component ',
            '{[values.disabled ? "' + Ext.baseCSSPrefix + 'item-disabled" : ""]} ',
            '{[values.hidden ? "" : "' + Ext.baseCSSPrefix + 'checked"]}">',
            '<div class="' + Ext.baseCSSPrefix + 'body-el ' + Ext.baseCSSPrefix + 'unselectable">',
            '<div class="' + Ext.baseCSSPrefix + 'left-icon-wrap-el ',
            Ext.baseCSSPrefix + 'icon-wrap-el">',
            '<div class="' + Ext.baseCSSPrefix + 'left-icon-el ',
            Ext.baseCSSPrefix + 'icon-el ',
            Ext.baseCSSPrefix + 'font-icon ',
            Ext.baseCSSPrefix + 'checkbox-icon-el"></div>',
            '</div>',
            '<div class="' + Ext.baseCSSPrefix + 'text-el">',
            '&nbsp;&nbsp;{text}</div>',
            '<input type="checkbox" class="' + Ext.baseCSSPrefix + 'checkbox-el" ',
            'value="{text}" ',
            '{[values.hidden ? "" : "checked"]} ',
            '{[values.disabled ? "disabled" : ""]} ',
            'aria-label="{text}" ',
            '{[values.disabled ? "" : "tabindex=\\"0\\""]} />',
            '</div>',
            '</div>'
        ],

        /**
         * @cfg {Object/Ext.field.Text} searchField
         * Configuration for the search field component or the component instance itself.
         * When provided as a config object, it will be merged with default search field config.
         * 
         * @since 8.0.0
         */
        searchField: {
            placeholder: null, // Will be set from searchPlaceholder
            margin: '5 5 0 5'
        },

        /**
         * @cfg {Object/Ext.dataview.List} columnsList
         * Configuration for the columns list component or the component instance itself.
         * When provided as a config object, it will be merged with default list configuration.
         * 
         * @since 8.0.0
         */
        columnsList: {
            flex: 1
            // Note: store and itemTpl are set dynamically in the applier
        },

        /**
         * @cfg {Object/Ext.panel.Panel} menuPanel
         * Configuration for the main menu panel component or the component instance itself.
         * When provided as a config object, it will be merged with default panel configuration.
         * 
         * @since 8.0.0
         */
        menuPanel: {
            minWidth: 150,
            height: null, // Will be set from menuHeight
            cls: Ext.baseCSSPrefix + 'grid-virtual-columns-menu-panel',
            layout: 'vbox',
            margin: null, // Will be set from menuMargin
            items: null // Will be populated with searchField and columnsList
        }
    },

    menu: {},

    /**
     * @method initialize
     * Initializes the component by setting up the menu panel and event listeners.
     * Called automatically during component instantiation.
     * 
     * The applier methods will handle component creation automatically.
     */
    initialize: function() {
        var me = this;

        me.callParent();

        // Set up event listeners after components are created
        me.setupEventListeners();

        // Add the panel to the menu - the applier will ensure it's created
        me.getMenu().add(me.getMenuPanel());
    },

    /**
     * @method setupEventListeners
     * Sets up event listeners on the child components.
     * Called once during initialization.
     * @private
     */
    setupEventListeners: function() {
        var searchField = this.getSearchField(),
            columnsList = this.getColumnsList();

        if (searchField) {
            searchField.on({
                change: this.onSearchFieldChange,
                scope: this
            });
        }

        if (columnsList) {
            columnsList.on({
                itemtap: this.onColumnItemTap,
                scope: this
            });
        }
    },

    /**
     * @method applySearchField
     * Applier method for the searchField config.
     * Transforms the config object into a component instance if needed.
     * 
     * @param {Object/Ext.field.Text} searchField The search field configuration or instance
     * @param {Ext.field.Text} oldSearchField The old search field component
     * @returns {Ext.field.Text} The search field component instance
     */
    applySearchField: function(searchField, oldSearchField) {
        if (searchField) {
            // Merge with placeholder from searchPlaceholder config
            searchField = Ext.applyIf({
                placeholder: this.getSearchPlaceholder()
            }, searchField);
        }

        return Ext.factory(searchField, Ext.field.Text, oldSearchField);
    },

    /**
     * @method applyColumnsList
     * Applier method for the columnsList config.
     * Transforms the config object into a component instance if needed.
     * 
     * @param {Object/Ext.dataview.List} columnsList The columns list configuration or instance
     * @param {Ext.dataview.List} oldColumnsList The old columns list component
     * @returns {Ext.dataview.List} The columns list component instance
     */
    applyColumnsList: function(columnsList, oldColumnsList) {
        if (columnsList) {
            columnsList = Ext.applyIf(columnsList, {
                store: Ext.create('Ext.data.Store', this.getListStoreConfig()),
                itemTpl: this.getItemTpl(),
                flex: 1
            });
        }

        return Ext.factory(columnsList, Ext.dataview.List, oldColumnsList);
    },

    /**
     * @method applyMenuPanel
     * Applier method for the menuPanel config.
     * Transforms the config object into a component instance if needed.
     * 
     * @param {Object/Ext.panel.Panel} menuPanel The menu panel configuration or instance
     * @param {Ext.panel.Panel} oldMenuPanel The old menu panel component
     * @returns {Ext.panel.Panel} The menu panel component instance
     */
    applyMenuPanel: function(menuPanel, oldMenuPanel) {
        var me = this,
            items = [];

        if (menuPanel) {
            // Add search field if enabled
            if (me.getSearchEnabled()) {
                items.push(me.getSearchField());
            }

            // Add columns list
            items.push(me.getColumnsList());

            // Merge with other configs
            menuPanel = Ext.applyIf({
                height: me.getMenuHeight(),
                margin: me.getMenuMargin(),
                items: items
            }, menuPanel);
        }

        return Ext.factory(menuPanel, Ext.panel.Panel, oldMenuPanel);
    },

    /**
     * @method onSearchFieldChange
     * Handles search field value changes and triggers filtering.
     * 
     * Called automatically when the user types in the search field.
     * Applies the search filter to the columns list based on the entered text.
     * 
     * @param {Ext.field.Text} field The search field component that triggered the change
     * @param {String} value The new value entered in the search field
     */
    onSearchFieldChange: function(field, value) {
        this.filterColumnsList(value);
    },

    /**
     * @method onColumnItemTap
     * Handles user interaction with column list items (tap/click events).
     * 
     * Processes column visibility toggling when users click on column items.
     * Supports both checkbox and text clicks for better usability.
     * 
     * @param {Ext.dataview.List} list The list component containing the tapped item
     * @param {Number} index The index of the tapped item in the list
     * @param {HTMLElement} target The DOM element that was tapped
     * @param {Ext.data.Model} record The data record associated with the tapped item
     * @param {Ext.event.Event} e The tap/click event object
     */
    onColumnItemTap: function(list, index, target, record, e) {
        var column, newHidden;

        if (!record.get('disabled')) {
            // Determine if this is a valid checkbox interaction

            column = record.get('column');
            newHidden = !record.get('hidden');

            // Update the record and column visibility
            record.set('hidden', newHidden);
            column.setHidden(newHidden);

            // Update disabled states after column visibility change
            this.updateDisabledState();

        }
    },

    /**
     * @method filterColumnsList
     * Applies a text filter to the columns list based on the provided search value.
     * 
     * @param {String} value The search text to filter by. Empty string clears the filter.
     */
    filterColumnsList: function(value) {
        var store = this.getColumnsList().getStore();

        // Clear any existing filters
        store.clearFilter();

        // If we have a search value, apply the filter
        if (value) {
            store.filter({
                property: 'text',
                value: value,
                anyMatch: true
            });
        }
    },

    /**
     * @method updateDisabledState
     * Updates the disabled state of columns to prevent hiding all columns.
     * 
     * Ensures at least one column remains visible by:
     * 1. Counting currently visible columns
     * 2. Disabling the last visible column if only one remains
     * 3. Enabling hidden columns so they can be shown again
     * 
     */
    updateDisabledState: function() {
        var me = this,
            store = me.getColumnsList().getStore(),
            visibleCount = 0,
            shouldDisableVisible,
            isHidden,
            shouldDisable;

        // Single pass: count visible columns
        store.each(function(record) {
            isHidden = record.get('hidden');

            if (!isHidden) {
                visibleCount++;
            }
        });

        // Determine if we should disable visible columns (prevent hiding all)
        shouldDisableVisible = visibleCount <= 1;

        // Second pass: update disabled state for all records
        store.each(function(record) {
            isHidden = record.get('hidden');
            shouldDisable = isHidden ? false : shouldDisableVisible;

            // Only update if the disabled state actually changed
            if (record.get('disabled') !== shouldDisable) {
                record.set('disabled', shouldDisable);
            }
        });
    },

    /**
     * @method onBeforeShowColumnMenu
     * Called before showing the column menu to populate it with current column data.
     * 
     * Performs the following initialization:
     * Gathers all columns from the grid header (including grouped columns)
     * Creates list data records for hideable columns
     * Updates the list store with current column states
     * Updates disabled states based on configuration
     * Clears any previous search filter
     * 
     * @param {Ext.menu.Menu} menu The column menu being shown
     * @param {Ext.grid.column.Column} column The column that triggered the menu
     * @param {Ext.grid.Grid} grid The grid component containing the columns
     */
    onBeforeShowColumnMenu: function(menu, column, grid) {
        var me = this,
            headerCt = grid.getHeaderContainer(),
            columns = [],
            listData = [],
            listStore;

        me.callParent([menu, column, grid]);

        // Get a flattened array of all columns (including those in groups)
        function getColumns(items) {
            items.forEach(function(col) {
                if (col.isHeaderGroup) {
                    getColumns(col.getItems().items);
                }
                else {
                    columns.push(col);
                }
            });
        }

        getColumns(headerCt.getItems().items);

        // Create the data for the list
        columns.forEach(function(col) {
            if (col.getHideable()) {
                listData.push({
                    id: col.getId(),
                    text: col.getText(),
                    column: col,
                    hidden: col.isHidden(),
                    hideable: col.getHideable(),
                    disabled: false
                });
            }
        });

        // Update the list store using getter method
        listStore = me.getColumnsList().getStore();
        listStore.loadData(listData);

        me.updateDisabledState();

        // Clear any previous search using getter method
        if (me.getSearchEnabled() && me.getSearchField()) {
            me.getSearchField().setValue('');
        }
    },

    /**
     * @method filterColumns
     * to manually filter columns by search text.
     * 
     * Allows programmatic filtering of the columns list without user interaction.
     * Useful for external components that need to control the column menu filter state.
     * 
     * @param {String} value The search value to filter columns by
     * 
     */
    filterColumns: function(value) {
        this.filterColumnsList(value);
    },

    /**
     * @method clearFilter
     * Clear the search filter and show all columns.
     * 
     * Resets both the search field value and the list filter to display all available columns.
     * Equivalent to calling filterColumns('') but also clears the search field UI.
     * 
     */
    clearFilter: function() {
        var searchField = this.getSearchField();

        if (searchField) {
            searchField.setValue('');
        }

        this.filterColumnsList('');
    },

    /**
     * @method refreshColumnsList
     * to refresh the visual display of the columns list.
     * 
     * Forces a re-render of the list items to reflect any programmatic changes
     * to the underlying data store. Useful after making bulk changes to column states.
     * 
     */
    refreshColumnsList: function() {
        var columnsList = this.getColumnsList();

        if (columnsList) {
            columnsList.refresh();
        }
    }
});
