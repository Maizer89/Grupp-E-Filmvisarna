const affisch = (färg, text) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='600'><rect width='400' height='600' fill='${färg}'/><text x='200' y='310' font-size='34' font-family='sans-serif' fill='white' text-anchor='middle'>${text}</text></svg>`
  );

export const filmer = [
  {
    id: 1, bild: "spirited-away", title: "Spirited Away", director: "Hayao Miyazaki", actors: "Rumi Hiiragi, Miyu Irino, Mari Natsuki",
    description: "En flicka hamnar i en magisk värld full av andar och måste arbeta på ett badhus för att rädda sina föräldrar.",
    imageUrl: affisch("#7c3aed", "Spirited Away"), trailerUrl: "https://youtu.be/ByXuk9QqQkk?si=jdgo8mTg7H_h7i5B"
  },
  {
    id: 2, bild: "the-godfather", title: "The Godfather", director: "Francis Ford Coppola", actors: "Marlon Brando, Al Pacino, James Caan",
    description: "Familjen Corleones historia när makten går vidare från far till son.",
    imageUrl: affisch("#b45309", "The Godfather"), trailerUrl: "https://youtu.be/UaVTIH8mujA?si=rlh2JYuSNcSawPvC"
  },
  {
    id: 3, bild: "parasite", title: "Parasite", director: "Bong Joon-ho", actors: "Song Kang-ho, Choi Woo-shik, Park So-dam",
    description: "En fattig familj tar sig in i en rik familjs hem, med oväntade följder.",
    imageUrl: affisch("#0f766e", "Parasite"), trailerUrl: "https://youtu.be/5xH0HfJHsaY?si=5aqynuWWgGDQ3b4D"
  },
  {
    id: 4, bild: "your-name", title: "Your Name", director: "Makoto Shinkai", actors: "Ryunosuke Kamiki, Mone Kamishiraishi",
    description: "Två tonåringar som aldrig har träffats byter kropp med varandra och försöker hitta varandra.",
    imageUrl: affisch("#2563eb", "Your Name"), trailerUrl: "https://youtu.be/xU47nhruN-Q?si=Z94rMgWHpzFYTsKb"
  },
];
