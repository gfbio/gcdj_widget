/*!
 GCDJ_WIDGET VERSION 1.0.1
 */
/*jslint browser: true*/
/*global $, jQuery, targetContainerId, checkListFormAction, postRenderAction, validateUsingWebservice, initialDataLocation, initialData*/

/**
* Pointing to the resource that provides a collection of MiXS-lists used to render the GCDJ widget
* @constant
* @type {string}
* @default
*/
var checkListPackagesLocation = 'http://alni.mpi-bremen.de/widget_schemas/checklist_packages';
//var checkListPackagesLocation = './gcdj_widget/data/schemas/checklist_packages.json';

/**
 * Pointing to the resource that provides the options used by alpaca, corresponding to the MiXS-lists defined above
 * @constant
 * @type {string}
 * @default
 */
var checkListPackageOptionsLocation = 'http://alni.mpi-bremen.de/widget_options/checklist_options';
//var checkListPackageOptionsLocation = './gcdj_widget/data/options/checklist_options.json';

/**
 * Pointing to the resource that provides the select-box json-schema used when rendering the selection of package / checklist
 * @constant
 * @type {string}
 * @default
 */
var selectSchemaLocation = 'http://alni.mpi-bremen.de/widget_schemas/select';
//var selectSchemaLocation = './gcdj_widget/data/schemas/select.json';

/**
 * Pointing to the resource that provides the select-box options used when rendering the selection of package / checklist
 * @constant
 * @type {string}
 * @default
 */
var selectOptionsLocation = 'http://alni.mpi-bremen.de/widget_options/select';
//var selectOptionsLocation = './gcdj_widget/data/options/select.json';

/**
 * A container object to bundle the URLs of select-schema and options, which will be handled over when calling alcaca-js
 * @type {Object}
 */
var selectInputBundle = {
    'optionsSource': selectOptionsLocation,
    'schemaSource': selectSchemaLocation
};

/**
 * A container object keeping the json-schema definitions needed to render the package/checklist form.
 * @type {Object}
 * @default
 */
var checkListPackages = {};

/**
 * A container object keeping the options needed to render the package/checklist form.
 * @type {Object}
 * @default
 */
var packageOptions = {};

/**
 * A container object to store data used to prefill the widgets formfields. Used when data is provided via presenting a url or assigning it directly
 * @type {Object}
 * @default
 */
var checkListData = {};

/**
 * An array to store the selection of MiXS-checklists that should be rendered. Fill with 1-N checklist names.
 * @type {Array}
 * @default
 */
var checklistSelection = [];

/**
 * A container object containing a stub of the options needed to render the package/checklist form.
 * @type {Object}
 * @default
 */
var checkListOptions = {
    "fields": {},
    "renderForm": true,
    "form": {
        "buttons": {
            "reset": {},
            "submit": {
                "id": "checklist_submit"
            }
        },
        "attributes": {
            "action": "ACTION",
            "onsubmit": "return submitCheckListForm(this);",
            "id": "gcdj_checklist_form",
            "method": "post"
        }
    }
};

/**
 * A container object containing a stub of the json-schema needed to render the package/checklist form.
 * @type {Object}
 * @default
 */
var checkListSchema = {
    "description": "Please fill form fields below",
    "title": "Package / Checklist form",
    "type": "object",
    "properties": {
        "file_upload": {
            "type": "string",
            "format": "uri"
        }
    }
};

/**
 * Once alpaca rendered the widget and the actual form is known to the DOM-tree it will be assigned to this var, thus making the form available beyond the scope of alpacas postRender event
 * @type {Object}
 * @default
 */
var globalForm = {};

/**
 * Used to keep the selected checklist to reuse it later
 * @type {string}
 * @default
 */
var checklist = '';

/**
 * Used to keep the selected package to reuse it later
 * @type {string}
 * @default
 */
var pack = '';

/**
 * Used to keep track of radio and checkbox form-fields, to add them to the form before submit. E.g. if a radio button is set, the form will contain a field for this radio button with value true, on the other hand if the button is un-set there will be no form key at all.
 * @type {Array}
 * @default
 */
var boolean_fields = [];

/**
 * The id of a html element that is added automatically, which will display feedback from the optional webservice-validation
 * @type {string}
 * @default
 */
var feedbackId = 'gcdj_feedback';

/**
 * Text for the headline of error-report
 * @constant
 * @type {string}
 * @default
 */
var feedbackHeader = 'The validation of your data against the GCDJ Webservice resulted in following errors';

/**
 * Text for the headline of success-report
 * @constant
 * @type {string}
 * @default
 */
var feedbackSucces = 'The validation of your data against the GCDJ Webservice found no errors. click again to submit';

/**
 * Keep track of success or fail of web-service validation
 * @type {boolean}
 * @default
 */
