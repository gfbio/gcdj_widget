/*!
 GCDJ_WIDGET VERSION 0.0.10
 */

// create docs with: https://github.com/jsdoc3/jsdoc

/**
 * Pointing to the resource that provides the checklist json-schema used to render the GCDJ widget
 * @constant
 * @type {string}
 * @default
 */
var checkListSchemaLocation = 'http://alni.mpi-bremen.de/widget_schemas/checklist';

/**
 * Pointing to the resource that provides the checklist options used when rendering the GCDJ widget
 * @constant
 * @type {string}
 * @default
 */
var checkListOptionsLocation = 'http://alni.mpi-bremen.de/widget_options/checklist';

/**
 * Pointing to the resource that provides the select-box json-schema used when rendering the selection of package / checklist
 * @constant
 * @type {string}
 * @default
 */
var selectSchemaLocation = 'http://alni.mpi-bremen.de/widget_schemas/select';

/**
 * Pointing to the resource that provides the select-box options used when rendering the selection of package / checklist
 * @constant
 * @type {string}
 * @default
 */
var selectOptionsLocation = 'http://alni.mpi-bremen.de/widget_options/select';

/**
 * A container object to bundle the URLs of select-schema and options, which will be handled over when calling alcaca-js
 * @type {Object}
 */
var selectInputBundle = {
    'optionsSource': selectOptionsLocation,
    'schemaSource': selectSchemaLocation
};

/** This functions wraps the rendering of the package/checklist selection from for the defined target-container */
function renderSelectForm() {
    $('#' + targetContainerId).alpaca(selectInputBundle);
}

/**
 * A container object keeping the options needed to render the package/checklist form.
 * @type {Object}
 * @default
 */
var checkListOptions = {};

/**
 * A container object keeping the json-schema needed to render the package/checklist form.
 * @type {Object}
 * @default
 */
var checkListSchema = {};

/**
 * The prefix that is used when dynamically referencing different schema-definitions. E.g. when selection a certain package/checklist combination
 * @type {string}
 * @default
 */
var definitionsPrefix = '#/definitions/';

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
function addJsonFormField(gcdjson) {
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
    $('#' + feedbackId).empty();
    if (data['gcdj_valid']) {
        $('#' + feedbackId).css('marginLeft', '30px');
        $('#' + feedbackId).append('<h4>' + feedbackSucces + '</h4>');
        return true;
    }
    else {
        $('#' + feedbackId).css('marginLeft', '30px');
        $('#' + feedbackId).append('<h4>' + feedbackHeader + '</h4>');
        $('#' + feedbackId).append('<ul>');
        $.each(data['errors'], function (index, value) {
            $('#' + feedbackId).append('<li>' + value + '</li>');
        });
        $('#' + feedbackId).append('</ul>');
        return false;
    }
}

/**
 * This function will be called upon submit, as assigned in options/checklist.json. This is the place to add some custom validation if needed.
 * @param form
 * @returns {boolean}
 */
function submitCheckListForm(form) {
    return true;
}

/**
 * This function adds a div with to the targetContainer-div, to later display validation messages
 */
function prepareFeedbackContainer() {
    div = document.createElement('div');
    div.id = feedbackId;
    $('#' + targetContainerId).append(div);
}

/**
 * This hack offers the possibility to check the 'validateUsingWebservice' property is set anywhere
 * @returns {boolean}
 */
var isValidationTriggerSet = function () {
    return !(typeof validateUsingWebservice === 'undefined');
};

/**
 * Checks to whether to use webservice validation (true) or not (false)
 * @returns {boolean}
 * @default false
 */
var useWebServiceValidation = function () {
    if (isValidationTriggerSet()) {
        return validateUsingWebservice;
    }
    else {
        return true;
    }
};

/**
 * Processing the form-keys in boolean_fields and attach them to the gcdjson-propery.
 * @param gcdjson
 */
function add_missing_keys(gcdjson) {
    for (var key in boolean_fields) {
        if ($.inArray(boolean_fields[key], gcdjson) == -1) {
            gcdjson[boolean_fields[key]] = false;
        }
    }
}


/**
 * This function actually performs the calls to let alpacajs render the form for a given checklist/package combination.
 * Adds custom javascript code that, if provided, is executed after rendering. Adds the feedbackcontainers
 * Takes care of the optional web-service validation
 */
function renderCheckListForm() {
    checkListOptions['form']['attributes']['action'] = checkListFormAction;
    checkListSchema['options'] = checkListOptions;
    checkListSchema['schema'] = checkListSchema;
    checkListSchema['postRender'] = function (form) {
        postRenderAction();
        prepareFeedbackContainer();
        globalForm = form;
    };
    $('#' + targetContainerId).alpaca(checkListSchema);

    if (useWebServiceValidation()) {
        $('#checklist_submit').click(function (event) {
            if (!formPassedValidation) {
                event.preventDefault();
                var formJson = globalForm.getValue();
                var gcdjson = $.extend({}, formJson['Environmental-Packages'],
                    formJson['MIxS-Checklists']);

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
        });
    }
    else {
        var formJson = globalForm.getValue();
        var gcdjson = $.extend({}, formJson['Environmental-Packages'],
            formJson['MIxS-Checklists']);
        addJsonFormField(gcdjson);
    }
}

/**
 * Extracts possible boolean fields for schemaproperties defined by a explicit checklist/package combionation
 * and adds them as keys to the boolean_fields property, which will be used to keep track of missing radio/checkbox form fields
 * @param {Object} schema_properties
 */
function extract_boolean_fields(schema_properties) {
    for (var key in schema_properties) {
        if (schema_properties.hasOwnProperty(key)) {
            if (schema_properties[key]['type'] == 'boolean') {
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
    $('form#gcdj_select_form').submit(function (event) {
        pack = $('#Environmental-Packages').val();
        checklist = $('#MIxS-Checklists').val();
        checkListSchema['properties']['Environmental-Packages']['$ref'] = definitionsPrefix + pack;
        checkListSchema['properties']['MIxS-Checklists']['$ref'] = definitionsPrefix + checklist;
        $('#' + targetContainerId).empty();

        extract_boolean_fields(checkListSchema['definitions'][checklist]['properties']);
        extract_boolean_fields(checkListSchema['definitions'][pack]['properties']);

        renderCheckListForm();
        event.preventDefault();
    });
    return true;
}

/**
 * Only call when document has been completly loaded !
 */
$(document).ready(function () {
    $.when(
        $.getJSON(checkListOptionsLocation),
        $.getJSON(checkListSchemaLocation)
    ).then(function (a, b) {
            checkListOptions = a[0];
            checkListSchema = b[0];
            renderSelectForm();
        });
});
