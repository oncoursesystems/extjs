/**
 * This example shows how to enable column locking in a grid using the Lockable plugin.
 * Locked columns remain fixed on the left or right side while other columns scroll horizontally.
 * This is useful for keeping important identifier columns visible when scrolling through wide datasets.
 *
 */
Ext.define('KitchenSink.view.grid.core.LockablePlugin', {
    extend: 'Ext.grid.Grid',
    xtype: 'lockable-plugin-grid',
    title: 'Lockable Grid - Simpsons Family',

    requires: [
        'Ext.grid.plugin.Lockable',
        'Ext.grid.plugin.RowExpander',
        'Ext.grid.plugin.Summary',
        'Ext.grid.plugin.filterbar.FilterBar'
    ],

    profiles: {
        defaults: {
            height: 600,
            width: 900
        },
        phone: {
            defaults: {
                height: undefined,
                width: undefined
            }
        }
    },

    height: '${height}',
    width: '${width}',

    rowNumbers: true,
    hideHeaders: false,
    infinite: true,
    markDirty: true,

    selectable: {
        cells: true,
        drag: true,
        mode: 'multi'
    },

    plugins: [{
        type: 'lockable'
    }, {
        type: 'rowexpander'
    }, {
        type: 'gridsummary'
    }, {
        type: 'gridfilterbar'
    }],

    store: {
        autoLoad: true,
        fields: [
            'firstName', 'lastName', 'email', 'age', 'title',
            'phone', 'company', { name: 'id', type: 'int' }
        ],
        data: [{
            "id": 4951,
            "firstName": "Lisa",
            "lastName": "Simpson",
            "email": "lisa@simpsons.com",
            "age": 8,
            "title": "Ms",
            "phone": "555-111-1224",
            "company": "School"
        }, {
            "id": 24053,
            "firstName": "Bart",
            "lastName": "Simpson",
            "email": "bart@simpsons.com",
            "age": 9,
            "title": "Mr",
            "phone": "555-222-1234",
            "company": "Jail"
        }, {
            "id": 33485,
            "firstName": "Homer",
            "lastName": "Simpson",
            "email": "homer@simpsons.com",
            "age": 34,
            "title": "Mr",
            "phone": "555-222-1244",
            "company": "Springfield Nuclear Plant"
        }, {
            "id": 39294,
            "firstName": "Marge",
            "lastName": "Simpson",
            "email": "marge@simpsons.com",
            "title": "Mrs",
            "age": 32,
            "phone": "555-222-1254",
            "company": "Housewife"
        }, {
            "id": 54957,
            "firstName": "Maggie",
            "lastName": "Simpson",
            "email": "maggie@simpsons.com",
            "title": "Baby",
            "age": 1,
            "phone": "555-222-2224",
            "company": "Baby"
        }, {
            "id": 79531,
            "firstName": "Grandpa",
            "lastName": "Simpson",
            "email": "abe@simpsons.com",
            "title": "Mr",
            "age": 82,
            "phone": "555-392-4713",
            "company": "N/A"
        }]
    },

    itemConfig: {
        body: {
            tpl: '<div style="padding: 10px;"><strong>Additional Info:</strong><br/>' +
                    'Full Name: {firstName} {lastName}<br/>' +
                    'Contact: {email} | {phone}<br/>' +
                    'Works at: {company}</div>'
        }
    },

    defaults: {
        flex: 1
    },

    columns: [{
        text: 'ID',
        dataIndex: 'id',
        locked: true,
        alwaysLocked: true,
        summaryRenderer: function() {
            return 'Summary';
        }
    }, {
        text: 'First Name',
        dataIndex: 'firstName',
        filterType: 'string',
        editable: true
    }, {
        text: 'Last Name',
        dataIndex: 'lastName',
        filterType: 'string',
        editable: true
    }, {
        text: 'Age',
        dataIndex: 'age',
        summary: 'sum',
        editable: true,
        editor: 'numberfield'
    }, {
        text: 'Title',
        dataIndex: 'title',
        filterType: 'string',
        summary: 'count',
        editable: true
    }, {
        text: 'Phone Number',
        dataIndex: 'phone',
        editable: true
    }, {
        text: 'Email Address',
        dataIndex: 'email',
        editable: true
    }, {
        text: 'Company',
        dataIndex: 'company',
        locked: 'right',
        filterType: 'string',
        editable: true
    }],

    tools: [{
        type: 'gear',
        tooltip: 'Grid Actions',
        menu: [{
            text: 'Show Current Selection',
            iconCls: 'x-fa fa-info-circle',
            handler: function() {
                var grid = this.up('grid'),
                    selection = grid.getSelectable().getSelection();

                Ext.Msg.alert('Selection Info', 'Selection details logged to console. Check browser developer tools.');

                console.log('Current Selection:', selection);
                console.log('Start Cell:', selection.startCell);
                console.log('End Cell:', selection.endCell);
            }
        }, {
            text: 'Add New Record',
            iconCls: 'x-fa fa-plus',
            handler: function() {
                var grid = this.up('grid'),
                    store = grid.getStore(),
                    newRecord;

                newRecord = store.add({
                    id: Math.floor(Math.random() * 1000000),
                    firstName: 'New',
                    lastName: 'Person',
                    email: 'new@example.com',
                    age: 25,
                    title: 'Mr/Ms',
                    phone: '555-000-0000',
                    company: 'New Company'
                })[0];

                // Scroll to and select the new record
                grid.getNavigationModel().setPosition(newRecord, 0);
            }
        }, {
            text: 'Remove Selected',
            iconCls: 'x-fa fa-trash',
            handler: function() {
                var grid = this.up('grid'),
                    store = grid.getStore(),
                    selection = grid.getSelectable().getSelectedRecords();

                if (selection.length > 0) {
                    Ext.Msg.confirm('Delete Records', 'Are you sure you want to delete ' + selection.length + ' record(s)?',
                                    function(btn) {
                                        if (btn === 'yes') {
                                            store.remove(selection);
                                        }
                                    }
                    );
                }
                else {
                    Ext.Msg.alert('No Selection', 'Please select records to delete.');
                }
            }
        }]
    }]
});
