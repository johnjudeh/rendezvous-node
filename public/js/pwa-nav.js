const anchorTags = document.querySelectorAll('a');

// Adds event to keep web app in full-screen mode
anchorTags.forEach((anchor) => {
  if (anchor.dataset.href) {
    anchor.addEventListener('click', () => {
      location.href = anchor.dataset.href;
    });
  }
});
