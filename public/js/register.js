// Only part written in jQuery due to
// implementation of SemanticUI lib

$('.ui.dropdown').dropdown();
$('.ui.checkbox').checkbox();

$('.form-buttons__button.next').click(() => {
  toggleForms();
  window.scrollTo(0, 0);
});

$('.form-buttons__button.back').click(() => {
  toggleForms();
  window.scrollTo(0, 10000);
});

function toggleForms() {
  $('#personalForm').toggleClass('hidden');
  $('#interestsForm').toggleClass('hidden');
}
