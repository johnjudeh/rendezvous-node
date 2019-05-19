'use strict';

var anchorTags = document.querySelectorAll('a');

// Adds event to keep web app in full-screen mode
anchorTags.forEach(function (anchor) {
  // No events added to a without data-href attr
  if (anchor.dataset.href) {
    anchor.addEventListener('click', function () {
      location.href = anchor.dataset.href;
    });
  }
});