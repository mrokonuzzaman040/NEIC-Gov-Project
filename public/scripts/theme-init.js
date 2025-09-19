(function () {
  try {
    var storedTheme = window.localStorage.getItem('theme');
    var root = document.documentElement;

    if (storedTheme === 'dark') {
      root.classList.add('dark');
    } else if (storedTheme === 'light') {
      root.classList.remove('dark');
    }
  } catch (error) {
    // Ignore theme preference errors to avoid blocking render
  }
})();
