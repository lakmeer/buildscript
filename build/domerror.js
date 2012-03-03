
var ErrorBox = (function ErrorBoxClass () {

    function createStyle () {

        var styleText =
            ".errors    { position: absolute; top: 30px; left: 50%; width: 70%; margin-left: -35%;" +
            "             background: #404040; box-shadow: 0px 0px 10px rgba(0,0,0,0.7);" +
            "             color: #d20; border-radius: 15px; }" +
            ".errors ul { padding: 0px; margin: 20px; list-style: none; background: #333; box-shadow: 0px 0px 10px rgba(0,0,0,0.7) inset; }" +
            ".errors li { padding: 1px 20px; margin-bottom: -1px;" +
            "             box-shadow: 0 10px 10px -10px #d20 inset, 0 -10px 10px -10px #d20 inset; }";

        var styleElement = document.createElement('style');
            styleElement.innerHTML = styleText;

        document.head.appendChild(styleElement);
    }


    // Init

    createStyle();

    var errorList = document.createElement('ul');
        errorList.className = 'error-list';

    var errorBox = document.createElement('div');
        errorBox.appendChild(errorList);
        errorBox.className = 'errors';

    function dismiss () { document.body.removeChild(errorBox); }
    errorBox.addEventListener('click', function (event) { dismiss(); }, false);

    document.body.appendChild(errorBox);

    return {
        dismiss : dismiss,
        addItem : function _addItem (err) {

            var errorItem = document.createElement('li');
                errorItem.className = 'error';
                errorItem.innerHTML = "<pre>" + err + "</pre>";

            errorList.appendChild(errorItem);

        }
    }

}());