var formPassedValidation = false;

/**
 * When called, this function will append a hidden field to the form rendered by alpaca, to make the actual json-content available in the form submit
 * @param {Object} gcdjson
 */
function renderSelectForm() {
    'use strict';
    // if selectform is rendered, a selection via this form is desired, so empty existing array ...
    checklistSelection = [];
    $('#' + targetContainerId).alpaca(selectInputBundle);
}

/**
 * When called, this function will append a hidden field to the form rendered by alpaca, to make the actual json-content available in the form submit
 * @param {Object} gcdjson
 */
function addJsonFormField(gcdjson) {
    'use strict';
    $('<input />').attr('type', 'hidden')
        .attr('name', 'gcdjson')
        .attr('value', JSON.stringify(gcdjson))
        .appendTo('form#gcdj_checklist_form');
}

/**
 * Parses the response of the webservice-based validation of the json created by the form. Displays success or error message and returns whether validation was a success (true) or not (false).
 * @param {Object} data
 * @returns {boolean}
 */
function onSuccess(data) {
    'use strict';
    $('#' + feedbackId).empty();
    if (data.gcdj_valid) {
        $('#' + feedbackId).css('marginLeft', '30px');
        $('#' + feedbackId).append('<h4>' + feedbackSucces + '</h4>');
        return true;
    }
    $('#' + feedbackId).css('marginLeft', '30px');
    $('#' + feedbackId).append('<h4>' + feedbackHeader + '</h4>');
    $('#' + feedbackId).append('<ul>');
    $.each(data['errors'], function (index, value) {
        $('#' + feedbackId).append('<li>' + value + '</li>');
    });
    $('#' + feedbackId).append('</ul>');
    return false;
}

/**
 * This function will be called upon submit, as assigned in options/checklist.json. This is the place to add some custom validation if needed.
 * @param form
 * @returns {boolean}
 */
function submitCheckListForm(form) {
    'use strict';
    return true;
}

/**
 * This function adds a div with to the targetContainer-div, to later display validation messages
 */
function prepareFeedbackContainer() {
    'use strict';
    var div = document.createElement('div');
    div.id = feedbackId;
    $('#' + targetContainerId).append(div);
}

/**
 * This hack offers the possibility to check if the 'validateUsingWebservice' property is set anywhere
 * @returns {boolean}
 */
var isValidationTriggerSet = function () {
    'use strict';
    return (typeof validateUsingWebservice !== 'undefined');
};

/**
 * This hack offers the possibility to check the 'initialDataLocation' property is set anywhere
 * @returns {boolean}
 */
var isInitialDataLocationSet = function () {
    'use strict';
    return (typeof initialDataLocation !== 'undefined');
};

/**
 * This hack offers the possibility to check the 'initialData' property is set anywhere
 * @returns {boolean}
 */
var isInitialDataSet = function () {
    'use strict';
    return (typeof initialData !== 'undefined');
};

/**
 * Checks to whether to use webservice validation (true) or not (false)
 * @returns {boolean}
 * @default false
 */
var useWebServiceValidation = function () {
    'use strict';
    if (isValidationTriggerSet()) {
        return validateUsingWebservice;
    }
    return true;
};

/**
 * Processing the form-keys in boolean_fields and attach them to the gcdjson-propery.
 * @param gcdjson
 */
function add_missing_keys(gcdjson) {
    'use strict';
    for (var key in boolean_fields) {
        if ($.inArray(boolean_fields[key], gcdjson) === -1) {
            gcdjson[boolean_fields[key]] = false;
        }
    }
}


var addWebServiceValidationEvent = function () {
    'use strict';
    $('#checklist_submit').click(function (event) {
        var gcdjson = {};
        if (useWebServiceValidation()) {
            if (!formPassedValidation) {
                event.preventDefault();
                gcdjson = globalForm.getValue();
                add_missing_keys(gcdjson);
                var url = 'http://alni.mpi-bremen.de/validate?checklist=' + checklist + '&package=' + pack;
                var jqxhr = $.post(url, {'gcdjson': JSON.stringify(gcdjson)},
                    function (data) {
                        formPassedValidation = onSuccess(data);
                        if (formPassedValidation) {
                            addJsonFormField(gcdjson);
                        }
                    })
                    .fail(function () {
                        console.log(' validateJsonViaWebService error ');
                    })
                    .always(function () {
                        console.log(' validateJsonViaWebService finished valid = ' + formPassedValidation);
                    });
            }
        }
        else {
            gcdjson = globalForm.getValue();
            add_missing_keys(gcdjson);
            addJsonFormField(gcdjson);
        }

    });
};

