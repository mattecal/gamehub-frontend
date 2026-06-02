import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStats, AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-pannel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pannel.html',
  styleUrls: ['./admin-pannel.css']
})
export class AdminPannelComponent implements OnInit {
  stats: AdminStats = {
    totalUsers : 0,
    activeTournaments:0,
    bannedUsers:0
  };

  isLoading = false;
  isPasswordModalOpen = false;
  oldPassword = '';
  newPassword = '';
  passwordMessage = '';
  passwordMessageType = '';

  isPromoteModalOpen = false;
  promoteUsername = '';
  promoteMessage = '';
  promoteMessageType = '';
  isPromoteLoading = false;

  isDeleteModalOpen = false;
  deleteUsername = '';
  deleteMessage = '';
  deleteMessageType = '';
  isDeleteLoading = false;

  isBanModalOpen = false;
  banUsername = '';
  banMessage = '';
  banMessageType = '';
  isBanLoading = false;

  isUnbanModalOpen = false;
  unbanUsername = '';
  unbanMessage = '';
  unbanMessageType = '';
  isUnbanLoading = false;

  constructor(private authService: AuthService, 
              private cdr: ChangeDetectorRef,
              private router : Router){}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats():void{
    this.authService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.cdr.detectChanges();
        console.log('Statistiche caricate con successo!', data);
      },
      error: (err) => {
        console.error('ERRORE NEL CARICAMENTO DELLE STATISICHE', err)
      }
    });
  }
  openPasswordModal(){
    this.isPasswordModalOpen = true;
    this.oldPassword = '';
    this.newPassword = '';
    this.passwordMessage = '';
  }

  closePasswordModal(){
    this.isPasswordModalOpen = false;
  }

  submitChangePassword(){
    if(!this.oldPassword || !this.newPassword){
      this.passwordMessage = 'COMPILA ENTRAMBI I CAMPI.';
      this.passwordMessageType = 'error';
      return;
    }

    this.isLoading = true;
    this.passwordMessage = "ELABORAZIONE IN CORSO...";
    this.passwordMessageType = '';
    this.cdr.detectChanges();

    this.authService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next:(res) => {
        this.isLoading = false;
        this.passwordMessage = 'PASSWORD AGGIORNAA CON SUCCESSO!';
        this.passwordMessageType = 'succes';

        this.cdr.detectChanges();

        setTimeout(() =>{
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
  openPromoteModal() {
    this.isPromoteModalOpen = true;
    this.promoteUsername = '';
    this.promoteMessage = '';
  }

  closePromoteModal() {
    this.isPromoteModalOpen = false;
  }

  submitPromote() {
    if (!this.promoteUsername) {
      this.promoteMessage = 'INSERISCI USERNAME VALIDO';
      this.promoteMessageType = 'error';
      return;
    }

    this.isPromoteLoading = true;
    this.promoteMessage = 'RICERCA E PROMOZIONE IN CORSO...';
    this.promoteMessageType = '';
    this.cdr.detectChanges();

    this.authService.promoteToAdmin(this.promoteUsername).subscribe({
      next: (res) => {
        this.isPromoteLoading = false;
        this.promoteMessage = res;
        this.promoteMessageType = 'success';
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.closePromoteModal();
          this.loadDashboardStats(); 
          this.cdr.detectChanges();
        }, 2500);
      },
      error: (err) => {
        this.isPromoteLoading = false;
       
        this.promoteMessage = err.error || 'ERRORE DI SISTEMA DURANTE LA PROMOZIONE.'; 
        this.promoteMessageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  openDeleteModal() {
    this.isDeleteModalOpen = true;
    this.deleteUsername = '';
    this.deleteMessage = '';
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
  }

  submitDelete() {
    if (!this.deleteUsername) {
      this.deleteMessage = 'Inserisci uno username valido.';
      this.deleteMessageType = 'error';
      return;
    }

    const confirmDelete = confirm(`ATTENZIONE: Sei sicuro di voler eliminare per sempre l'utente ${this.deleteUsername}? Questa azione è IRREVERSIBILE.`);
    if (!confirmDelete) return;

    this.isDeleteLoading = true;
    this.deleteMessage = 'ELIMINAZIONE IN CORSO...';
    this.deleteMessageType = '';
    this.cdr.detectChanges();

    this.authService.deleteUser(this.deleteUsername).subscribe({
      next: (res) => {
        if (res === 'SELF_DELETED') {
          this.authService.logout(); 
          this.router.navigate(['/login']); 
          return; 
        }

        
        this.isDeleteLoading = false;
        this.deleteMessage = res; 
        this.deleteMessageType = 'success';
        this.loadDashboardStats(); 
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.closeDeleteModal();
          this.cdr.detectChanges();
        }, 1800);
      },
      error: (err) => {
        this.isDeleteLoading = false;
        this.deleteMessage = err.error || 'Errore di sistema durante l\'eliminazione.'; 
        this.deleteMessageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  openBanModal() {
    this.isBanModalOpen = true;
    this.banUsername = '';
    this.banMessage = '';
  }

  closeBanModal() {
    this.isBanModalOpen = false;
  }

  submitBan() {
    if (!this.banUsername) {
      this.banMessage = 'Inserisci uno username valido.';
      this.banMessageType = 'error';
      return;
    }

    this.isBanLoading = true;
    this.banMessage = 'CARICAMENTO BAN HAMMER...';
    this.banMessageType = '';
    this.cdr.detectChanges();

    this.authService.banUser(this.banUsername).subscribe({
      next: (res) => {
        this.isBanLoading = false;
        this.banMessage = res; 
        this.banMessageType = 'success';
        
        this.loadDashboardStats(); 
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.closeBanModal();
          this.cdr.detectChanges();
        }, 1000);
      },
      error: (err) => {
        this.isBanLoading = false;
        this.banMessage = err.error || 'Errore di sistema durante il ban.'; 
        this.banMessageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }
  openUnbanModal() {
    this.isUnbanModalOpen = true;
    this.unbanUsername = '';
    this.unbanMessage = '';
  }

  closeUnbanModal() {
    this.isUnbanModalOpen = false;
  }

  submitUnban() {
    if (!this.unbanUsername) {
      this.unbanMessage = 'Inserisci uno username valido.';
      this.unbanMessageType = 'error';
      return;
    }

    this.isUnbanLoading = true;
    this.unbanMessage = 'RIPRISTINO ACCOUNT IN CORSO...';
    this.unbanMessageType = '';
    this.cdr.detectChanges();

    this.authService.unbanUser(this.unbanUsername).subscribe({
      next: (res) => {
        this.isUnbanLoading = false;
        this.unbanMessage = res;
        this.unbanMessageType = 'success';
        
        this.loadDashboardStats(); 
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.closeUnbanModal();
          this.cdr.detectChanges();
        }, 1000);
      },
      error: (err) => {
        this.isUnbanLoading = false;
        this.unbanMessage = err.error || 'Errore di sistema durante la riammissione.';
        this.unbanMessageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }
}