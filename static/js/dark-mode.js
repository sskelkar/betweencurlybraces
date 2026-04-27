// Dark mode toggle functionality
(function() {
  const DARK_MODE_KEY = 'darkMode';
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const moonIcon = '🌙';
  const sunIcon = '☀️';

  // Check for saved dark mode preference, default to light mode
  function getDarkModePreference() {
    const savedMode = localStorage.getItem(DARK_MODE_KEY);
    return savedMode === 'enabled';
  }

  // Update the UI based on dark mode state
  function updateDarkMode(isDark) {
    if (isDark) {
      document.body.classList.add('dark-mode');
      if (darkModeToggle) {
        darkModeToggle.textContent = sunIcon;
        darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
      }
      localStorage.setItem(DARK_MODE_KEY, 'enabled');
    } else {
      document.body.classList.remove('dark-mode');
      if (darkModeToggle) {
        darkModeToggle.textContent = moonIcon;
        darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
      }
      localStorage.setItem(DARK_MODE_KEY, 'disabled');
    }
  }

  // Initialize dark mode on page load
  function initDarkMode() {
    const isDark = getDarkModePreference();
    updateDarkMode(isDark);
  }

  // Toggle dark mode
  function toggleDarkMode() {
    const isDark = document.body.classList.contains('dark-mode');
    updateDarkMode(!isDark);
  }

  // Set up event listener
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
  } else {
    initDarkMode();
  }
})();
