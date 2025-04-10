document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const genreId = parseInt(urlParams.get("genreId"));
  const page = parseInt(urlParams.get("page")) || 1;
  if (!genreId) return;

  const apiKey = '17d9099b719dae12da8707505fe683b0';
  const container = document.getElementById('searchResults');

  const genreMap = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
  };

  const genreName = genreMap[genreId] || `Genre ID ${genreId}`;
  container.innerHTML = `<h2 style=\"color:#ff69b4;\">🎬 Movie dengan Genre: ${genreName}</h2><p>Loading movies...</p>`;

   fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=en-US&page=${page}`)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.results) return;

      const movies = data.results;
      let html = '<div style="display:flex;flex-wrap:wrap;gap:15px;">';

      movies.forEach(movie => {
        const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : 'https://via.placeholder.com/185x278?text=No+Image';
        const year = movie.release_date ? ` (${movie.release_date.substring(0, 4)})` : '';
        const genresHTML = movie.genre_ids.map(id => {
  const isActive = id === genreId;
  const style = `
    display:inline-block;
    padding:2px 6px;
    margin:2px;
    border-radius:6px;
    font-size:12px;
    background:${isActive ? '#ff69b4' : '#333'};
    color:${isActive ? '#fff' : '#90ee90'};
    text-decoration:none;
  `;
  return `<a href='?genreId=${id}' style="${style}">${genreMap[id] || id}</a>`;
}).join(' ');
        const overview = movie.overview ? movie.overview.substring(0, 100) + '...' : 'No description available';

        html += `
          <div style="width:120px;text-align:center;background:#222;padding:10px;border-radius:8px;">
            <a href="/smart-movie/movie/?q=${movie.id}" style="color:#90ee90;">
              <img src="${poster}" alt="${movie.title}" style="width:100%;border-radius:10px;">
              <small>${movie.title}${year}</small>
            </a>
            <div style='margin-top:4px;'>${genresHTML}</div>
            <div style='font-size:12px;color:#ccc;margin-top:4px;'>${overview}</div>
          </div>
        `;
      });

      html += '</div>';

      const totalPages = data.total_pages;
      const prevPage = page > 1 ? `<a href="?genreId=${genreId}&page=${page - 1}" style="margin-right:10px;color:#ff69b4;">⬅️ Prev</a>` : '';
      const nextPage = page < totalPages ? `<a href="?genreId=${genreId}&page=${page + 1}" style="margin-left:10px;color:#ff69b4;">Next ➡️</a>` : '';

      html += `<div style="margin-top:20px;text-align:center;">
        ${prevPage}<span style="color:#90ee90;">Page ${page} of ${totalPages}</span>${nextPage}
      </div>`;

      container.innerHTML = html;
      document.title = `Movie dengan Genre ${genreName} - Page ${page}`;
    })

    .catch(err => {
      console.error("Error fetching genre movies:", err);
      container.innerHTML = "<p style='color:red;'>Gagal memuat daftar movie.</p>";
    });
});
