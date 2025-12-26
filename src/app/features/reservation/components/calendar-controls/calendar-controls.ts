import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CalendarView } from '../../models/Calendar';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-calendar-controls',
  imports: [MatButtonModule, MatIconModule, MatButtonToggleModule, TranslocoDirective],
  templateUrl: './calendar-controls.html',
  styleUrl: './calendar-controls.scss',
})
export class CalendarControls {
  label = input.required<string>();
  lbl = computed(() =>
    this.label()
      .split(' ')
      .map((word) =>
        (word[word.length - 1] === ',' ? word.slice(0, word.length - 1) : word).toUpperCase()
      )
  );

  currentView = input.required<CalendarView>();

  navigate = output<number>();
  viewChange = output<CalendarView>();
  today = output<void>();

  onNavigate(delta: number) {
    this.navigate.emit(delta);
  }

  onToday() {
    this.today.emit();
  }

  onChangeView(view: CalendarView) {
    this.viewChange.emit(view);
  }
}
