import { Component, OnInit } from '@angular/core';
import { DeviseService } from '../../services/devise.service';
import { Devise } from '../../models/devise.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-devise-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatCardModule,
    RouterModule,
  ],
  templateUrl: './devise-detail.component.html',
  styleUrls: ['./devise-detail.component.css']
})
export class DeviseDetailComponent implements OnInit {
  devise?: Devise;
  error = '';

  constructor(
    private deviseService: DeviseService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.deviseService.getDeviseById(id).subscribe({
      next: (devise) => this.devise = devise,
      error: (err) => {
        this.error = err.message;
        this.snackBar.open(this.error, 'Fermer', { duration: 3000 });
      }
    });
  }
}