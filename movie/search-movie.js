document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q");
  const page = parseInt(urlParams.get("page")) || 1;
  const apiKey = "17d9099b719dae12da8707505fe683b0";
  const container = document.getElementById("searchResults") || document.body;

  if (!query || query.length < 2 || /^\d+$/.test(query)) return;

  const encodedQuery = encodeURIComponent(query);

  fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodedQuery}&language=en-US&page=${page}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (!data.results || !data.results.length) {
        // Fallback ke people
        window.location.href = `/smart-movie/cast/?q=${encodedQuery}`;
        return;
      }

      document.title = `Search Results for \"${query}\" - Page ${page}`;

      const ldJson = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Search result for '${query}'`,
        itemListElement: data.results.map((movie, i) => ({
          "@type": "Movie",
          position: i + 1,
          name: movie.title,
          url: `/smart-movie/movie/?q=${movie.id}`,
          image: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : undefined,
          datePublished: movie.release_date,
        })),
      };
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(ldJson, null, 2);
      document.head.appendChild(script);

      let html = `<h2 style='color:#ff69b4;'>🎥 Search Results for "${query}"</h2>`;
      html += '<div style="display:flex;flex-wrap:wrap;gap:15px;">';
      data.results.forEach((movie) => {
        const poster = movie.poster_path
          ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
          : "https://via.placeholder.com/185x278?text=No+Image";
        const year = movie.release_date ? ` (${movie.release_date.substring(0, 4)})` : "";

        html += `
          <div style="width:120px;text-align:center;background:#222;padding:10px;border-radius:8px;">
            <a href="/smart-movie/movie/?q=${movie.id}" style="color:#90ee90;">
              <img src="${poster}" alt="${movie.title}" style="width:100%;border-radius:10px;">
              <small>${movie.title}${year}</small>
            </a>
          </div>
        `;
      });
      html += "</div>";

      const totalPages = data.total_pages;
      const prevPage =
        page > 1
          ? `<a href="?q=${encodedQuery}&page=${page - 1}" style="margin-right:10px;color:#ff69b4;">⬅️ Prev</a>`
          : "";
      const nextPage =
        page < totalPages
          ? `<a href="?q=${encodedQuery}&page=${page + 1}" style="margin-left:10px;color:#ff69b4;">Next ➡️</a>`
          : "";

      html += `<div style=\"margin-top:20px;text-align:center;\">
        ${prevPage}<span style=\"color:#90ee90;\">Page ${page} of ${totalPages}</span>${nextPage}
      </div>`;

      container.innerHTML = html;
    })
    .catch((err) => {
      console.error("Error fetching movie search:", err);
      container.innerHTML = "<p style='color:red;'>Search failed.</p>";
    });
});
 return;