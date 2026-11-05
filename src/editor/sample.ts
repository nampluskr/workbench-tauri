// Start-state document (SPEC common rules): a short HTML file, long enough to scroll.
export const SAMPLE_TITLE = "index.html";

export const SAMPLE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Sample page</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header>
      <h1>Sample page</h1>
      <nav>
        <a href="#intro">Intro</a>
        <a href="#list">List</a>
        <a href="#form">Form</a>
      </nav>
    </header>
    <main>
      <section id="intro">
        <h2>Intro</h2>
        <p>A short paragraph with <em>emphasis</em> and <code>code</code>.</p>
      </section>
      <section id="list">
        <h2>List</h2>
        <ul>
          <li>First</li>
          <li>Second</li>
          <li>Third</li>
        </ul>
      </section>
      <section id="form">
        <h2>Form</h2>
        <form action="/submit" method="post">
          <label for="name">Name</label>
          <input id="name" name="name" type="text" />
          <button type="submit">Send</button>
        </form>
      </section>
    </main>
    <footer>
      <small>Footer text</small>
    </footer>
    <script src="main.js"></script>
  </body>
</html>
`;
