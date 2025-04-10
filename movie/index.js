document.addEventListener("DOMContentLoaded", function () {
  const pathMatch = window.location.pathname.match(/\/movie\/?$/);
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');

  function injectMeta(title, description, image) {
    document.title = title;

    const metaDesc = document.createElement('meta');
    metaDesc.name = "description";
    metaDesc.content = description;
    document.head.appendChild(metaDesc);

    const ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.content = title;
    document.head.appendChild(ogTitle);

    const ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    ogDesc.content = description;
    document.head.appendChild(ogDesc);

    const ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.content = image;
    document.head.appendChild(ogImage);
  }

  if (query && /^\d+$/.test(query)) {
    const movieId = query;
    const container = document.getElementById('searchResults');
    container.innerHTML = '<div id="movie-detail">Loading movie...</div>';

    fetch(`https://45.150.65.4/smart-movie/get-movie.php?id=${movieId}`)
      .then(res => res.json())
      .then(({ movie, credits, videos, recommendations, keywords }) => {
        const trailer = videos.results.find(v => v.site === "YouTube" && v.type === "Trailer");
        const cast = credits.cast.slice(0, 6);
        const director = credits.crew.find(p => p.job === 'Director');
        const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
        const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : '';
        const year = movie.release_date ? movie.release_date.substring(0, 4) : '';
        const imdbLink = `https://www.imdb.com/title/${movie.imdb_id}`;

        injectMeta(`${movie.title} (${year}) - Smart Movie LK21`, movie.overview, poster);

        let html = '';

        if (backdrop) {
          html += `<img src="${backdrop}" style="width:100%;max-height:400px;object-fit:cover;border-radius:10px;margin-bottom:20px;" alt="Backdrop">`;
        }

        const genreLinks = movie.genres.map(g =>
          `<a href="/smart-movie/genre/?genreId=${g.id}" rel="tag" class="genre-link" style="margin-right:6px;text-decoration:none;color:#90ee90;">🎭 ${g.name}</a>`
        ).join(', ');

        const keywordLinks = keywords.keywords.map(k =>
          `<a href="/smart-movie/keyword/?keyword=${k.id}" class="keyword-link" style="display:inline-block;background:#eee;padding:4px 8px;margin:2px;border-radius:6px;text-decoration:none;">#${k.name}</a>`
        ).join(' ');

        html += `
          <div style="display:flex;flex-wrap:wrap;gap:20px;margin-top:20px;">
            <img src="${poster}" style="max-width:300px;border-radius:10px;">
            <div>
              <h1>Nonton Film ${movie.title} (${year}) Sub Indo LK21</h1>
              <p><strong>Original Title:</strong> ${movie.original_title}</p>
              <p><strong>Release:</strong> ${movie.release_date}</p>
              <p><strong>Rating:</strong> ${movie.vote_average}/10</p>
              <p><strong>Genres:</strong> ${genreLinks}</p>
              <p><strong>Director:</strong> ${director ? `<a href="/smart-movie/cast/?q=${encodeURIComponent(director.name)}">${director.name}</a>` : 'Unknown'}</p>
              <p>${movie.overview}</p>
              <p><strong>IMDB:</strong> <a href="${imdbLink}" target="_blank">${movie.imdb_id}</a></p>
              <p><strong>Keywords:</strong> ${keywordLinks || '—'}</p>
            </div>
          </div>
          <hr>
          <h2>🎬 Trailer</h2>
          ${trailer ? `<iframe width="100%" height="350" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : '<p><em>No trailer available.</em></p>'}
          <hr>
          <button id="watch-btn" style="padding:10px 20px;font-size:16px;border:none;background:#1e90ff;color:#fff;border-radius:8px;cursor:pointer;">
            🎬 Tonton Film Ini
          </button>
          <div id="player-container" style="margin-top:20px;display:none;"></div>
          <h2>👥 Cast</h2>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            ${cast.map(actor => {
              const img = actor.profile_path
                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                : 'https://via.placeholder.com/185x278?text=No+Image';
              return `<div style="text-align:center;width:120px;">
                <a href="/smart-movie/cast/?q=${encodeURIComponent(actor.name)}">
                  <img src="${img}" style="width:100%;border-radius:10px;">
                  <small><strong>${actor.name}</strong><br><em>as ${actor.character}</em></small>
                </a>
              </div>`;
            }).join('')}
          </div>
        `;

        if (recommendations.results.length) {
          html += `
            <hr>
            <h2>🎥 Recommendations</h2>
            <div style="display:flex;flex-wrap:wrap;gap:15px;">
              ${recommendations.results.slice(0, 6).map(rec => {
                const recPoster = rec.poster_path
                  ? `https://image.tmdb.org/t/p/w185${rec.poster_path}`
                  : 'https://via.placeholder.com/185x278?text=No+Image';
                const recTitle = rec.title + (rec.release_date ? ` (${rec.release_date.substring(0, 4)})` : '');
                return `
                  <div style="width:120px;text-align:center;">
                    <a href="/smart-movie/movie/?q=${rec.id}">
                      <img src="${recPoster}" alt="${rec.title}" style="width:100%;border-radius:10px;">
                      <small>${recTitle}</small>
                    </a>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }

        container.innerHTML = html;

        document.getElementById('watch-btn').addEventListener('click', () => {
          const playerHTML = `
            <div style="background:#fff3cd;color:#856404;padding:10px 15px;margin-bottom:20px;border:1px solid #ffeeba;border-radius:8px;">
              ⚠️ <strong>Gunakan VPN atau Google Chrome</strong> jika video tidak bisa diputar atau muncul error.
            </div>
            <h3>Nonton via VidSrc</h3>
            <iframe src="https://vidsrc.xyz/embed/movie?tmdb=${movie.id}" width="100%" height="450" frameborder="0" allowfullscreen loading="lazy" style="border-radius:10px;"></iframe>
            <h3 style="margin-top:30px;">Nonton via GDrivePlayer</h3>
            <iframe src="https://databasegdriveplayer.xyz/player.php?tmdb=${movie.id}" width="100%" height="450" frameborder="0" allowfullscreen loading="lazy" style="border-radius:10px;"></iframe>
          `;
          const playerContainer = document.getElementById('player-container');
          playerContainer.innerHTML = playerHTML;
          playerContainer.style.display = 'block';
        });

        const ldJson = {
          "@context": "https://schema.org",
          "@type": "Movie",
          "name": movie.title,
          "image": poster,
          "description": movie.overview,
          "datePublished": movie.release_date,
          "genre": movie.genres.map(g => g.name),
          "aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": 6.782,
  "ratingCount": 3149,
  "bestRating": 10,
  "worstRating": 0
},
          "director": director ? {
            "@type": "Person",
            "name": director.name
          } : undefined,
          "url": window.location.href
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(ldJson, null, 2);
        document.head.appendChild(script);

      })
      .catch(err => {
        console.error("Failed to load movie from search:", err);
        container.innerHTML = "<p style='color:red;'>Movie not found.</p>";
      });
  }
});
