/*!
 GCDJ_WIDGET VERSION 0.0.7
 */
/********   CONFIGURATION  ********/

var checkListSchemaLocation = 'http://alni.mpi-bremen.de/widget_schemas/checklist';
var checkListOptionsLocation = 'http://alni.mpi-bremen.de/widget_options/checklist';

var selectSchemaLocation = 'http://alni.mpi-bremen.de/widget_schemas/select';
var selectOptionsLocation = 'http://alni.mpi-bremen.de/widget_options/select';

/********   END CONFIGURATION  *****/

var selectInputBundle = {
    'optionsSource': selectOptionsLocation,
    'schemaSource': selectSchemaLocation
};

function renderSelectForm() {
    $('#' + targetContainerId).alpaca(selectInputBundle);
}

var checkListOptions = {};
var checkListSchema = {};
var definitionsPrefix = '#/definitions/';
var globalForm = {};
var checklist = '';
var pack = '';

var boolean_fields = [];

var feedbackId = 'gcdj_feedback';
var feedbackHeader = 'The validation of your data against the GCDJ Webservice resulted in following errors';
var feedbackSucces = 'The validation of your data against the GCDJ Webservice found no errors. click again to submit';

var formPassedValidation = false;

function addJsonFormField(gcdjson) {
    $('<input />').attr('type', 'hidden')
        .attr('name', 'gcdjson')
        .attr('value', JSON.stringify(gcdjson))
        .appendTo('form#gcdj_checklist_form');
}

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

function submitCheckListForm(form) {
    return true;
}

function prepareFeedbackContainer() {
    div = document.createElement('div');
    div.id = feedbackId;
    $('#' + targetContainerId).append(div);
}

var isValidationTriggerSet = function () {
    return !(typeof validateUsingWebservice === 'undefined');
};

var useWebServiceValidation = function () {
    if (isValidationTriggerSet()) {
        return validateUsingWebservice;
    }
    else {
        return true;
    }
};

function add_missing_keys(gcdjson) {
    for (var key in boolean_fields) {
        if ($.inArray(boolean_fields[key], gcdjson) == -1) {
            gcdjson[boolean_fields[key]] = false;
        }
    }
}

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

function extract_boolean_fields(schema_properties) {
    for (var key in schema_properties) {
        if (schema_properties.hasOwnProperty(key)) {
            if (schema_properties[key]['type'] == 'boolean') {
                boolean_fields[boolean_fields.length] = key;
            }
        }
    }
}

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
