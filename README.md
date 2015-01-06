# GCDJ Widget #
### JavaScript based customizable view to create and edit json conform to GCDJ schemata ###


## Installation ##
- No explicit installation or download needed
- Just include the required javascript and css

```html

<!--  gcdj_widget css and javascript imports -->
<script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/jquery-2.1.1.min.js"></script>
<script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/jquery-ui.min.js"></script>
<script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/jquery-ui-timepicker-addon.min.js"></script>
<script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/jquery-ui-sliderAccess.js"></script>
<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
<script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/alpaca-full.min.js"></script>
<script src="http://alni.mpi-bremen.de/static/gcdj_widget/js/gcdj_widget.js"></script>
<link rel="stylesheet" href="http://alni.mpi-bremen.de/static/gcdj_widget/css/gcdj_widget.css">
<!-- end of gcdj_widget css and javascript imports -->

```

- Add a target container into your HTML code

```!html
<div id="target_1"></div>
```



## Configuration ##
The following settings can be customized:

1. Set the name of the target container inside a *.html file (div is expected here). This container will be populated with a variety of form fields.
2. Set the url to the serverside componenent that will recieve the submitted form
3. Implement a post render function to add custom code to the freshly rendered widget. E.g. add some logging or add some code to allow requests to your server-side code
4. Choose to validate the json from the form against the "official" GCDJ validation webservice


```javascript

<script>
   var targetContainerId = "target_1";
   var checkListFormAction = "theAction";
   var postRenderAction = function () {
      console.log('postrender from html');
   };
   var validateUsingWebservice = true;
</script>

```

## Libraries ##
Right now GCDJ widget has dependencies to the following components (compare Installation section)

### Jquery: ###
* JQuery 2.1.1 release as available via http://code.jquery.com/jquery-2.1.1.min.js
* Alpaca Version 1.1.3 as available via http://www.alpacajs.org/js/alpaca-full.min.js

### JqueryUI: ###
* JQueryUI 1.11.1 release as available via http://code.jquery.com/ui/1.11.1/jquery-ui.min.js
* JQueryUI timepicker add-on as available via //cdnjs.cloudflare.com/ajax/libs/jquery-ui-timepicker-addon/1.4.5/jquery-ui-timepicker-addon.min.js
* Slider access for timepicker as available via //cdnjs.cloudflare.com/ajax/libs/jquery-ui-timepicker-addon/1.4.5/jquery-ui-sliderAccess.js

### Boostrap: ###
* Bootstap release  3.0.3 javascript as available via //netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"

### GCDJ-Widget: ###
* The widget javascript sources are delivered via http://alni.mpi-bremen.de/static/gcdj_widget/js/gcdj_widget.js
* All CSS dependencies and imports are resolved by using the GCDJ-widget css file as available here  http://alni.mpi-bremen.de/static/gcdj_widget/css/gcdj_widget.css

