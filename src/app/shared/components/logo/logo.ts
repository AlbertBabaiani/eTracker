import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  imports: [],
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
})
export class Logo {
  vertical = input<boolean>(false);
  logoLg = input<boolean>(false);
  showLogo = input<boolean>(true);
  white = input<boolean>(false);
}
