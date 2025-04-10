document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q");
  if (!query || query.length < 2) return;

  const container = document.getElementById("searchResults") || document.body;
  container.innerHTML = "<div id='person-detail'>Loading person details...</div>";

  const apiKey = "17d9099b719dae12da8707505fe683b0";
  const encodedQuery = encodeURIComponent(query);

  // Step 1: Cari ID person
  fetch(`https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodedQuery}`)
    .then(res => res.json())
    .then(data => {
      if (!data.results || !data.results.length) {
        //container.innerHTML = `<p style='color:red;'>No person found with name "${query}".</p>`;
        return;
      }

      const person = data.results[0];
      const personId = person.id;

      // Step 2: Ambil detail, credits, social
      Promise.all([
        fetch(`https://api.themoviedb.org/3/person/${personId}?api_key=${apiKey}&language=en-US`).then(r => r.json()),
        fetch(`https://api.themoviedb.org/3/person/${personId}/movie_credits?api_key=${apiKey}&language=en-US`).then(r => r.json()),
        fetch(`https://api.themoviedb.org/3/person/${personId}/external_ids?api_key=${apiKey}`).then(r => r.json())
      ])
        .then(([personDetail, credits, socials]) => {
          const profile = personDetail.profile_path
            ? `https://image.tmdb.org/t/p/w300${personDetail.profile_path}`
            : "https://via.placeholder.com/300x450?text=No+Image";

          const bio = personDetail.biography || "No biography available.";
          const birthday = personDetail.birthday || "Unknown";
          const place = personDetail.place_of_birth || "Unknown";
          const aliases = personDetail.also_known_as?.join(", ") || "None";
          const known = personDetail.known_for_department || "—";

          let socialLinks = "";
          if (socials.facebook_id)
            socialLinks += `<a href='https://facebook.com/${socials.facebook_id}' target='_blank'>Facebook</a> `;
          if (socials.instagram_id)
            socialLinks += `<a href='https://instagram.com/${socials.instagram_id}' target='_blank'>Instagram</a> `;
          if (socials.twitter_id)
            socialLinks += `<a href='https://twitter.com/${socials.twitter_id}' target='_blank'>Twitter</a> `;

          const movies = credits.cast.sort((a, b) => b.popularity - a.popularity);
          let movieList = movies.map(m => {
            const poster = m.poster_path
              ? `https://image.tmdb.org/t/p/w185${m.poster_path}`
              : "https://via.placeholder.com/185x278?text=No+Image";
            const year = m.release_date ? ` (${m.release_date.substring(0, 4)})` : "";
            return `<div style='width:120px;text-align:center;'>
              <a href='/smart-movie/movie/?q=${m.id}' target='_blank'>
                <img src='${poster}' style='width:100%;border-radius:10px;'>
                <small>${m.title}${year}</small>
              </a>
            </div>`;
          }).join("");

          const html = `
            <div style='display:flex;gap:20px;flex-wrap:wrap;'>
              <img src='${profile}' style='border-radius:10px;max-width:300px;'>
              <div>
                <h1>${personDetail.name}</h1>
                ${socialLinks ? `<p>${socialLinks}</p>` : ""}
                <p><strong>Known For:</strong> ${known}</p>
                <p><strong>Birthday:</strong> ${birthday}</p>
                <p><strong>Place of Birth:</strong> ${place}</p>
                <p><strong>Also Known As:</strong> ${aliases}</p>
                <p>${bio}</p>
              </div>
            </div>
            <hr>
            <h2>🎥 Daftar Akting</h2>
            <div style='display:flex;flex-wrap:wrap;gap:15px;'>${movieList}</div>
          `;

          container.innerHTML = html;
          document.title = `${personDetail.name} - Profile & Filmography`;
         
        });
         
    });
});
