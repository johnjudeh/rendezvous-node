'use strict';

// Only part written in jQuery due to
// implementation of SemanticUI lib

$('.ui.dropdown').dropdown();
$('.ui.checkbox').checkbox();

$('a.next.formButton').click(function () {
  toggleForms();
});

$('a.back.formButton').click(function () {
  toggleForms();
});

function toggleForms() {
  $('#personalForm').toggleClass('hidden');
  $('#interestsForm').toggleClass('hidden');
}