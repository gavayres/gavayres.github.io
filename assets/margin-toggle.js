(function() {
  'use strict';

  // Get the toggle button and margin text elements
  const marginToggle = document.getElementById('margin-toggle');
  const marginTexts = document.querySelectorAll('.margin-text');
  
  // Only proceed if margin texts exist
  if (marginTexts.length === 0) {
    return;
  }

  // Show the toggle button
  if (marginToggle) {
    marginToggle.style.display = 'inline-block';
  }

  // Check for saved preference or default to visible
  const marginsVisible = localStorage.getItem('marginsVisible');
  const shouldShow = marginsVisible === null || marginsVisible === 'true';

  // Apply initial state
  if (!shouldShow) {
    document.body.classList.add('margins-hidden');
    if (marginToggle) {
      marginToggle.textContent = ' | ';
    }
  } else {
    if (marginToggle) {
      marginToggle.textContent = '|||';
    }
  }

  // Toggle margins when button is clicked
  if (marginToggle) {
    marginToggle.addEventListener('click', function() {
      const isHidden = document.body.classList.toggle('margins-hidden');
      
      // Update button icon
      marginToggle.textContent = isHidden ? ' | ' : '|||';
      
      // Save preference to localStorage
      localStorage.setItem('marginsVisible', !isHidden ? 'true' : 'false');
    });
  }
})();

