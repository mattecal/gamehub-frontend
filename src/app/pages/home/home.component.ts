import { Component } from "@angular/core";
import { RouterLink, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [RouterLink]
})
export class HomeComponent {

  carouselGames = [
    { title: 'Dragonball', image: 'https://media.rawg.io/media/resize/640/-/screenshots/1b5/1b5662e70cb5c980350d2f6ca2978141.jpg' },
    { title: 'The Witcher 3', image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg' },
    { title: 'Cyberpunk 2077', image: 'https://media.rawg.io/media/resize/640/-/games/062/06285b425e61623530c5430f20e5d222.jpg' },
    { title: 'League of Legends', image: 'https://media.rawg.io/media/resize/640/-/games/3c7/3c773379b9a4161528bf12a2c9346e93.jpg' },
    { title: 'Minecraft', image: 'https://media.rawg.io/media/resize/640/-/games/a52/a52652c3f5e666bf0c16797ba175b034.jpg' },
    { title: 'Fortnite', image: 'https://media.rawg.io/media/resize/420/-/screenshots/c28/c286227823231c426a88aa873cf1b8d6.jpg' },
    { title: 'Valorant', image: 'https://media.rawg.io/media/resize/640/-/screenshots/a69/a694b94b5fc5141954043efc98a28a91.jpg' },
    { title: 'Naruto: Ultimate Ninja', image: 'https://media.rawg.io/media/resize/640/-/screenshots/638/638ed88e22692e1f3e5853b918b476b6.jpg' },
    { title: 'Elden Ring', image: 'https://media.rawg.io/media/resize/640/-/screenshots/0ba/0bae7160eedc1f7d85a8d2db70cf1ec9.jpg' },
    { title: 'Counter-Strike 2', image: 'https://media.rawg.io/media/resize/640/-/games/ec4/ec4b02bdb3eb5c6212992c19bc05697e.jpg' },
    { title: "Rainbow Six Siege", image: 'https://media.rawg.io/media/resize/420/-/screenshots/cde/cde4694574a78e355478cf6e438106ac.jpg' },
    { title: "Marvel's Wolverine", image: 'https://media.rawg.io/media/resize/640/-/games/28d/28d61be51ec0411e24c28f71122dcaaf.jpeg' },
    // Duplicati per loop infinito CSS
    { title: 'Dragonball', image: 'https://media.rawg.io/media/resize/640/-/screenshots/1b5/1b5662e70cb5c980350d2f6ca2978141.jpg' },
    { title: 'The Witcher 3', image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg' },
    { title: 'Cyberpunk 2077', image: 'https://media.rawg.io/media/resize/640/-/games/062/06285b425e61623530c5430f20e5d222.jpg' },
    { title: 'League of Legends', image: 'https://media.rawg.io/media/resize/640/-/games/3c7/3c773379b9a4161528bf12a2c9346e93.jpg' },
    { title: 'Minecraft', image: 'https://media.rawg.io/media/resize/640/-/games/a52/a52652c3f5e666bf0c16797ba175b034.jpg' },
    { title: 'Fortnite', image: 'https://media.rawg.io/media/resize/420/-/screenshots/c28/c286227823231c426a88aa873cf1b8d6.jpg' },
    { title: 'Valorant', image: 'https://media.rawg.io/media/resize/640/-/screenshots/a69/a694b94b5fc5141954043efc98a28a91.jpg' },
    { title: 'Naruto: Ultimate Ninja', image: 'https://media.rawg.io/media/resize/640/-/screenshots/638/638ed88e22692e1f3e5853b918b476b6.jpg' },
    { title: 'Elden Ring', image: 'https://media.rawg.io/media/resize/640/-/screenshots/0ba/0bae7160eedc1f7d85a8d2db70cf1ec9.jpg' },
    { title: 'Counter-Strike 2', image: 'https://media.rawg.io/media/resize/640/-/games/ec4/ec4b02bdb3eb5c6212992c19bc05697e.jpg' },
    { title: "Rainbow Six Siege", image: 'https://media.rawg.io/media/resize/420/-/screenshots/cde/cde4694574a78e355478cf6e438106ac.jpg' },
    { title: "Marvel's Wolverine", image: 'https://media.rawg.io/media/resize/640/-/games/28d/28d61be51ec0411e24c28f71122dcaaf.jpeg' },
  ];

  constructor(
    private authService : AuthService,
    private router: Router
  ){}

  gestisciCreaTorneo() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/crea-torneo']);    
    } else {
      this.router.navigate(['/login']);
      
    }
  }
}