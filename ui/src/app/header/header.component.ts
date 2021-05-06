import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  logoPath = '/assets/icons/logo.png';
  logout = this.authService.logout;
  constructor(private authService: AuthService) { }
}
