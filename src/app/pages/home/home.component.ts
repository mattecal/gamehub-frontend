import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Router } from "@angular/router";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [RouterLink]
})
export class HomeComponent implements OnInit, OnDestroy{

  @ViewChild('carousel', {static:false}) carousel!:ElementRef;
  originalGames = [
    {title: 'Dragonball', image: 'https://media.rawg.io/media/resize/640/-/screenshots/1b5/1b5662e70cb5c980350d2f6ca2978141.jpg'},
    { title: 'The Witcher 3', image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg' },
    { title: 'Cyberpunk 2077', image: 'https://media.rawg.io/media/resize/640/-/games/062/06285b425e61623530c5430f20e5d222.jpg' },
    {title: 'League of Legends', image: 'https://media.rawg.io/media/resize/640/-/games/3c7/3c773379b9a4161528bf12a2c9346e93.jpg'},
    { title: 'Minecraft', image: 'https://media.rawg.io/media/resize/640/-/games/a52/a52652c3f5e666bf0c16797ba175b034.jpg' },
    {title: 'Fortinite', image: 'https://media.rawg.io/media/resize/420/-/screenshots/c28/c286227823231c426a88aa873cf1b8d6.jpg'},
    {title: 'Valorant', image: 'https://media.rawg.io/media/resize/640/-/screenshots/a69/a694b94b5fc5141954043efc98a28a91.jpg'},
    {title: 'Naruto: Ultimate Ninja', image: 'https://media.rawg.io/media/resize/640/-/screenshots/638/638ed88e22692e1f3e5853b918b476b6.jpg'},
    { title: 'Elden Ring', image: 'https://media.rawg.io/media/resize/640/-/screenshots/0ba/0bae7160eedc1f7d85a8d2db70cf1ec9.jpg' },
    { title: 'Counter-Strike 2', image: 'https://media.rawg.io/media/resize/640/-/games/ec4/ec4b02bdb3eb5c6212992c19bc05697e.jpg' },
    {title: 'Tom Clancy s Rainbow Six Siege', image:'https://media.rawg.io/media/resize/420/-/screenshots/cde/cde4694574a78e355478cf6e438106ac.jpg'},
    {title:'Marvel s Wolverine', image:'https://media.rawg.io/media/resize/640/-/games/28d/28d61be51ec0411e24c28f71122dcaaf.jpeg'}
  ];

  carouselGames = [...this.originalGames, ...this.originalGames];
  constructor(private router:Router){}

  private autoplauInterval: any;

  ngOnInit(): void {
    this.startAutoplay();

  }
  ngOnDestroy():void{
    if(this.autoplauInterval){
      clearInterval(this.autoplauInterval);
    }
  }

  startAutoplay():void{
    this.autoplauInterval = setInterval(() => {
      if(this.carousel){
        const container = this.carousel.nativeElement;
        const scrollAmount = 320;

        if(container.scrollLeft + container.clientWidth >= container.scrollWidth - 10){
          container.scrollTo({left: 0, behavior: 'smooth'});
        }else{
          container.scrollBy({left: scrollAmount, behavoir:'smooth'});
        }
      }
    }, 3000);
  }
  vaiAiGiochi() {
    console.log("Navigo verso i giochi per:");
    this.router.navigate(['/giochi']);
  }
}