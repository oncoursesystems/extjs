/**
 * This is a more advanced example that shows how you can combine Ext.Template and a
 * remote data store to create a "live search" feature. Try searching for terms like
 * "form", or "grid".
 *
 * Each item in the resulting list is a link which may be clicked to navigate to the found
 * forum thread.
 */
Ext.define('KitchenSink.view.forms.ForumSearch', {
    extend: 'Ext.form.Panel',
    xtype: 'form-forumsearch',
    controller: 'form-forumsearch',
    title: 'Forum Search',

    requires: [
        'Ext.dataview.pullrefresh.PullRefresh',
        'Ext.field.Search'
    ],

    //<example>
    otherContent: [{
        type: 'Controller',
        path: 'modern/src/view/forms/ForumSearchController.js'
    }],

    profiles: {
        defaults: {
            bodyPadding: 20,
            height: 400,
            shadow: true,
            width: 600
        },
        ios: {
            bodyPadding: undefined,
            shadow: false
        },
        phone: {
            defaults: {
                bodyPadding: undefined,
                height: undefined,
                shadow: false,
                width: undefined
            },
            material: {
                bodyPadding: 20,
                shadow: true
            }
        }
    },
    //</example>

    bodyPadding: '${bodyPadding}',
    cls: 'form-forumsearch',
    height: '${height}',
    width: '${width}',

    items: [{
        reference: 'wrapper',
        autoSize: true,
        shadow: '${shadow}',
        layout: {
            type: 'fit'
        },
        items: [{
            xtype: 'searchfield',
            docked: 'top',
            ui: 'solo',
            placeholder: 'Search the Sencha Forums',
            listeners: {
                buffer: 500,
                change: 'doSearch'
            }
        }, {
            xtype: 'list',
            reference: 'list',
            emptyText: 'No matching posts found.',
            plugins: 'pullrefresh',
            store: {
                type: 'form-forum-posts',
                pageSize: 10
            },
            itemTpl : '<a class="search-item" href="http://www.sencha.com/forum/showthread.php?t={topicId}&p={id}">' +
                        '<h3><span>{[Ext.Date.format(values.lastPost, "M j, Y")]}<br />by {author}</span>{title}</h3>' +
                        '{excerpt}' +
                    '</a>'
        }]
    }]
});
