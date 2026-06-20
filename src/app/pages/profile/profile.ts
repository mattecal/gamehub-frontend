import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { Message } from '../../models/message';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  username: string = '';
  role: string = '';

  isLoading = false;

  isPasswordModalOpen = false;
  oldPassword = '';
  newPassword = '';
  passwordMessage = '';
  passwordMessageType = '';

  isDeleteModalOpen = false;
  deleteMessage = '';
  deleteMessageType = '';
  isDeleteLoading = false;

  isMessagesModalOpen = false;
  messages: Message[] = [];
  isLoadingMessages = false;

  isSendMessageModalOpen = false;
  isSendingMessage = false;
  sendMsgReceiver: any = '';
  sendMsgText = '';
  sendMsgFeedback = '';
  sendMsgFeedbackType = '';

  usersList: { id: number, username: string, role: string }[] = [];
  isLoadingUsers = false;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.username = user.username;
      this.role = user.role;
    } else {
      this.router.navigate(['/login']);
    }
  }

  openPasswordModal() {
    this.isPasswordModalOpen = true;
    this.oldPassword = '';
    this.newPassword = '';
    this.passwordMessage = '';
  }

  closePasswordModal() {
    this.isPasswordModalOpen = false;
  }

  submitChangePassword() {
    if (!this.oldPassword || !this.newPassword) {
      this.passwordMessage = 'COMPILA ENTRAMBI I CAMPI.';
      this.passwordMessageType = 'error';
      return;
    }

    this.isLoading = true;
    this.passwordMessage = "ELABORAZIONE IN CORSO...";
    this.passwordMessageType = '';
    this.cdr.detectChanges();

    this.authService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.passwordMessage = 'PASSWORD AGGIORNATA CON SUCCESSO!';
        this.passwordMessageType = 'success';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.closePasswordModal();
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.passwordMessage = "ERRORE: VECCHIA PASSWORD ERRATA";
        this.passwordMessageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  openDeleteModal() {
    this.isDeleteModalOpen = true;
    this.deleteMessage = '';
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
  }

  submitDelete() {
    this.isDeleteLoading = true;
    this.deleteMessage = 'ELIMINAZIONE IN CORSO...';
    this.deleteMessageType = '';
    this.cdr.detectChanges();

    this.authService.deleteMyAccount().subscribe({
      next: (res) => {
        if (res === 'SELF_DELETED') {
          this.isDeleteLoading = false;
          this.deleteMessage = 'Account eliminato con successo. Arrivederci!';
          this.deleteMessageType = 'success';
          this.cdr.detectChanges();

          setTimeout(() => {
            this.closeDeleteModal();
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 1800);
        }
      },
      error: (err) => {
        this.isDeleteLoading = false;
        this.deleteMessage = err.error || 'Errore di sistema durante l\'eliminazione dell\'account.';
        this.deleteMessageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  openMessagesModal() {
    this.isMessagesModalOpen = true;
    this.loadMessages();
  }

  closeMessagesModal() {
    this.isMessagesModalOpen = false;
  }

  loadMessages() {
    this.isLoadingMessages = true;
    this.cdr.detectChanges();

    this.messageService.getMessagesForCurrentUser().subscribe({
      next: (data) => {
        this.messages = data;
        this.isLoadingMessages = false;
        this.cdr.detectChanges();

        const unreadMessages = data.filter(m => !m.read);

        if (unreadMessages.length > 0) {
          unreadMessages.forEach(m => {
            this.messageService.markAsRead(m.id).subscribe({
              next: () => {
                m.read = true;
                this.cdr.detectChanges();
              }
            });
          });

          setTimeout(() => {
            this.messageService.refreshUnreadCount();
          }, 300);
        }
      },
      error: (err) => {
        console.error('Errore durante il caricamento dei messaggi', err);
        this.isLoadingMessages = false;
        this.cdr.detectChanges();
      }
    });
  }

  openSendMessageModal() {
    this.isSendMessageModalOpen = true;
    this.sendMsgReceiver = '';
    this.sendMsgText = '';
    this.sendMsgFeedback = '';
    this.loadUsers();
  }

  closeSendMessageModal() {
    this.isSendMessageModalOpen = false;
  }

  loadUsers() {
    this.isLoadingUsers = true;
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        const currentUser = this.authService.getCurrentUser()?.username;

        this.usersList = users
          .filter(u => u.username !== currentUser)
          .map((u: any) => {
            // 👑 CONTROLLO INTELLIGENTE: Cerca il ruolo ovunque possa essere nascosto nel JSON
            let ruoloRilevato = 'UTENTE';

            if (u.role) {
              ruoloRilevato = u.role;
            } else if (u.authority) {
              ruoloRilevato = u.authority;
            } else if (u.authorities && u.authorities.length > 0) {
              // Spesso Spring Security restituisce un array di authorities!
              ruoloRilevato = u.authorities[0].authority || u.authorities[0];
            } else if (u.ruolo) {
              ruoloRilevato = u.ruolo;
            }

            return {
              id: u.id,
              username: u.username,
              role: ruoloRilevato
            };
          });

        this.isLoadingUsers = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento utenti', err);
        this.isLoadingUsers = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitSendMessage() {
    if (!this.sendMsgReceiver || !this.sendMsgText) {
      this.sendMsgFeedback = 'COMPILA TUTTI I CAMPI.';
      this.sendMsgFeedbackType = 'error';
      return;
    }

    this.isSendingMessage = true;
    this.sendMsgFeedback = 'INVIO IN CORSO...';
    this.sendMsgFeedbackType = '';
    this.cdr.detectChanges();

    this.messageService.sendMessage(Number(this.sendMsgReceiver), this.sendMsgText).subscribe({
      next: () => {
        this.isSendingMessage = false;
        this.sendMsgFeedback = 'MESSAGGIO INVIATO CON SUCCESSO!';
        this.sendMsgFeedbackType = 'success';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.closeSendMessageModal();
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err) => {
        this.isSendingMessage = false;
        this.sendMsgFeedback = err.error || 'Errore durante l\'invio.';
        this.sendMsgFeedbackType = 'error';
        this.cdr.detectChanges();
      }
    });
  }
}