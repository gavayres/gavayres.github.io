(function() {
  'use strict';

  // Set margin text position to start below front-matter
  function positionMarginText() {
    const frontMatter = document.querySelector('.front-matter');
    const marginTexts = document.querySelectorAll('.margin-text');
    
    if (frontMatter && marginTexts.length > 0) {
      const frontMatterRect = frontMatter.getBoundingClientRect();
      const frontMatterBottom = frontMatterRect.bottom + window.scrollY;
      
      marginTexts.forEach(function(marginText) {
        marginText.style.top = frontMatterBottom + 'px';
      });
    }
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', positionMarginText);
  } else {
    positionMarginText();
  }

  // Recalculate on window resize
  window.addEventListener('resize', positionMarginText);
})();

