import { Component, input } from '@angular/core';

@Component({
  selector: 'app-add-btn',
  imports: [],
  templateUrl: './add-btn.html',
  styleUrl: './add-btn.scss',
})
export class AddBtn {
  reverse = input<boolean>(false);
}
