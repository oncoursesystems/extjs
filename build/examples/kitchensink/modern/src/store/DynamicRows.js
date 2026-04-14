Ext.define('KitchenSink.store.DynamicRows', {
    extend: 'Ext.data.Store',
    alias: 'store.dynamic-rows',

    generateData: function(numRows, numCols) {
        var arrData = [],
            temp, i, j,
            departments = ['Science', 'Commerce', 'Art'];

        for (i = 0; i < numRows; i++) {
            temp = {};

            // Add department column with cycling values
            temp.department = departments[i % 3];

            // Add count column with random values between 1-100
            temp.count = Math.floor(Math.random() * 100) + 1;

            for (j = 0; j < numCols; j++) {
                temp["col" + j] = i + "-" + j;
            }

            arrData.push(temp);
        }

        return arrData;
    },

    generateFields: function(data) {
        return Object.keys(data[0] || {});
    },

    refreshData: function(numRows, numCols) {
        var data = this.generateData(numRows || 50, numCols || 100);

        this.setData(data);
    },

    constructor: function(config) {
        var numRows = (config && config.numRows) || 50,
            numCols = (config && config.numCols) || 100,
            data = this.generateData(numRows, numCols),
            fields = this.generateFields(data);

        config = Ext.apply({
            fields: fields,
            data: data
        }, config);

        this.callParent([config]);
    }
});
