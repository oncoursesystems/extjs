/**
 * Demonstrates a ComboBox with a remotely filtered data source
 */
Ext.define('KitchenSink.view.forms.RemoteCombo', {
    extend: 'Ext.form.Panel',
    xtype: 'form-remote-combo',

    requires: [
        'Ext.field.ComboBox'
    ],

    //<example>
    otherContent: [{
        type: 'Store',
        path: 'app/store/ForumPosts.js'
    }, {
        type: 'Model',
        path: 'app/model/ForumPost.js'
    }],

    profiles: {
        defaults: {
            width: 300
        },
        phone: {
            width: undefined
        }
    },
    //</example>

    bodyPadding: 20,
    width: '${width}',
    autoSize: true,

    items:[{
        xtype: 'combobox',
        label: 'Forum threads',
        triggerAction: 'query',
        queryMode: 'remote',
        picker: 'floated',
        matchFieldWidth: false,
        store: {
            type: 'form-forum-posts'
        },
        floatedPicker: {
            maxWidth: 400,
            minWidth: 300
        },
        itemTpl: '<a class="remote-combo-search-item" href="http://www.sencha.com/forum/showthread.php?t={topicId}&p={id}" target="_blank">' +
                    '<h3><span>{[Ext.Date.format(values.lastPost, "M j, Y")]}<br>by {author}</span>{title}</h3>' +
                    '{excerpt}' +
                    '</a>'
    }]
});
