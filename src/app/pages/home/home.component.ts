import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, HostListener, OnDestroy } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { CommonModule } from "@angular/common";
import { Review } from "../../models/review";
import { ReviewService } from "../../review/review.service";
import { FormsModule } from "@angular/forms";
import { ChatMessage, ChatService } from "../../services/chat.service";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, RouterLink, FormsModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  userRole: string | null = null;
  chatMessages: ChatMessage[] = [];
  newChatMessage: string = '';

  carouselGames = [
    { title: 'Dragon Ball Xenoverse', image: 'https://media.rawg.io/media/resize/640/-/games/729/729822a7ac978607241a310677c7775d.jpg' },
    { title: 'The Witcher 3', image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg' },
    { title: 'Cyberpunk 2077', image: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg' },
    { title: 'League of Legends', image: 'https://media.rawg.io/media/games/78b/78bc81e247fc7e77af700cbd632a9297.jpg' },
    { title: 'Minecraft Legends', image: 'https://media.rawg.io/media/resize/640/-/games/a52/a52652c3f5e666bf0c16797ba175b034.jpg' },
    { title: 'Fortnite Battle Royale', image: 'https://media.rawg.io/media/games/dcb/dcbb67f371a9a28ea38ffd73ee0f53f3.jpg' },
    { title: 'Valorant', image: 'https://media.rawg.io/media/games/b11/b11127b9ee3c3701bd15b9af3286d20e.jpg' },
    { title: 'NARUTO SHIPPUDEN: Ultimate Ninja STORM 3', image: 'https://media.rawg.io/media/screenshots/993/993d8949c9cc2611219267291d77cf03.jpg' },
    { title: 'Elden Ring: Shadow of the Erdtree', image: 'https://media.rawg.io/media/resize/640/-/screenshots/0ba/0bae7160eedc1f7d85a8d2db70cf1ec9.jpg' },
    { title: 'Counter-Strike 2', image: 'https://media.rawg.io/media/resize/640/-/games/ec4/ec4b02bdb3eb5c6212992c19bc05697e.jpg' },
    { title: "Rainbow Six Siege", image: 'https://media.rawg.io/media/games/b34/b3419c2706f8f8dbe40d08e23642ad06.jpg' },
    { title: "Marvel's Wolverine", image: 'https://media.rawg.io/media/resize/640/-/games/28d/28d61be51ec0411e24c28f71122dcaaf.jpeg' },
    { title: "Marvel's Spiderman 2", image: 'https://media.rawg.io/media/games/7ae/7ae5a14cdb4ab222a134c15f4629e430.jpg' },

    { title: 'Dragon Ball Xenoverse', image: 'https://media.rawg.io/media/resize/640/-/games/729/729822a7ac978607241a310677c7775d.jpg' },
    { title: 'The Witcher 3', image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg' },
    { title: 'Cyberpunk 2077', image: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg' },
    { title: 'League of Legends', image: 'https://media.rawg.io/media/games/78b/78bc81e247fc7e77af700cbd632a9297.jpg' },
    { title: 'Minecraft Legends', image: 'https://media.rawg.io/media/resize/640/-/games/a52/a52652c3f5e666bf0c16797ba175b034.jpg' },
    { title: 'Fortnite Battle Royale', image: 'https://media.rawg.io/media/games/dcb/dcbb67f371a9a28ea38ffd73ee0f53f3.jpg' },
    { title: 'Valorant', image: 'https://media.rawg.io/media/games/b11/b11127b9ee3c3701bd15b9af3286d20e.jpg' },
    { title: 'NARUTO SHIPPUDEN: Ultimate Ninja STORM 3', image: 'https://media.rawg.io/media/screenshots/993/993d8949c9cc2611219267291d77cf03.jpg' },
    { title: 'Elden Ring: Shadow of the Erdtree', image: 'https://media.rawg.io/media/resize/640/-/screenshots/0ba/0bae7160eedc1f7d85a8d2db70cf1ec9.jpg' },
    { title: 'Counter-Strike 2', image: 'https://media.rawg.io/media/resize/640/-/games/ec4/ec4b02bdb3eb5c6212992c19bc05697e.jpg' },
    { title: "Rainbow Six Siege", image: 'https://media.rawg.io/media/games/b34/b3419c2706f8f8dbe40d08e23642ad06.jpg' },
    { title: "Marvel's Wolverine", image: 'https://media.rawg.io/media/resize/640/-/games/28d/28d61be51ec0411e24c28f71122dcaaf.jpeg' },
    { title: "Marvel's Spider-Man 2", image: 'https://media.rawg.io/media/games/7ae/7ae5a14cdb4ab222a134c15f4629e430.jpg' },


  ];


  reviewsList: Review[] = [];
  isWritingReview = false;
  newComment = '';
  newRating = 5;
  reviewFeedback = '';
  currentZone = 'normal';

  constructor(
    private authService: AuthService,
    private reviewService: ReviewService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private chatService: ChatService
  ) { }

  gestisciMouse(event: MouseEvent) {
    const track = document.querySelector('.carousel-track') as HTMLElement;
    const wrapper = document.querySelector('.carousel-wrapper') as HTMLElement;
    if (!track || !wrapper) return;

    const animations = track.getAnimations();
    if (animations.length === 0) return;

    const larghezza = wrapper.offsetWidth;
    const rect = wrapper.getBoundingClientRect();
    const x = event.clientX - rect.left;

    let nuovaZona = 'center';
    if (x > larghezza * 0.75) {
      nuovaZona = 'right';
    } else if (x < larghezza * 0.25) {
      nuovaZona = 'left';
    }

    if (this.currentZone !== nuovaZona) {
      this.currentZone = nuovaZona;

      if (nuovaZona === 'right') {
        track.style.animationPlayState = 'running';
        animations[0].playbackRate = 3;
      } else if (nuovaZona === 'left') {
        track.style.animationPlayState = 'running';
        animations[0].playbackRate = 0.3;
      } else {
        track.style.animationPlayState = 'paused';
        animations[0].playbackRate = 1;
      }
    }
  }

  ripristinaCarosello(event: MouseEvent) {
    this.currentZone = 'normal';
    const track = document.querySelector('.carousel-track') as HTMLElement;
    if (!track) return;
    track.style.animationPlayState = 'running';

    const animations = track.getAnimations();
    if (animations.length > 0) {
      animations[0].playbackRate = 1;
    }
  }

  ngOnInit() {
    this.loadReviews();
    this.userRole = this.authService.getUserRole();
    this.chatService.loadHistory();
    this.chatService.connect();
    this.chatService.messages$.subscribe(msgs => {
      this.chatMessages = msgs;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.chatService.disconnect();
  }

  sendChatMessage() {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    if (this.newChatMessage.trim() !== '') {
      const currentUser = this.authService.getCurrentUser();
      const senderName = currentUser ? currentUser.username : 'Utente_Sconosciuto';

      const msg: ChatMessage = {
        sender: senderName,
        content: this.newChatMessage
      };

      this.chatService.sendMessage(msg);
      this.newChatMessage = '';
    }
  }

  loadReviews() {
    this.reviewService.getAllReviews().subscribe({
      next: (data) => {
        this.reviewsList = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Errore caricamento recensioni', err)
    });
  }

  toggleReviewForm() {
    if (!this.authService.isLoggedIn()) {
      this.reviewFeedback = 'DEVI EFFETTUARE IL LOGIN PER LASCIARE UNA RECENSIONE!';
      setTimeout(() => {
        this.reviewFeedback = ''
        this.cdr.markForCheck()
      }, 3000);
      return;
    }
    this.isWritingReview = !this.isWritingReview;
    this.newComment = '';
  }
  submitReview() {
    if (!this.newComment.trim()) return;

    this.reviewService.addReview(this.newComment, this.newRating).subscribe({
      next: (savedReview) => {
        this.reviewsList.unshift(savedReview);
        this.isWritingReview = false;
        this.newComment = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.reviewFeedback = 'ERRORE DURANTE IL SALVATAGGIO.';
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

  vaiAlGioco(titoloGioco: string) {
    this.router.navigate(['/giochi'], { queryParams: { openGame: titoloGioco } });
  }
}