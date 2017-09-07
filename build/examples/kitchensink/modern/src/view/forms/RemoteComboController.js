Ext.define('KitchenSink.view.forms.RemoteComboController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.form-remote-combo',
    
    onThreadSelect: function(combo, record) {
        var url = 'http://www.sencha.com/forum/showthread.php?t=' +
                record.get('topicId') + '&p=' + record.get('id');
        
        window.open(url, '_blank');
    }
});