/**
 * This function actually performs the calls to let alpacajs render the form for a given checklist/package combination.
 * Adds custom javascript code that, if provided, is executed after rendering. Adds the feedback-container and
 * Takes care of the optional web-service validation
 * @param prefillData if provided this data is used to prefill the formfields
 */
function renderCheckListForm(prefillData) {
    'use strict';
    $('#' + targetContainerId).empty();
    var widget_schema = {};
    checkListOptions.form.attributes.action = checkListFormAction;
    $.extend(checkListOptions.fields, packageOptions['file_upload']);

    for (var i = 0; i < checklistSelection.length; ++i) {
        if (packageOptions.hasOwnProperty(checklistSelection[i])) {
            $.extend(checkListOptions.fields, packageOptions[checklistSelection[i]]);
        }
        if (checkListPackages.hasOwnProperty(checklistSelection[i])) {
            $.extend(checkListSchema.properties, checkListPackages[checklistSelection[i]].properties);
        }
    }
    extract_boolean_fields(checkListSchema.properties);


    widget_schema.view = "bootstrap-edit";
    // TODO: recherche and discus pros and cons of different views
    //widget_schema.view = "bootstrap-create";
    widget_schema.schema = checkListSchema;
    widget_schema.options = checkListOptions;

    if (typeof prefillData !== 'undefined' && !$.isEmptyObject(prefillData)) {
        widget_schema.data = prefillData;
    }

    widget_schema.postRender = function (form) {
        postRenderAction();
        prepareFeedbackContainer();
        //add onchange event for file input field
        $('#fileinput').on('change', function () {
            readSingleFile(this);
        });
        globalForm = form;
        addWebServiceValidationEvent();
    };
    $('#' + targetContainerId).alpaca(widget_schema);
}

/**
 * Extracts possible boolean fields for schemaproperties defined by a explicit checklist/package combionation
 * and adds them as keys to the boolean_fields property, which will be used to keep track of missing radio/checkbox form fields
 * @param {Object} schema_properties
 */
function extract_boolean_fields(schema_properties) {
    'use strict';
    for (var key in schema_properties) {
        if (schema_properties.hasOwnProperty(key)) {
            if (schema_properties[key].type === 'boolean') {
                boolean_fields[boolean_fields.length] = key;
            }
        }
    }
}

/**
 * When the select form is submitted, thus a checklist/package combination has been choosen, this function
 * sets the corresponding references in the checklist-schema and triggers the rendering function for the checklistform.
 * @param form
 * @returns {boolean}
 */
function submitSelectForm(form) {
    'use strict';
    $('form#gcdj_select_form').submit(function (event) {
        pack = $('#Environmental-Packages').val();
        checklist = $('#MIxS-Checklists').val();
        checklistSelection.push(pack);
        checklistSelection.push(checklist);
        renderCheckListForm(checkListData);
        event.preventDefault();
    });
    return true;
}

/**
 * Reads content of file, once it has completed the upload
 * @param evt
 */
function readSingleFile(evt) {
    'use strict';
    var file = evt.files[0];
    if (file) {
        var r = new FileReader();
        r.onload = function (e) {
            var data = e.target.result;
            data = JSON.parse(data);
            // only accept proper gcdjjson as provided by webservice
            if(data.hasOwnProperty('gcdjson')){
                data = data.gcdjson;
                renderCheckListForm(data);
            }
        };
        r.readAsText(file);
    }
}

/**
 * This method wraps the asyncronous loading of checklist data and options, after loading requested files the rendering will be triggered
 */
function loadAndRenderPackageData() {
    'use strict';
    $.when(
        $.getJSON(checkListPackagesLocation),
        $.getJSON(checkListPackageOptionsLocation)
    ).then(function (a, b) {
        checkListPackages = a[0]; // keep this when omitting select step
        packageOptions = b[0]; // keep this when omitting select step
        renderSelectForm();
        /***********  omitting select step *************/
        //checklistSelection.push('built environment');
        //checklistSelection.push('miens_c');
        // and
        //renderCheckListForm();
        // or
        //renderCheckListForm(checkListData);
        /********************* *************************/
    });
}

/**
 * Only call when document has been completly loaded !
 */
$(document).ready(function () {
    'use strict';
    var dataLocation = '';
    if (isInitialDataLocationSet()) {
        dataLocation = initialDataLocation;
    }
    var jqxhr = $.getJSON(dataLocation, function (prefillData) {
        if(prefillData.hasOwnProperty('gcdjson')) {
            prefillData = prefillData.gcdjson;
        }
        checkListData = prefillData;
    }).always(function() {
        if (isInitialDataSet()) {
            if(initialData.hasOwnProperty('gcdjson')) {
                initialData = initialData.gcdjson;
            }
            $.extend(checkListData, initialData);
        }
        loadAndRenderPackageData();
    });
});
