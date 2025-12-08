import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CalendarView } from '../../models/Calendar';

@Component({
  selector: 'app-calendar-controls',
  imports: [MatButtonModule, MatIconModule, MatButtonToggleModule],
  templateUrl: './calendar-controls.html',
  styleUrl: './calendar-controls.scss',
})
export class CalendarControls {
  label = input.required<string>();
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
