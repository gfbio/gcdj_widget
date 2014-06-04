# GCDJ Widget
#### JavaScript based customizable view to create and edit json conform to GCDJ schemata

##Installation
- checkout or download
- extract
- move/copy to your webserver
- include to html page (compare example.html)

##Configuration
On top of the main gcdj_widget.js file, certain configuration values have to be set
in order to make the widget work on a server.

* The name of the target container inside a *.html file (div is expected here)
* An URI of a server-side script that handles the widgets submitted formdata
* A location where to find check_list schema and options files (*.json)
* Same for the select form in the widgets first step

```javascript
/******** CONFIGURATION ********/
var targetContainerId = "target_1";
var checkListFormAction = "TheAction";
var checkListSchemaLocation = "./gcdj_widget/data/checklist_schema.json";
var checkListOptionsLocation = "./gcdj_widget/data/checklist_options.json";
var selectSchemaLocation = "./gcdj_widget/data/select_schema.json";
var selectOptionsLocation = "./gcdj_widget/data/select_options.json";
// add extra validation if you like
function submitCheckListForm(form){
 return true;
}
/******** END CONFIGURATION *****/
```

##Libraries
- Latest JQuery release as available via http://code.jquery.com/jquery-latest.js
- jQuery Templates Plugin 1.0.0pre as available via http://github.com/jquery/jquery-tmpl (contained in widget package)
- Alpaca Version 1.1.2 as available via http://www.alpacajs.org/web/download.html(contained in widget package