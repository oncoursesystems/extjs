/**
 * @class kitchensink.controller.tablet.main
 * @extends KitchenSink.controller.Main
 *
 * This is the Main controller subclass for the 'tablet' profile.
 *
 * The table profile differs from the phone profile in that navigation is done via screens full of icons
 * instead of a nested list.
 */
Ext.define('KitchenSink.controller.tablet.Main', {
    extend: 'KitchenSink.controller.Main',

    refs: {
        toolbar: '#mainNavigationBar',
        contentPanel1: '#contentPanel1',
        contentPanel2: '#contentPanel2',
        cardPanel: '#cardPanel',
        breadcrumb: 'breadcrumb',
        breadcrumbButton: 'button[action=breadcrumb]',

        thumbnails1: {
            selector: '#thumbnails1>thumbnails',
            id: 'thumbnails1',
            xtype: 'thumbnails',
            flex: 1,
            autoCreate: true
        },
        thumbnails2: {
            selector: '#thumbnails2>thumbnails',
            id: 'thumbnails2',
            xtype: 'thumbnails',
            flex: 1,
            autoCreate: true
        }
    },

    control: {
        '#thumbnails1 dataview': {
            childtap: 'onThumbnailClick'
        },
        '#thumbnails2 dataview': {
            childtap: 'onThumbnailClick'
        },
        'breadcrumbButton': {
            tap: 'onBreadcrumbTap'
        }
    },

    setAnimate: function(direction) {
        this.getCardPanel().getLayout().setAnimation({
            type: 'slide',
            direction: direction === 'forward' ? 'left' : 'right',
            duration: 250
        });

        this.animateDirection = direction;
    },

    /**
     * Set animnation for moving forward (right) through the navigation hierarchy.
     */
    animateForward: function() {
        this.setAnimate('forward');
    },

    /**
     * Set animnation for moving backward (left) through the navigation hierarchy.
     */
    animateBackward: function() {
        this.setAnimate('backward');
    },

    updateTitle: function(node) {
        var text = node.get('text'),
            title = node.isLeaf() ? (node.parentNode.get('text') + ' - ' + text) : text,
            toolbar = this.getToolbar();

        if (title === 'All') {
            title = 'Kitchen Sink';
        }

        document.title = document.title.split(' - ')[0] + ' - ' + text;

        return this;
    },

    updateBreadcrumb: function(node) {
        var me = this,
            breadcrumb = me.getBreadcrumb(),
            path = [];

        do {
            path.push({
                text: node.get('text'),
                value: node.get('id'),
                action: 'breadcrumb'
            });

            node = node.parentNode;

            if (node) {
                path.push({
                    xtype: 'component',
                    html: ' > '
                });
            }
        } while (node);

        path = path.reverse();
        path.push.apply(path, breadcrumb.afterItems);

        breadcrumb.removeAll(true);
        breadcrumb.add(path);

        return me;
    },

    onBreadcrumbTap: function(button) {
        var me = this;

        me.animateBackward();
        me.redirectTo(button.getValue());
    },

    handleRoute: function(id) {
        var me = this,
            store = Ext.StoreMgr.get('Navigation'),
            node = store.getNodeById(id),
            cardPanel = me.getCardPanel(),
            animation = cardPanel.getLayout().getAnimation(),
            activeCard = cardPanel.getActiveItem(),
            cp1 = activeCard.id === 'contentPanel2',
            contentPanel1, contentPanel2,
            thumbnails, thumbnails1, thumbnails2,
            cmp, thumbnailsStore, demoContent,
            viewClass, viewName;

        me.record = node;

        if (node.isLeaf()) {
            viewClass = me.getViewClass(node);
            viewName = Ext.ClassManager.getName(viewClass);

            cmp = {
                xtype: 'contentPanel',
                layout: 'center',
                items: [
                    demoContent = me.activeView = new viewClass({
                        id: viewName.replace(/\./g, '-').toLowerCase()
                    })
                ]
            };

            if (!demoContent.$preventContentSize && demoContent.getWidth() === null) {
                demoContent.setWidth('90%');
                demoContent.setHeight('90%');
            }

            if (demoContent.getShadow() !== false) {
                //default to having a shadow
                demoContent.setShadow(true);
            }

            me.currentDemo = node;
        } else {
            contentPanel1 = me.getContentPanel1();
            contentPanel2 = me.getContentPanel2();
            thumbnails1 = me.getThumbnails1();
            thumbnails2 = me.getThumbnails2();

            if (contentPanel1 && !me.thumbnailsAdded) {
                contentPanel1.add(thumbnails1);
                contentPanel2.add(thumbnails2);

                me.thumbnailsAdded = true;
            }

            thumbnails = cp1 ? thumbnails1 : thumbnails2;
            thumbnailsStore = thumbnails.getStore();

            thumbnailsStore.setData(node.childNodes);

            if (animation && me.currentDemo) {
                me.currentDemo = null;

                animation.on({
                    single: true,
                    animationend: function() {
                        // titlebar, breadcrumb, cardPanel1, cardPanel2, demo (demo = 4)
                        if (cardPanel.items.length > 3) {
                            cardPanel.removeAt(3);
                        }
                    }
                });
            }

            cmp = cp1 ? contentPanel1 : contentPanel2;

            // Hide owned menus - old view destruction doesn't take place until animation end.
            Ext.menu.Manager.hideAll();
        }

        me.updateTitle(node)
            .updateDetails(node)
            .updateBreadcrumb(node);

        //will add (if needed) and set active
        cardPanel.setActiveItem(cmp);
    },

    onThumbnailClick: function(view, location) {
        var me = this,
            record = location.record;

        me.record = record;
        me.animateForward();
        me.redirectTo(record.id);
    },

    getAvailableThemes: function () {
        var items = this.callParent();

        items.push({
            text: 'Classic Kitchen Sink',
            iconCls: 'x-fa fa-external-link',
            separator: true,
            handler: function() {
                window.location = location.pathname + '?classic';
            }
        });

        return items;
    }
});
