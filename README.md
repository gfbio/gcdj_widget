# GCDJ Widget #
### JavaScript based customizable view to create and edit json conform to GCDJ schemata ###


## Installation ##
- No explicit installation or download needed
- Just include the required javascript and css

```
#!html

<!-- gcdj_widget css and javascript imports -->
    <script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/jquery-2.1.3.min.js"></script>
    <script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/handlebars-1.3.0.min.js"></script>
    <script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/jquery-ui.min.js"></script>
    <script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/jquery-ui-timepicker-addon.min.js"></script>
    <script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/jquery-ui-sliderAccess.js"></script>
    <script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/bootstrap.min.js"></script>
    <script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/alpaca.js"></script>
    <script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/gcdj_widget.js"></script>
    <link rel="stylesheet" href="http://alni.mpi-bremen.de/static/gcdj_widget/css/gcdj_widget.css">
<!-- end of gcdj_widget css and javascript imports -->

```

- Add a target container into your HTML code

```
#!html
<div id="target_1"></div>
```



## Configuration ##
The following settings can be customized:

1. Set the name of the target container inside a *.html file (div is expected here). This container will be populated with a variety of form fields.
2. Set the url to the serverside componenent that will recieve the submitted form
3. Implement a post render function to add custom code to the freshly rendered widget. E.g. add some logging or add some code to allow requests
to your server-side code.In this method you will also have access to all widget elements,
since rendering is finished and DOM access is possible now.
Right now the widgets configuration provides an id for the submit buttons of the form, to allow the binding of custom events.
(The id for the actual form submit is "checklist_submit", while the id for the submit button in the packagae/checklist selection step is "select_submit")
4. Choose to validate the json from the form against the "official" GCDJ validation webservice
5. It is possible to prefill the widgets form fields using two approaches. One is to specify an Url, in 'initialDataLocation',
pointing to a file that contains the GCDJ conform json-data. The other is to directly
assign and Javascript object to a variable ('initialData').

```
#!html

<script>
   var targetContainerId = "target_1";
   var checkListFormAction = "theAction";
   var postRenderAction = function () {
      console.log('postrender from html');
   };
   var validateUsingWebservice = true;
   var initialDataLocation = 'location/of/data.json';
   var initialData = {};
</script>

```

## Libraries ##
Right now GCDJ widget has dependencies to the following components (compare Installation section)

### Jquery: ###
* JQuery 2.1.3
* Alpaca Version 1.5.7

### JqueryUI: ###
* JQueryUI 1.11.1
* JQueryUI timepicker add-on 1.5.0
* Slider access for timepicker jquery-ui-sliderAccess.js 0.3

### Boostrap: ###
* Bootstap release  3.3.2 javascript as available via //netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"

### GCDJ-Widget: ###
* The widget javascript sources are delivered via http://alni.mpi-bremen.de/static/gcdj_widget/js/gcdj_widget.js
* All CSS dependencies and imports are resolved by using the GCDJ-widget css file as available here  http://alni.mpi-bremen.de/static/gcdj_widget/css/gcdj_widget.css

