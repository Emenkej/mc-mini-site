async function loadData() {
  try {
    // Pobranie tabeli
    const resTable = await fetch('/.netlify/functions/football?type=table');
    const tableData = await resTable.json();

    // Pobranie meczów
    const resMatches = await fetch('/.netlify/functions/football?type=matches');
    const matchData = await resMatches.json();

    // Wyświetlenie tabeli
    const tableDiv = document.getElementById('table');
    if (tableData.standings) {
      const standings = tableData.standings[0].table;
      tableDiv.innerHTML = standings.map(
        (team) => `<p>${team.position}. ${team.team.name} (${team.points} pkt)</p>`
      ).join('');
    } else {
      tableDiv.innerHTML = "Błąd wczytywania tabeli";
    }

    // Wyświetlenie meczów
    const matchesDiv = document.getElementById('matches');
    if (matchData.matches) {
      const last = matchData.matches[0];
      const next = matchData.matches[1];
      matchesDiv.innerHTML = `
        <p>Ostatni mecz: ${last.homeTeam.name} vs ${last.awayTeam.name} (${last.score.fullTime.homeTeam ?? "-"} : ${last.score.fullTime.awayTeam ?? "-"})</p>
        <p>Następny mecz: ${next.homeTeam.name} vs ${next.awayTeam.name} (${next.utcDate})</p>
      `;
    } else {
      matchesDiv.innerHTML = "Błąd wczytywania meczów";
    }

  } catch (e) {
    console.error(e);
    document.getElementById('table').innerText = "Błąd wczytywania danych";
    document.getElementById('matches').innerText = "Błąd wczytywania danych";
  }
}

window.onload = loadData;
