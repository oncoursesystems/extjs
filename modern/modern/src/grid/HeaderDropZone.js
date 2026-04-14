/**
 * @private
 */
Ext.define('Ext.grid.HeaderDropZone', {
    extend: 'Ext.grid.GridDropZone',

    dropMarkerCls: Ext.baseCSSPrefix + 'header-drop-indicator',
    autoDestroy: false,

    isValidDrag: function(targetCmp, sourceCmp) {
        var info = this.info,
            regionChange = targetCmp.getLocked() !== sourceCmp.getLocked(),
            grid = sourceCmp.getGrid && sourceCmp.getGrid(),
            cursor, prevSibling, nextSibling, box, diff;

        // Avoid parent column to be dragged on child column or column container
        if (!!targetCmp.up(sourceCmp)) {
            return false;
        }

        cursor = info.cursor.current;
        prevSibling = sourceCmp.previousSibling();
        nextSibling = sourceCmp.nextSibling();

        // Only a valid drop for siblings if dragged more than
        // half way through a sibling
        if (grid && grid.isCssLockedGrid && sourceCmp.getAlwaysLocked() && regionChange) {
            return false;
        }

        if (targetCmp === prevSibling && !regionChange) {
            box = prevSibling.element.getBox();
            diff = (cursor.x - box.left) / box.width;

            if (diff > 0.50) {
                return false;
            }
        }
        else if (targetCmp === nextSibling && !regionChange) {
            box = nextSibling.element.getBox();
            diff = (cursor.x - box.left) / box.width;

            if (diff <= 0.50) {
                return false;
            }
        }

        return true;
    },

    onDragMove: function(info) {
        var me = this,
            ddManager = Ext.dd.Manager,
            targetCmp = ddManager.getTargetComp(info),
            isDragTarget = targetCmp.isDragColumn,
            sourceCmp = ddManager.getSourceComp(info),
            notHeader = !targetCmp.isHeaderContainer || !sourceCmp.isHeaderContainer,
            highlight, positionCls;

        // Return on same column, not a column, on drag indicator column
        // or on header end if space is available
        if (notHeader || targetCmp === sourceCmp || isDragTarget ||
            targetCmp.getParent() === me.view) {
            if (this.ddEl) {
                this.removeDropMarker();
            }

            return;
        }

        highlight = ddManager.getPosition(info, targetCmp, 'x');
        positionCls = me.dropMarkerCls + '-' + highlight;

        if (targetCmp.hasCls(positionCls)) {
            return;
        }

        if (this.ddEl) {
            this.removeDropMarker();
        }

        if (me.isValidDrag(targetCmp, sourceCmp)) {
            me.ddEl = targetCmp;
            me.addDropMarker(targetCmp, [me.dropIndicator, positionCls]);
        }
    },

    /**
     * Remove the parent header if all its child headers are removed
     * And is not grid header container
     */
    trackHeaderMove: function(header, headerCt) {
        var parentCt;

        if (!header || header === headerCt || header.innerItems.length) {
            return;
        }

        parentCt = header.getParent();
        headerCt.fireEvent('columngroupremove', parentCt, header);
        parentCt.remove(header);
        this.trackHeaderMove(parentCt, headerCt);
    },

    onDrop: function(info) {
        var me = this,
            dropMethod = 'insertBefore',
            ddManager, targetCmp, headerCt,
            sourceCmp, dropAt, position,
            targetRegion, sourceRegion,
            relativeToItem, fromCtRoot, fromIdx, sourceCmpParent,
            grid, isLastUnlockedColumn, isCssLockedGrid, scroller;

        if (!me.ddEl) {
            return;
        }

        ddManager = Ext.dd.Manager;
        targetCmp = ddManager.getTargetComp(info);
        targetRegion = targetCmp.getRegion();
        headerCt = targetCmp.getParent() || targetCmp.getRootHeaderCt();
        sourceCmp = ddManager.getSourceComp(info);
        sourceRegion = sourceCmp.getRegion();
        fromCtRoot = sourceCmp.getRootHeaderCt();
        fromIdx = fromCtRoot.indexOf(sourceCmp);
        dropAt = headerCt.indexOf(targetCmp);
        position = ddManager.getPosition(info, targetCmp, 'x');
        sourceCmpParent = sourceCmp.getParent();
        grid = me.view;
        isCssLockedGrid = grid && grid.isCssLockedGrid;
        isLastUnlockedColumn = isCssLockedGrid &&
            grid.getLockedColumns().length === grid.getVisibleColumns().length - 1;

        me.removeDropMarker();

        if (dropAt === -1 || (isLastUnlockedColumn && sourceRegion === "center" &&
            targetRegion !== sourceRegion)) {
            return;
        }

        if (position === 'after') {
            relativeToItem = headerCt.getAt(dropAt + 1);

            if (!relativeToItem) {
                dropMethod = 'insertAfter';
                relativeToItem = targetCmp;
            }
        }
        else {
            relativeToItem = headerCt.getAt(dropAt);
        }

        headerCt[dropMethod](sourceCmp, (relativeToItem || null));

        me.trackHeaderMove(sourceCmpParent, fromCtRoot);

        fromCtRoot.fireEvent('move', fromCtRoot, sourceCmp, dropAt, fromIdx);

        // Update dropped column 'locked' property to be same as dropped region
        if (isCssLockedGrid) {
            scroller = sourceCmp.getGrid().getScrollable();
            // Work around for visual artifact where, when the center region is scrolled to the
            // far right, a drop anywhere in the grid will cause the column headers to be 
            // misaligned. Unable to determine the reason for 
            // this but this seems to resolve the visual artifact.
            scroller.scrollBy(-1);
            scroller.scrollBy(1);

            fromCtRoot.fireEvent('columnlockedchange', sourceCmp, targetRegion, sourceRegion);
        }
    }
});
