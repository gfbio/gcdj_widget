/*
* VERSION: 0.0.3
* */
/********   CONFIGURATION  ********/

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

/********   END CONFIGURATION  *****/

var selectInputBundle = {
    "optionsSource": selectOptionsLocation,
    "schemaSource": selectSchemaLocation
};

function renderSelectForm() {
    $("#"+targetContainerId).alpaca(selectInputBundle);
}

var checkListOptions = {};
var checkListSchema = {};
var definitionsPrefix = "#/definitions/";

function renderCheckListForm() {
    checkListOptions["form"]["attributes"]["action"] = checkListFormAction;
    checkListSchema["options"] = checkListOptions;
    checkListSchema["schema"] = checkListSchema;

    $("#"+targetContainerId).alpaca(checkListSchema);

}

function submitSelectForm(form){
    $("form#gcdj_select_form").submit(function(event) {
        checkListSchema["properties"]["Environmental-Packages"]["$ref"] = definitionsPrefix+$("#Environmental-Packages").val();
        checkListSchema["properties"]["MIxS-Checklists"]["$ref"] = definitionsPrefix+$("#MIxS-Checklists").val();
        $("#"+targetContainerId).empty();
        renderCheckListForm();
        event.preventDefault();
    });
    return true;
}

$(document).ready(function() {
    $.when(
        $.getJSON(checkListOptionsLocation),
        $.getJSON(checkListSchemaLocation)
    ).then(function(a, b){
            checkListOptions = a[0];
            checkListSchema = b[0];
            renderSelectForm();
    });
});
