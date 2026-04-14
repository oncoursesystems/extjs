/**
 * Used as a view by {@link Ext.tree.Panel TreePanel}.
 */
Ext.define('Ext.tree.View', {
    extend: 'Ext.view.Table',
    alias: 'widget.treeview',

    config: {
        /**
         * @cfg selectionModel
         * @inheritdoc
         */
        selectionModel: {
            type: 'treemodel'
        }
    },

    /**
     * @property {Boolean} isTreeView
     * `true` in this class to identify an object as an instantiated TreeView, or subclass thereof.
     */
    isTreeView: true,

    /**
     * @cfg loadingCls
     * @inheritdoc
     */
    loadingCls: Ext.baseCSSPrefix + 'grid-tree-loading',
    expandedCls: Ext.baseCSSPrefix + 'grid-tree-node-expanded',
    leafCls: Ext.baseCSSPrefix + 'grid-tree-node-leaf',

    expanderSelector: '.' + Ext.baseCSSPrefix + 'tree-expander',
    checkboxSelector: '.' + Ext.baseCSSPrefix + 'tree-checkbox',
    expanderIconOverCls: Ext.baseCSSPrefix + 'tree-expander-over',

    // Class to add to the node wrap element used to hold nodes when a parent is being
    // collapsed or expanded. During the animation, UI interaction is forbidden by testing
    // for an ancestor node with this class.
    nodeAnimWrapCls: Ext.baseCSSPrefix + 'tree-animator-wrap',

    /**
     * @cfg loadMask
     * @inheritdoc
     */
    loadMask: false,

    /**
     * @cfg {Boolean} rootVisible
     * False to hide the root node.
     */
    rootVisible: true,

    /**
     * @cfg {Boolean} animate
     * True to enable animated expand/collapse (defaults to the value of
     * {@link Ext#enableFx Ext.enableFx})
     */

    expandDuration: 250,
    collapseDuration: 250,

    /**
     * @cfg {Boolean} toggleOnDblClick
     * True to toggle expand or collapse with a double click.
     */
    toggleOnDblClick: true,

    /**
     * @cfg stripeRows
     * @inheritdoc
     */
    stripeRows: false,

    /* eslint-disable indent */
    // treeRowTpl which is inserted into the rowTpl chain before the base rowTpl.
    // Sets tree-specific classes and attributes
    treeRowTpl: [
        '{%',
            'this.processRowValues(values);',
            'this.nextTpl.applyOut(values, out, parent);',
        '%}', {
            priority: 10,
            processRowValues: function(rowValues) {
                var record = rowValues.record,
                    view = rowValues.view;

                // We always need to set the qtip/qtitle, because they may have been
                // emptied, which means we still need to flush that change to the DOM
                // so the old values are overwritten
                rowValues.rowAttr['data-qtip'] = record.get('qtip') || '';
                rowValues.rowAttr['data-qtitle'] = record.get('qtitle') || '';

                // aria-level is 1-based
                rowValues.rowAttr['aria-level'] = record.getDepth() + 1;

                if (record.isLeaf()) {
                    rowValues.rowClasses.push(view.leafCls);
                }
                else {
                    if (record.isExpanded()) {
                        rowValues.rowClasses.push(view.expandedCls);
                        rowValues.rowAttr['aria-expanded'] = true;
                    }
                    else {
                        rowValues.rowAttr['aria-expanded'] = false;
                    }
                }

                if (record.isLoading()) {
                    rowValues.rowClasses.push(view.loadingCls);
                }
            }
        }
    ],
    /* eslint-enable indent */

    /**
     * @event afteritemexpand
     * Fires after an item has been visually expanded and is visible in the tree.
     * @param {Ext.data.NodeInterface} node The node that was expanded
     * @param {Number} index The index of the node
     * @param {HTMLElement} item The HTML element for the node that was expanded
     */

    /**
     * @event afteritemcollapse
     * Fires after an item has been visually collapsed and is no longer visible in the tree.
     * @param {Ext.data.NodeInterface} node The node that was collapsed
     * @param {Number} index The index of the node
     * @param {HTMLElement} item The HTML element for the node that was collapsed
     */

    /**
     * @event nodedragover
     * Fires when a tree node is being targeted for a drag drop, return false to signal
     * drop not allowed.
     * @param {Ext.data.NodeInterface} targetNode The target node
     * @param {String} position The drop position, "before", "after" or "append",
     * @param {Object} dragData Data relating to the drag operation
     * @param {Ext.event.Event} e The event object for the drag
     */

    initComponent: function() {
        var me = this;

        if (me.bufferedRenderer) {
            me.animate = false;
        }
        else if (me.initialConfig.animate === undefined) {
            me.animate = Ext.enableFx;
        }

        me.store = me.panel.getStore();
        me.onRootChange(me.store.getRoot());

        me.animQueue = {};
        me.animWraps = {};

        me.callParent();
        me.store.setRootVisible(me.rootVisible);
        me.addRowTpl(me.lookupTpl('treeRowTpl'));

    },

    onFillComplete: function(treeStore, fillRoot, newNodes) {
        var me = this,
            store = me.store,
            start = store.indexOf(newNodes[0]);

        // Always update the current node, since the load may be triggered
        // by .load() directly instead of .expand() on the node
        fillRoot.triggerUIUpdate();

        // In the cases of expand, the records might not be in the store yet,
        // so jump out early and expand will handle it later
        if (!newNodes.length || start === -1) {
            return;
        }

        // Insert new nodes into the view
        me.onAdd(me.store, newNodes, start);

        me.refreshPartner();
    },

    refreshPartner: function() {
        var partner = this.lockingPartner;

        if (partner) {
            partner.refresh();
        }
    },

    afterRender: function() {
        var me = this;

        me.callParent();

        me.el.on({
            scope: me,
            delegate: me.expanderSelector,
            mouseover: me.onExpanderMouseOver,
            mouseout: me.onExpanderMouseOut
        });
    },

    processUIEvent: function(e) {
        // If the clicked node is part of an animation, ignore the click.
        // This is because during a collapse animation, the associated Records
        // will already have been removed from the Store, and the event is not processable.
        if (e.getTarget('.' + this.nodeAnimWrapCls, this.el)) {
            return false;
        }

        return this.callParent([e]);
    },

    setRootNode: function(node) {
        this.node = node;
    },

    getChecked: function() {
        var checked = [];

        this.node.cascade(function(rec) {
            if (rec.get('checked')) {
                checked.push(rec);
            }
        });

        return checked;
    },

    isItemChecked: function(rec) {
        return rec.get('checked');
    },

    /**
     * @private
     */
    createAnimWrap: function(record, index) {
        var me = this,
            node = me.getNode(record),
            tmpEl;

        tmpEl = Ext.fly(node).insertSibling({
            role: 'presentation',
            tag: 'div',
            cls: me.nodeAnimWrapCls
        }, 'after');

        return {
            record: record,
            node: node,
            el: tmpEl,
            expanding: false,
            collapsing: false,
            animateEl: tmpEl,
            targetEl: tmpEl
        };
    },

    /**
     * @private
     * Returns the animation wrapper element for the specified parent node, used to wrap
     * the child nodes as they slide up or down during expand/collapse.
     *
     * @param parent The parent node to be expanded or collapsed
     *
     * @param [bubble=true] If the passed parent node does not already have a wrap element created,
     * by default this function will bubble up to each parent node looking for a valid wrap element
     * to reuse, returning the first one it finds. This is the appropriate behavior, e.g.,
     * for the collapse direction, so that the entire expanded set of branch nodes can collapse
     * as a single unit.
     *
     * However for expanding each parent node should instead always create its own animation wrap
     * if one doesn't exist, so that its children can expand independently of any other nodes --
     * this is crucial when executing the "expand all" behavior. If multiple nodes attempt to reuse
     * the same ancestor wrap element concurrently during expansion it will lead to problems
     * as the first animation to complete will delete the wrap el out from under other running
     * animations. For that reason, when expanding you should always pass `bubble: false`
     * to be on the safe side.
     *
     * If the passed parent has no wrap (or there is no valid ancestor wrap after bubbling),
     * this function will return null and the calling code should then call {@link #createAnimWrap}
     * if needed.
     *
     * @return {Ext.dom.Element} The wrapping element as created in {@link #createAnimWrap}, or null
     */
    getAnimWrap: function(parent, bubble) {
        if (!this.animate) {
            return null;
        }

        // eslint-disable-next-line vars-on-top
        var wraps = this.animWraps,
            wrap = wraps[parent.internalId];

        if (bubble !== false) {
            while (!wrap && parent) {
                parent = parent.parentNode;

                if (parent) {
                    wrap = wraps[parent.internalId];
                }
            }
        }

        return wrap;
    },

    doAdd: function(records, index) {
        var me = this,
            record = records[0],
            parent = record.parentNode,
            all = me.all,
            relativeIndex,
            animWrap = me.getAnimWrap(parent),
            targetEl, childNodes, len, result, children;

        if (!animWrap || !animWrap.expanding) {
            return me.callParent([records, index]);
        }

        // If we are adding records which have a parent that is currently expanding
        // lets add them to the animation wrap
        result = me.bufferRender(records, index, true);
        children = result.children;

        // We need the parent that has the animWrap, not the node's parent
        parent = animWrap.record;

        // If there is an anim wrap we do our special magic logic
        targetEl = animWrap.targetEl;
        childNodes = targetEl.dom.childNodes;
        len = childNodes.length;

        // The relative index is the index in the full flat collection
        // minus the index of the wraps parent
        relativeIndex = index - me.indexInStore(parent) - 1;

        // If we are adding records to the wrap that have a higher relative index
        // then there are currently children
        // it means we have to append the nodes to the wrap
        if (!len || relativeIndex >= len) {
            targetEl.appendChild(result.fragment, true);
        }
        // If there are already more children then the relative index it means we are adding
        // child nodes of some expanded node in the anim wrap. In this case we have to insert
        // the nodes in the right location
        else {
            Ext.fly(childNodes[relativeIndex]).insertSibling(children, 'before', true);
        }

        // We also have to update the node cache of the DataView
        all.insert(index, children);

        return children;
    },

    onRemove: function(ds, records, index) {
        var me = this,
            empty, i,
            oldItems;

        if (me.viewReady) {
            empty = me.store.getCount() === 0;

            // If buffered rendering is being used, call the parent class.
            if (me.bufferedRenderer) {
                return me.callParent([ds, records, index]);
            }

            oldItems = this.all.slice(index, index + records.length);

            // Nothing left, just refresh the view.
            if (empty) {
                me.refresh();
            }
            else {
                // Remove in reverse order so that indices remain correct
                for (i = records.length - 1, index += i; i >= 0; --i, --index) {
                    me.doRemove(records[i], index);
                }

                me.refreshSizePending = true;
            }

            me.fireItemMutationEvent('itemremove', records, index, oldItems, me);
        }
    },

    doRemove: function(record, index) {
        // If we are adding records which have a parent that is currently expanding
        // lets add them to the animation wrap
        var me = this,
            all = me.all,
            animWrap = me.getAnimWrap(record),
            item = all.item(index),
            node = item ? item.dom : null;

        if (!node || !animWrap || !animWrap.collapsing) {
            return me.callParent([record, index]);
        }

        // Insert the item at the beginning of the animate el - child nodes are removed
        // in reverse order so that the index can be used.
        animWrap.targetEl.dom.insertBefore(node, animWrap.targetEl.dom.firstChild);
        all.removeElement(index);
    },

    onBeforeExpand: function(parent, records, index) {
        var me = this,
            animWrap;

        if (me.rendered && me.all.getCount() && me.animate) {
            if (me.getNode(parent)) {
                animWrap = me.getAnimWrap(parent, false);

                if (!animWrap) {
                    animWrap = me.animWraps[parent.internalId] = me.createAnimWrap(parent);
                    animWrap.animateEl.setHeight(0);
                }
                else if (animWrap.collapsing) {
                    // If we expand this node while it is still expanding then we
                    // have to remove the nodes from the animWrap.
                    animWrap.targetEl.select(me.itemSelector).destroy();
                }

                animWrap.expanding = true;
                animWrap.collapsing = false;
            }
        }
    },

    onExpand: function(parent) {
        var me = this,
            queue = me.animQueue,
            id = parent.getId(),
            node = me.getNode(parent),
            index = node ? me.indexOf(node) : -1,
            animWrap,
            animateEl,
            targetEl;

        if (me.singleExpand) {
            me.ensureSingleExpand(parent);
        }

        // The item is not visible yet
        if (index === -1) {
            return;
        }

        animWrap = me.getAnimWrap(parent, false);

        if (!animWrap) {
            parent.isExpandingOrCollapsing = false;
            me.fireEvent('afteritemexpand', parent, index, node);

            return;
        }

        animateEl = animWrap.animateEl;
        targetEl = animWrap.targetEl;

        animateEl.stopAnimation();
        queue[id] = true;

        // Must set element height before this event finishes because animation does not set
        // initial condition until first tick has elapsed.
        // Which is good because the upcoming layout resumption must read the content height
        // BEFORE it gets squished.
        Ext.on('idle', function() {
            animateEl.dom.style.height = '0px';
        }, null, { single: true });

        animateEl.animate({
            from: {
                height: 0
            },
            to: {
                height: targetEl.dom.scrollHeight
            },
            duration: me.expandDuration,
            listeners: {
                afteranimate: function() {
                    // Move all the nodes out of the anim wrap to their proper location
                    // Must do this in afteranimate because lastframe does not fire if the
                    // animation is stopped.
                    var items = targetEl.dom.childNodes,
                        activeEl = Ext.Element.getActiveElement();

                    if (items.length) {
                        if (!targetEl.contains(activeEl)) {
                            activeEl = null;
                        }

                        animWrap.el.insertSibling(items, 'before', true);

                        if (activeEl) {
                            Ext.fly(activeEl).focus();
                        }
                    }

                    animWrap.el.destroy();
                    queue[id] = null;

                    if (!me.destroyed) {
                        me.animWraps[animWrap.record.internalId] = null;
                    }
                }
            },
            callback: function() {
                parent.isExpandingOrCollapsing = false;

                if (!me.destroyed) {
                    me.refreshSize(true);
                }

                me.fireEvent('afteritemexpand', parent, index, node);
            }
        });
    },

    // Triggered by the TreeStore's beforecollapse event.
    onBeforeCollapse: function(parent, records, index, callback, scope) {
        var me = this,
            animWrap;

        if (me.rendered && me.all.getCount()) {
            if (me.animate) {
                // Only process if the collapsing node is in the UI.
                // A node may be collapsed as part of a recursive ancestor collapse, and if it
                // has already been removed from the UI by virtue of an ancestor being collapsed,
                // we should not do anything.
                if (parent.getTreeStore().isVisible(parent)) {
                    animWrap = me.getAnimWrap(parent);

                    if (!animWrap) {
                        animWrap = me.animWraps[parent.internalId] =
                            me.createAnimWrap(parent, index);
                    }
                    else if (animWrap.expanding) {
                        // If we collapse this node while it is still expanding then we
                        // have to remove the nodes from the animWrap.
                        animWrap.targetEl.select(this.itemSelector).destroy();
                    }

                    animWrap.expanding = false;
                    animWrap.collapsing = true;
                    animWrap.callback = callback;
                    animWrap.scope = scope;
                }
            }
            else {
                // Cache any passed callback for use in the onCollapse post collapse handler
                // non-animated codepath
                me.onCollapseCallback = callback;
                me.onCollapseScope = scope;
            }
        }
    },

    onCollapse: function(parent) {
        var me = this,
            queue = me.animQueue,
            id = parent.getId(),
            node = me.getNode(parent),
            index = node ? me.indexOf(node) : -1,
            animWrap = me.getAnimWrap(parent),
            animateEl;

        // If the collapsed node is already removed from the UI
        // by virtue of being a descendant of a collapsed node, then
        // we have nothing to do here.
        if (!me.all.getCount() || !parent.isVisible()) {
            return;
        }

        // Not animating, all items will have been added, so updateLayout and resume layouts
        if (!animWrap) {
            parent.isExpandingOrCollapsing = false;
            me.fireEvent('afteritemcollapse', parent, index, node);

            // Call any collapse callback cached in the onBeforeCollapse handler
            Ext.callback(me.onCollapseCallback, me.onCollapseScope);
            me.onCollapseCallback = me.onCollapseScope = null;

            return;
        }

        animateEl = animWrap.animateEl;

        queue[id] = true;

        animateEl.stopAnimation();
        animateEl.animate({
            to: {
                height: 0
            },
            duration: me.collapseDuration,
            listeners: {
                afteranimate: function() {
                    // In case lastframe did not fire because the animation was stopped.
                    animWrap.el.destroy();
                    queue[id] = null;

                    if (!me.destroyed) {
                        me.animWraps[animWrap.record.internalId] = null;
                    }
                }
            },
            callback: function() {
                parent.isExpandingOrCollapsing = false;

                if (!me.destroyed) {
                    me.refreshSize(true);
                }

                me.fireEvent('afteritemcollapse', parent, index, node);

                // Call any collapse callback cached in the onBeforeCollapse handler
                Ext.callback(animWrap.callback, animWrap.scope);
                animWrap.callback = animWrap.scope = null;
            }
        });
    },

    /**
     * Checks if a node is currently undergoing animation
     * @private
     * @param {Ext.data.Model} node The node
     * @return {Boolean} True if the node is animating
     */
    isAnimating: function(node) {
        return !!this.animQueue[node.getId()];
    },

    /**
     * Expands a record that is loaded in the view.
     *
     * If an animated collapse or expand of the record is in progress, this call will be ignored.
     * @param {Ext.data.Model} record The record to expand
     * @param {Boolean} [deep] True to expand nodes all the way down the tree hierarchy.
     * @param {Function} [callback] The function to run after the expand is completed
     * @param {Object} [scope] The scope of the callback function.
     */
    expand: function(record, deep, callback, scope) {
        var me = this,
            doAnimate = !!me.animate,
            result;

        // Block toggling if we are already animating an expand or collapse operation.
        if (!doAnimate || !record.isExpandingOrCollapsing) {
            if (!record.isLeaf()) {
                record.isExpandingOrCollapsing = doAnimate;
            }

            // Need to suspend layouts because the expand process makes multiple changes to the UI
            // in addition to inserting new nodes. Folder and elbow images have to change, so we
            // need to coalesce all resulting layouts.
            Ext.suspendLayouts();
            result = record.expand(deep, callback, scope);
            Ext.resumeLayouts(true);

            return result;
        }
    },

    /**
     * Collapses a record that is loaded in the view.
     *
     * If an animated collapse or expand of the record is in progress, this call will be ignored.
     * @param {Ext.data.Model} record The record to collapse
     * @param {Boolean} [deep] True to collapse nodes all the way up the tree hierarchy.
     * @param {Function} [callback] The function to run after the collapse is completed
     * @param {Object} [scope] The scope of the callback function.
     */
    collapse: function(record, deep, callback, scope) {
        var me = this,
            doAnimate = !!me.animate;

        // Block toggling if we are already animating an expand or collapse operation.
        if (!doAnimate || !record.isExpandingOrCollapsing) {
            if (!record.isLeaf()) {
                record.isExpandingOrCollapsing = doAnimate;
            }

            return record.collapse(deep, callback, scope);
        }
    },

    /**
     * Toggles a record between expanded and collapsed.
     *
     * If an animated collapse or expand of the record is in progress, this call will be ignored.
     * @param {Ext.data.Model} record
     * @param {Boolean} [deep] True to collapse nodes all the way up the tree hierarchy.
     * @param {Function} [callback] The function to run after the expand/collapse is completed
     * @param {Object} [scope] The scope of the callback function.
     */
    toggle: function(record, deep, callback, scope) {
        if (record.isExpanded()) {
            this.collapse(record, deep, callback, scope);
        }
        else {
            this.expand(record, deep, callback, scope);
        }
    },

    onItemDblClick: function(record, item, index, e) {
        var me = this,
            editingPlugin = me.editingPlugin;

        me.callParent([record, item, index, e]);

        if (me.toggleOnDblClick && record.isExpandable() &&
            !(editingPlugin && editingPlugin.clicksToEdit === 2)) {
            me.toggle(record);
        }
    },

    onCellClick: function(cell, cellIndex, record, row, rowIndex, e) {
        var me = this,
            column = e.position.column,
            ariaDescribedBy;

        // We're only interested in clicks in the tree column
        if (column.isTreeColumn) {

            // Click on the checkbox and there is a defined data value; toggle it.
            if (e.getTarget(me.checkboxSelector, cell) && record.get('checked') != null) {
                me.onCheckChange(e);

                // Allow the stopSelection config on checkable tree columns to prevent selection
                if (column.stopSelection) {
                    e.stopSelection = true;
                }
            }

            // Click on the expander
            else if (e.getTarget(me.expanderSelector, cell) && record.isExpandable()) {
                // Ensure focus is on the clicked cell so that if this causes a refresh,
                // focus restoration does not scroll back to the previouslty focused position.
                // onCellClick is called *befor* cellclick is fired which is what changes
                // focus position.
                // TODO: connect directly from View's event processing to NavigationModel
                // without relying on events.
                me.getNavigationModel().setPosition(e.position);
                me.toggle(record, e.ctrlKey);

                // So that we know later to stop event propagation by returning false
                // from the NavigationModel
                // TODO: when NavigationModel is directly hooked up to be called *before*
                // the event sequence
                // This flag will not be necessary.
                e.nodeToggled = true;
            }

            // In Opera we need to toggle aria-describedby in order to make screen-reader
            // read it
            ariaDescribedBy = cell.getAttribute('aria-describedby');

            if (Ext.isOpera && ariaDescribedBy) {
                cell.removeAttribute('aria-describedby');
                Ext.defer(function() {
                    cell.setAttribute('aria-describedby', ariaDescribedBy);
                }, 100, me);
            }

            return me.callParent([cell, cellIndex, record, row, rowIndex, e]);
        }
    },

    onCheckChange: function(e) {
        var me = this,
            record = e.record,
            wasChecked = record.get('checked'),
            checked;

        checked = wasChecked === false;

        if (me.ownerGrid.enableTri && !Ext.isEmpty(me.ownerGrid.checkOnTriTap)) {
            checked = me.getCheckOnTriTapFlags(wasChecked, checked);
        }

        me.setChecked(record, checked, e);
    },

    setChecked: function(record, meChecked, e, options) {
        var me = this,
            checkPropagation =
                me.checkPropagationFlags[me.ownerGrid.checkPropagation.toLowerCase()],
            wasChecked = record.get('checked'),
            shouldPropagateDown = (!options || options.propagateCheck !== false) &&
                (checkPropagation & 1),
            shouldPropagateUp = (!options || options.checkParent !== false) &&
                (checkPropagation & 2),
            parentNode;

        if (me.fireEvent('beforecheckchange', record, wasChecked, e) === false) {
            return;
        }

        if (shouldPropagateDown) {
            me.propagateToChildren(record, meChecked, e, wasChecked);
        }

        if (record.get('checkable') !== false && !Ext.isEmpty(record.get('checked'))) {

            if (record.hasChildNodes() && me.ownerGrid.enableTri && shouldPropagateDown) {
                meChecked = me.calculateParentCheckState(record);
            }

            if (meChecked !== wasChecked) {
                record.set('checked', meChecked, options);
                me.fireEvent('checkchange', record, meChecked, e);
            }
        }

        if (shouldPropagateUp) {
            parentNode = record.parentNode;

            if (parentNode && parentNode.get('checked') != null) {
                me.updateParentState(parentNode, e);
            }
        }
    },

    onExpanderMouseOver: function(e) {
        Ext.fly(e.getTarget(this.cellSelector, 10)).addCls(this.expanderIconOverCls);
    },

    onExpanderMouseOut: function(e) {
        Ext.fly(e.getTarget(this.cellSelector, 10)).removeCls(this.expanderIconOverCls);
    },

    getStoreListeners: function() {
        return Ext.apply(this.callParent(), {
            rootchange: this.onRootChange,
            fillcomplete: this.onFillComplete,
            nodeappend: this.onNodeAppend
        });
    },

    onNodeAppend: function(cmp, node) {
        var me = this;

        me.syncNodeState(node);

        // on bulk node append refresh on last node
        Ext.unasap(me.nodeAppendInterval);
        me.nodeAppendInterval = Ext.asap(function() {
            if (me.refresh) {
                me.refresh();
            }
        });
    },

    onBindStore: function(store, initial, propName, oldStore) {
        var oldRoot = oldStore && oldStore.getRootNode(),
            newRoot = store && store.getRootNode();

        this.callParent([store, initial, propName, oldStore]);

        // The root implicitly changes when reconfigured with a new store.
        // The store's own rootChange event when it initially sets its own rootNode
        // will not have reached us because it was not ourt store during its initialization.
        if (newRoot !== oldRoot) {
            this.onRootChange(newRoot, oldRoot);
        }
    },

    onRootChange: function(newRoot, oldRoot) {
        var me = this,
            grid = me.grid;

        if (oldRoot) {
            me.rootListeners.destroy();
            me.rootListeners = null;
        }

        if (newRoot) {
            me.rootListeners = newRoot.on({
                beforeexpand: me.onBeforeExpand,
                expand: me.onExpand,
                beforecollapse: me.onBeforeCollapse,
                collapse: me.onCollapse,
                destroyable: true,
                scope: me
            });

            grid.addRelayers(newRoot);

            // Initialize checkboxes for all nodes when checkable: true
            me.syncCheckboxes();
        }
    },

    ensureSingleExpand: function(node) {
        var parent = node.parentNode;

        if (parent) {
            parent.eachChild(function(child) {
                if (child !== node && child.isExpanded()) {
                    child.collapse();
                }
            });
        }
    },

    privates: {
        checkPropagationFlags: {
            none: 0,
            down: 1,
            up: 2,
            both: 3
        },

        deferRefreshForLoad: function(store) {
            var ret = this.callParent([store]),
                options, node;

            if (ret) {
                options = store.lastOptions;
                node = options && options.node;

                // If the root isn't loading, then proceed with the refresh, we'll
                // add the other nodes as they come in
                if (node && node !== store.getRoot()) {
                    ret = false;
                }
            }

            return ret;
        },

        updateParent: function(parent) {
            var checked, unchecked, tri, total,
                newValue, oldValue;

            if (!parent) {
                return;
            }

            checked = parent.currentCheckState && parent.currentCheckState.checked;
            unchecked = parent.currentCheckState && parent.currentCheckState.unchecked;
            tri = parent.currentCheckState && parent.currentCheckState.tri;
            total = parent.childNodes.length;

            newValue = tri > 0
                ? 'tri'
                : checked === total
                    ? 'checked'
                    : unchecked === total ? 'unchecked' : 'tri';

            oldValue = parent.data.checked === 'tri'
                ? 'tri'
                : (parent.data.checked ? 'checked' : 'unchecked');

            if (oldValue !== newValue) {

                if (parent.get('checkable') !== false && !Ext.isEmpty(parent.get('checked'))) {

                    parent.set('checked', newValue === 'tri'
                        ? 'tri'
                        : newValue !== 'checked' ? false : true);
                }

                if (parent.parentNode) {
                    this.updateCount(parent.parentNode, oldValue, newValue);
                    this.updateParent(parent.parentNode);
                }
            }
        },

        updateCount: function(parent, oldVal, newVal) {
            if (parent && parent.currentCheckState) {
                parent.currentCheckState[oldVal]--;
                parent.currentCheckState[newVal]++;
            }
        },

        /**
         * Initializes syncing checkboxes for all nodes in the tree.
         * syncCheckboxes is triggered when the tree is first rendered or when the store is bound.
         * It sets the initial checked state for each node based on its 'checked' field.
         * If the 'checked' field is not set, it defaults to false unless the node is not checkable.
         * If tri-state checkboxes are enabled, it calculates the initial tri-state
         * based on the children of each node.
         * @private
         * */
        syncCheckboxes: function() {
            var me = this,
                store = me.store,
                root = store && store.getRoot();

            if (store && root) {
                root.cascade(function(node) {
                    me.syncNodeState(node);
                });

            }
        },

        syncNodeState: function(node) {
            var me = this,
                parent, checkedValue,
                checkedNode = node.get('checked');

            if (checkedNode === null && node.get('checkable') !== false &&
            me.ownerGrid.checkable === true) {
                node.set('checked', false);
            }

            if (me.ownerGrid.enableTri) {
                parent = node.parentNode;

                node.currentCheckState = { checked: 0, unchecked: 0, tri: 0 };

                if (parent != null) {
                    if (!parent.currentCheckState) {
                        parent.currentCheckState = { checked: 0, unchecked: 0, tri: 0 };
                    }

                    checkedValue = node.data.checked === 'tri'
                        ? 'tri'
                        : node.data.checked ? 'checked' : 'unchecked';

                    parent.currentCheckState[checkedValue]++;
                    me.updateParent(parent);
                }
            }
            else {
                // Handle initial tri-state logic for the current node
                if (!Ext.isEmpty(checkedNode)) {
                    // If enableTri mode is disabled and the node is set to 'tri',
                    //  convert it to true
                    if (checkedNode === 'tri') {
                        node.set('checked', true);
                    }
                }
            }
        },

        /**
         * Propagates the checked state to all child nodes.
         * - If tri-state is enabled, determines the correct state for children.
         * - Recursively sets the checked state for each child.
         * @param {Ext.data.Model} record The parent node.
         * @param {Boolean|String} childStateToSet The state to set for children.
         * @param {Event} e The event that triggered the change.
         * @param {Boolean|String} wasHalfChecked The previous state of the parent node.
         * @private
         */
        propagateToChildren: function(record, childStateToSet, e, wasHalfChecked) {
            var me = this,
                childNodes = record.childNodes,
                len = childNodes.length,
                i;

            if (!len) {
                return;
            }

            if (me.ownerGrid.enableTri && !Ext.isEmpty(me.ownerGrid.checkOnTriTap)) {
                childStateToSet = me.getCheckOnTriTapFlags(wasHalfChecked, childStateToSet);
            }

            // Set all children to the determined state
            for (i = 0; i < len; i++) {
                me.setChecked(childNodes[i], childStateToSet, e, {
                    checkParent: false,      // Don't propagate back up during child setting
                    propagateCheck: true     // Continue propagating down
                });
            }
        },

        /**
         * Determines the checked state to set when a tri-state node is tapped.
         * - If checkOnTriTap is true and previous state was 'tri', set to true.
         * - If checkOnTriTap is false and previous state was 'tri', set to false.
         * - Otherwise, use the provided checked value.
         * @param {Boolean|String} wasChecked Previous checked state.
         * @param {Boolean|String} checked Intended checked state.
         * @return {Boolean|String} The state to set.
         * @private
         */
        getCheckOnTriTapFlags: function(wasChecked, checked) {
            var me = this,
                checkOnTriTap = me.ownerGrid.checkOnTriTap;

            return wasChecked === 'tri' ? !!checkOnTriTap : checked; // ensure boolean true/false 

        },

        /**
         * Updates the checked state of a parent node based on its children's states.
         * Can optionally just calculate and return the state without applying it.
         * @param {Ext.data.NodeInterface} parentNode The parent node to update.
         * @param {Event} e The event that triggered the change.
         * @param {Object} options Optional configuration object.
         * @param {Boolean} options.calculateOnly If true, only calculates
         *  and returns the state without applying it.
         * @returns {Boolean|String|undefined} Returns the calculated
         *  state when calculateOnly is true, undefined otherwise.
         * @private
         */
        updateParentState: function(parentNode, e) {
            var me = this,
                parentChecked;

            parentChecked = me.calculateParentCheckState(parentNode);

            if (parentNode.get('checked') !== parentChecked) {
                // We are setting the parent node, so pass the
                // propagateCheck flag as false to avoid circular propagation
                me.setChecked(parentNode, parentChecked, e, {
                    propagateCheck: false,
                    checkParent: true // Allow further propagation up the tree
                });
            }
        },

        /**
         * Determines the state of the parent node based on its children's states.
         * - If all children are checked, returns true.
         * - If some children are checked and some are unchecked, returns 'tri'.
         * - If no children are checkable, returns undefined.
         * @param {Ext.data.NodeInterface} parentNode The parent node to evaluate.
         * @returns {Boolean|String|undefined} Returns true, 'tri', or undefined
         *  based on the children's states.
         */
        calculateParentCheckState: function(parentNode) {
            var me = this,
                triModeEnabled = me.ownerGrid.enableTri && 'tri',
                childNodes = parentNode.childNodes,
                len = childNodes.length,
                checkedCount = 0,
                uncheckedCount = 0,
                triCount = 0,
                checkableCount = 0,
                childChecked, i;

            if (!len) {
                return;
            }

            for (i = 0; i < len; i++) {
                childChecked = childNodes[i].get('checked');

                if (childNodes[i].get('checkable') === false) {
                    continue;
                }

                checkableCount++;

                if (childChecked === 'tri') {
                    triCount++;
                }

                if (childChecked) {
                    checkedCount++;
                }
                else {
                    uncheckedCount++;
                }
            }

            if (!checkableCount) {
                return;
            }

            return triCount > 0 || (checkedCount > 0 && uncheckedCount > 0)
                ? triModeEnabled
                : checkedCount === checkableCount;

        }
    }
});
