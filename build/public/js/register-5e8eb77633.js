// Only part written in jQuery due to
// implementation of SemanticUI lib

$('.ui.dropdown').dropdown();
$('.ui.checkbox').checkbox();

$('a.next.formButton').click(() => {
  toggleForms();
});

$('a.back.formButton').click(() => {
  toggleForms();
});

function toggleForms() {
  $('#personalForm').toggleClass('hidden');
  $('#interestsForm').toggleClass('hidden');
}
