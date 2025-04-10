document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const keywordId = urlParams.get("keyword");
  const page = parseInt(urlParams.get("page")) || 1;

  if (!keywordId) return;

  const apiKey = '17d9099b719dae12da8707505fe683b0';
  const container = document.getElementById('searchResults') || document.body;

  container.innerHTML = `<h2 style='color:#ff69b4;'>🔑 Keyword Movies</h2><p>Loading movies...</p>`;

  fetch(`https://api.themoviedb.org/3/keyword/${keywordId}?api_key=${apiKey}`)
  .then(res => res.json())
  .then(keywordData => {
    const keywordName = keywordData.name || 'Keyword';
    document.title = `Movie with Keyword: ${keywordName}`;
    container.innerHTML = `<h2 style='color:#ff69b4;'>🔑 ${keywordName}</h2><p>Loading movies...</p>`;

    return fetch(`https://api.themoviedb.org/3/keyword/${keywordId}/movies?api_key=${apiKey}&language=en-US&include_adult=true&page=${page}`);
  })
  .then(res => res.json())
  .then(data => {
    if (!data || !data.results) {
      container.innerHTML += `<p style='color:red;'>No movies found for this keyword.</p>`;
      return;
    }

    let html = '<div style="display:flex;flex-wrap:wrap;gap:15px;">';

    data.results.forEach(movie => {
      const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : 'https://via.placeholder.com/185x278?text=No+Image';
      const year = movie.release_date ? ` (${movie.release_date.substring(0, 4)})` : '';
      const overview = movie.overview ? movie.overview.substring(0, 100) + '...' : 'No description available';
      const genresHTML = (movie.genre_ids || []).map(id => {
        const name = {
          28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",99:"Documentary",
          18:"Drama",10751:"Family",14:"Fantasy",36:"History",27:"Horror",10402:"Music",
          9648:"Mystery",10749:"Romance",878:"Science Fiction",10770:"TV Movie",53:"Thriller",
          10752:"War",37:"Western"
        }[id] || id;
        return `<a href='?genreId=${id}' style='display:inline-block;padding:2px 6px;margin:2px;border-radius:6px;font-size:12px;background:#333;color:#90ee90;text-decoration:none;'>${name}</a>`;
      }).join(' ');

      html += `
        <div style="width:120px;text-align:center;background:#222;padding:10px;border-radius:8px;">
          <a href="/smart-movie/movie/?q=${movie.id}" style="color:#90ee90;">
            <img src="${poster}" alt="${movie.title}" style="width:100%;border-radius:10px;">
            <small>${movie.title}${year}</small>
          </a>
          <div style='margin-top:4px;'>${genresHTML}</div>
          <div style='font-size:12px;color:#ccc;margin-top:4px;'>${overview}</div>
        </div>`;
    });

    html += '</div>';

    const totalPages = data.total_pages;
    const prevPage = page > 1 ? `<a href="?keyword=${keywordId}&page=${page - 1}" style="margin-right:10px;color:#ff69b4;">⬅️ Prev</a>` : '';
    const nextPage = page < totalPages ? `<a href="?keyword=${keywordId}&page=${page + 1}" style="margin-left:10px;color:#ff69b4;">Next ➡️</a>` : '';

    html += `<div style="margin-top:20px;text-align:center;">
      ${prevPage}<span style="color:#90ee90;">Page ${page} of ${totalPages}</span>${nextPage}
    </div>`;

    container.innerHTML = html;
  })
  .catch(err => {
    console.error("Error fetching keyword movies:", err);
    container.innerHTML += `<p style='color:red;'>Gagal memuat daftar movie.</p>`;
  });
});
