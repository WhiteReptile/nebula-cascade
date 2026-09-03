const DRAFT_KEY = "opinion-ai-draft";

/** Runs before React so draft text appears even when client chunks fail to load. */
export function DraftHydrateScript() {
  const script = `
(function () {
  var KEY = ${JSON.stringify(DRAFT_KEY)};
  function apply() {
    try {
      var draft = sessionStorage.getItem(KEY);
      if (!draft) return true;
      var ta = document.querySelector('textarea[name="content"]');
      if (!ta) return false;
      if (!ta.value) ta.value = draft;
      return true;
    } catch (e) {
      return true;
    }
  }
  function run() {
    if (apply()) return;
    var tries = 0;
    var timer = setInterval(function () {
      if (apply() || ++tries > 50) clearInterval(timer);
    }, 50);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
